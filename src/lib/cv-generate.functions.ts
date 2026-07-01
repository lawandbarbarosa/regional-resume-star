import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { CvLang, GeneratedByLang, WizardAnswers } from "./cv-types";

const LANG_NAME: Record<CvLang, string> = {
  en: "English",
  ku: "Kurdish (Sorani script)",
  ar: "Arabic (Modern Standard)",
};

const cvSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    city: z.string(),
  }),
  meta: z.object({
    nationality: z.string().optional(),
    civilStatus: z.string().optional(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      dates: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      dates: z.string(),
    }),
  ),
  skills: z.array(z.string()),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
});

function buildPrompt(answers: WizardAnswers, lang: CvLang) {
  return `You are a professional CV writer for the Iraqi and KRG private sector (NGOs, oil & gas, government). Rewrite the candidate's raw answers into a polished, ATS-friendly CV in ${LANG_NAME[lang]}.

Rules:
- Output ONLY in ${LANG_NAME[lang]}. Translate every field, including job titles, company descriptions, summary, skills, and language proficiency levels.
- Preserve proper nouns (company names, schools, cities, the candidate's own name) but transliterate if needed for the target language.
- Turn experience descriptions into 2-4 short impact bullets each, using strong corporate verbs.
- Keep dates in the candidate's original format.
- Tone: confident, professional, regionally appropriate.

You MUST return a single JSON object matching EXACTLY this shape (same keys, same nesting, no extra keys, no markdown fences, no commentary):
{
  "fullName": string,
  "headline": string,
  "contact": { "email": string, "phone": string, "city": string },
  "meta": { "nationality": string, "civilStatus": string },
  "summary": string,
  "experience": [ { "role": string, "company": string, "dates": string, "bullets": [string] } ],
  "education": [ { "degree": string, "school": string, "dates": string } ],
  "skills": [string],
  "languages": [ { "name": string, "level": string } ]
}
If a field is unknown, use an empty string "" — never null, never omit the key. Arrays may be empty but must be present.

Candidate raw answers (JSON):
${JSON.stringify(answers, null, 2)}`;
}

export const generateCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        cvId: z.string().uuid(),
        languages: z.array(z.enum(["en", "ku", "ar"])).length(2),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: draft, error } = await supabase
      .from("cv_drafts")
      .select("answers, template")
      .eq("cv_id", data.cvId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!draft) throw new Error("Draft not found");

    const answers = draft.answers as WizardAnswers;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const generated: GeneratedByLang = {};
    for (const lang of data.languages) {
      try {
        const { experimental_output } = await generateText({
          model,
          experimental_output: Output.object({ schema: cvSchema }),
          prompt: buildPrompt(answers, lang),
        });
        generated[lang] = experimental_output as GeneratedByLang[CvLang];
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in workspace billing.");
        if (msg.includes("429")) throw new Error("AI rate limit reached. Please try again in a moment.");
        throw e;
      }
    }

    const { error: upErr } = await supabase
      .from("cv_drafts")
      .update({
        generated: JSON.parse(JSON.stringify(generated)),
        output_languages: data.languages,
      })
      .eq("cv_id", data.cvId)
      .eq("user_id", userId);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, generated };
  });
