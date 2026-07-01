import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { w } from "@/lib/cv-wizard-strings";
import type { CvLang, GeneratedByLang, GeneratedCV, TemplateId } from "@/lib/cv-types";
import { generateCv } from "@/lib/cv-generate.functions";

export const Route = createFileRoute("/_authenticated/cv/$id/preview")({
  head: () => ({ meta: [{ title: "Your CV · LocalCV" }] }),
  component: PreviewPage,
});

const LANG_DIR: Record<CvLang, "ltr" | "rtl"> = { en: "ltr", ku: "rtl", ar: "rtl" };
const LANG_FONT: Record<CvLang, string> = { en: "font-sans", ku: "font-arabic", ar: "font-arabic" };

function PreviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { lang, dir, font } = useLang();
  const callGenerate = useServerFn(generateCv);

  const [generated, setGenerated] = useState<GeneratedByLang | null>(null);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [outLangs, setOutLangs] = useState<CvLang[]>(["en", "ar"]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [printLang, setPrintLang] = useState<CvLang>("en");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cv_drafts")
        .select("generated, template, output_languages")
        .eq("cv_id", id)
        .maybeSingle();
      if (data) {
        setGenerated((data.generated as GeneratedByLang | null) ?? null);
        setTemplate((data.template as TemplateId) ?? "classic");
        const out = (data.output_languages ?? ["en", "ar"]) as CvLang[];
        setOutLangs(out);
        setPrintLang(out[0] ?? "en");
      }
      setLoading(false);
    })();
  }, [id]);

  async function regen() {
    setBusy(true);
    try {
      const res = await callGenerate({ data: { cvId: id, languages: outLangs } });
      setGenerated(res.generated);
      toast.success(w(lang, "toast_generated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function doPrint() {
    document.documentElement.dataset.printLang = printLang;
    window.print();
  }

  if (loading) {
    return (
      <div dir={dir} className={`min-h-screen bg-background grid place-items-center ${font}`}>
        <div className="text-sm font-mono text-muted-foreground">…</div>
      </div>
    );
  }

  return (
    <div dir={dir} className={`min-h-screen bg-background ${font}`}>
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate({ to: "/cv/$id/build", params: { id } })}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← {w(lang, "preview_edit")}
          </button>
          <div className="flex-1" />
          <LanguageSwitcher />
          <button
            onClick={regen}
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold border border-border rounded-xs hover:bg-paper disabled:opacity-40"
          >
            {busy ? "…" : w(lang, "preview_regen")}
          </button>
          {outLangs.length > 1 && (
            <select
              value={printLang}
              onChange={(e) => setPrintLang(e.target.value as CvLang)}
              className="px-3 py-2 text-xs border border-border rounded-xs bg-paper"
            >
              {outLangs.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          )}
          <button
            onClick={doPrint}
            disabled={!generated}
            className="px-5 py-2 text-xs font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90 disabled:opacity-40"
          >
            {w(lang, "preview_download")}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 print:p-0 print:max-w-none">
        {!generated ? (
          <div className="text-center py-20 text-muted-foreground">{w(lang, "preview_empty")}</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 print:block">
            {outLangs.map((l) => {
              const cv = generated[l];
              if (!cv) return null;
              return (
                <div
                  key={l}
                  data-cv-lang={l}
                  className={`cv-sheet bg-white text-black shadow-sm ${LANG_FONT[l]}`}
                  dir={LANG_DIR[l]}
                >
                  <CvRender template={template} cv={cv} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        .cv-sheet {
          padding: 2.5rem;
          min-height: 1056px; /* ~A4 at 96dpi */
          max-width: 816px;
          margin: 0 auto;
        }
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .cv-sheet { box-shadow: none; margin: 0; max-width: none; }
          [data-cv-lang] { display: none; }
          html[data-print-lang="en"] [data-cv-lang="en"],
          html[data-print-lang="ku"] [data-cv-lang="ku"],
          html[data-print-lang="ar"] [data-cv-lang="ar"] { display: block; page-break-after: always; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- templates ---------------- */

function CvRender({ template, cv }: { template: TemplateId; cv: GeneratedCV }) {
  if (template === "modern") return <Modern cv={cv} />;
  if (template === "minimal") return <Minimal cv={cv} />;
  if (template === "compact") return <Compact cv={cv} />;
  return <Classic cv={cv} />;
}

function ContactLine({ cv }: { cv: GeneratedCV }) {
  const parts = [cv.contact.email, cv.contact.phone, cv.contact.city, cv.meta.nationality, cv.meta.civilStatus].filter(Boolean);
  return <p className="text-sm opacity-70 leading-relaxed">{parts.join(" · ")}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-black/70 pb-1 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Classic({ cv }: { cv: GeneratedCV }) {
  return (
    <div className="font-serif">
      <h1 className="text-3xl font-bold">{cv.fullName}</h1>
      <p className="text-lg italic mt-1">{cv.headline}</p>
      <div className="mt-2"><ContactLine cv={cv} /></div>
      {cv.summary && <p className="mt-4 leading-relaxed">{cv.summary}</p>}
      <ExperienceBlock cv={cv} />
      <EducationBlock cv={cv} />
      <SkillsBlock cv={cv} />
      <LanguagesBlock cv={cv} />
    </div>
  );
}

function Modern({ cv }: { cv: GeneratedCV }) {
  return (
    <div className="font-sans">
      <div className="border-s-4 border-black ps-4">
        <h1 className="text-3xl font-bold">{cv.fullName}</h1>
        <p className="text-base opacity-80 mt-1">{cv.headline}</p>
      </div>
      <div className="mt-3"><ContactLine cv={cv} /></div>
      {cv.summary && <p className="mt-4 leading-relaxed">{cv.summary}</p>}
      <ExperienceBlock cv={cv} />
      <EducationBlock cv={cv} />
      <SkillsBlock cv={cv} />
      <LanguagesBlock cv={cv} />
    </div>
  );
}

function Minimal({ cv }: { cv: GeneratedCV }) {
  return (
    <div className="font-sans">
      <h1 className="text-4xl font-light tracking-tight">{cv.fullName}</h1>
      <p className="text-sm uppercase tracking-widest opacity-60 mt-2">{cv.headline}</p>
      <div className="mt-3"><ContactLine cv={cv} /></div>
      {cv.summary && <p className="mt-6 leading-relaxed">{cv.summary}</p>}
      <ExperienceBlock cv={cv} />
      <EducationBlock cv={cv} />
      <SkillsBlock cv={cv} />
      <LanguagesBlock cv={cv} />
    </div>
  );
}

function Compact({ cv }: { cv: GeneratedCV }) {
  return (
    <div className="font-sans grid grid-cols-[1fr_2fr] gap-6">
      <aside>
        <h1 className="text-2xl font-bold">{cv.fullName}</h1>
        <p className="text-sm opacity-70 mt-1">{cv.headline}</p>
        <p className="text-xs mt-3 leading-relaxed opacity-80">{[cv.contact.email, cv.contact.phone, cv.contact.city].filter(Boolean).join("\n")}</p>
        <SkillsBlock cv={cv} compact />
        <LanguagesBlock cv={cv} compact />
      </aside>
      <main>
        {cv.summary && <p className="leading-relaxed text-sm">{cv.summary}</p>}
        <ExperienceBlock cv={cv} />
        <EducationBlock cv={cv} />
      </main>
    </div>
  );
}

function ExperienceBlock({ cv }: { cv: GeneratedCV }) {
  if (!cv.experience.length) return null;
  return (
    <Section title="Experience">
      {cv.experience.map((j, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{j.role} — {j.company}</p>
            <span className="text-xs opacity-70 shrink-0">{j.dates}</span>
          </div>
          <ul className="list-disc ms-5 mt-1 space-y-0.5 text-sm">
            {j.bullets.map((b, k) => <li key={k}>{b}</li>)}
          </ul>
        </div>
      ))}
    </Section>
  );
}

function EducationBlock({ cv }: { cv: GeneratedCV }) {
  if (!cv.education.length) return null;
  return (
    <Section title="Education">
      {cv.education.map((e, i) => (
        <div key={i} className="flex items-baseline justify-between gap-3 mb-1.5">
          <p className="text-sm"><span className="font-semibold">{e.degree}</span> — {e.school}</p>
          <span className="text-xs opacity-70 shrink-0">{e.dates}</span>
        </div>
      ))}
    </Section>
  );
}

function SkillsBlock({ cv, compact }: { cv: GeneratedCV; compact?: boolean }) {
  if (!cv.skills.length) return null;
  if (compact) {
    return (
      <div className="mt-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-2">Skills</h2>
        <ul className="text-xs space-y-0.5">{cv.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>
    );
  }
  return (
    <Section title="Skills">
      <p className="text-sm">{cv.skills.join(" · ")}</p>
    </Section>
  );
}

function LanguagesBlock({ cv, compact }: { cv: GeneratedCV; compact?: boolean }) {
  if (!cv.languages.length) return null;
  if (compact) {
    return (
      <div className="mt-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-2">Languages</h2>
        <ul className="text-xs space-y-0.5">
          {cv.languages.map((l, i) => <li key={i}>{l.name} — {l.level}</li>)}
        </ul>
      </div>
    );
  }
  return (
    <Section title="Languages">
      <p className="text-sm">{cv.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
    </Section>
  );
}
