import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { w } from "@/lib/cv-wizard-strings";
import { TEMPLATES, type TemplateId, type CvLang } from "@/lib/cv-types";
import { generateCv } from "@/lib/cv-generate.functions";

export const Route = createFileRoute("/_authenticated/cv/$id/design")({
  head: () => ({ meta: [{ title: "Design your CV · Pîşe" }] }),
  component: DesignPicker,
});

const LANG_OPTIONS: { id: CvLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ku", label: "کوردی (Sorani)" },
  { id: "ar", label: "العربية" },
];

function DesignPicker() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { lang, dir, font } = useLang();
  const callGenerate = useServerFn(generateCv);

  const [template, setTemplate] = useState<TemplateId>("classic");
  const [picked, setPicked] = useState<CvLang[]>(["en", "ar"]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cv_drafts")
        .select("template, output_languages")
        .eq("cv_id", id)
        .maybeSingle();
      if (data) {
        setTemplate((data.template as TemplateId) ?? "classic");
        const out = (data.output_languages ?? ["en"]) as CvLang[];
        setPicked(out.length ? out.slice(0, 3) : ["en"]);
      }
      setLoading(false);
    })();
  }, [id]);

  function toggleLang(l: CvLang) {
    setPicked((prev) => {
      if (prev.includes(l)) {
        const next = prev.filter((x) => x !== l);
        return next.length ? next : prev; // keep at least 1
      }
      if (prev.length >= 3) return prev;
      return [...prev, l];
    });
  }

  async function generate() {
    if (picked.length < 1) {
      toast.error(w(lang, "pick_at_least_one"));
      return;
    }
    setBusy(true);
    await supabase
      .from("cv_drafts")
      .update({ template, output_languages: picked })
      .eq("cv_id", id);
    try {
      await callGenerate({ data: { cvId: id, languages: picked } });
      toast.success(w(lang, "toast_generated"));
      navigate({ to: "/cv/$id/preview", params: { id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
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
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/cv/$id/build", params: { id } })}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← {w(lang, "back")}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <section className="mb-16">
          <h1 className="font-display text-3xl md:text-4xl mb-2">{w(lang, "design_title")}</h1>
          <p className="text-muted-foreground mb-8">{w(lang, "design_sub")}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {TEMPLATES.map((tpl) => {
              const active = template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl.id)}
                  className={`p-5 text-start bg-paper hover:bg-background transition-colors ${active ? "ring-2 ring-accent ring-inset" : ""}`}
                >
                  <TemplateThumb id={tpl.id} />
                  <p className="mt-3 text-[10px] font-mono uppercase tracking-widest text-accent">
                    {active ? "Selected" : "Template"}
                  </p>
                  <h3 className="font-display text-lg mt-1">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.note}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-2">{w(lang, "langs_title")}</h2>
          <p className="text-muted-foreground mb-6">{w(lang, "langs_sub")}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {LANG_OPTIONS.map((opt) => {
              const active = picked.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleLang(opt.id)}
                  className={`p-4 border rounded-xs text-start transition-colors ${active ? "border-accent bg-accent/5" : "border-border bg-paper hover:bg-background"}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {active ? `#${picked.indexOf(opt.id) + 1}` : "Pick"}
                  </span>
                  <p className="text-lg font-display mt-1">{opt.label}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={generate}
            disabled={busy || picked.length < 1}
            className="mt-10 w-full md:w-auto px-8 py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 disabled:opacity-40"
          >
            {busy ? w(lang, "generating") : w(lang, "generate_btn")}
          </button>
        </section>
      </main>
    </div>
  );
}

function TemplateThumb({ id }: { id: TemplateId }) {
  const base = "w-full aspect-[3/4] bg-background border border-border p-3 flex flex-col gap-1.5";
  if (id === "classic") {
    return (
      <div className={base}>
        <div className="h-3 w-2/3 bg-foreground/80 font-serif" />
        <div className="h-1.5 w-1/3 bg-foreground/40" />
        <div className="mt-2 h-px bg-foreground/30" />
        <div className="h-1.5 w-full bg-foreground/20" />
        <div className="h-1.5 w-5/6 bg-foreground/20" />
        <div className="h-1.5 w-2/3 bg-foreground/20" />
      </div>
    );
  }
  if (id === "modern") {
    return (
      <div className={base}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-accent" />
          <div className="h-3 w-1/2 bg-foreground/80" />
        </div>
        <div className="h-1.5 w-1/3 bg-foreground/40 ms-3" />
        <div className="mt-3 h-1.5 w-full bg-foreground/20" />
        <div className="h-1.5 w-5/6 bg-foreground/20" />
        <div className="h-1.5 w-3/4 bg-foreground/20" />
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className={base}>
        <div className="h-2 w-1/2 bg-foreground/90" />
        <div className="h-1 w-1/4 bg-foreground/40" />
        <div className="mt-4 h-1 w-full bg-foreground/20" />
        <div className="h-1 w-full bg-foreground/20" />
        <div className="h-1 w-2/3 bg-foreground/20" />
      </div>
    );
  }
  return (
    <div className={base}>
      <div className="grid grid-cols-[1fr_2fr] gap-2 h-full">
        <div className="space-y-1">
          <div className="h-2 w-full bg-foreground/60" />
          <div className="h-1 w-3/4 bg-foreground/30" />
          <div className="h-1 w-2/3 bg-foreground/30" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-foreground/20" />
          <div className="h-1.5 w-5/6 bg-foreground/20" />
          <div className="h-1.5 w-3/4 bg-foreground/20" />
          <div className="h-1.5 w-2/3 bg-foreground/20" />
        </div>
      </div>
    </div>
  );
}
