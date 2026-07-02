import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

type SectionKey = "summary" | "experience" | "education" | "skills" | "languages";
const DEFAULT_ORDER: SectionKey[] = ["summary", "experience", "education", "skills", "languages"];

const FONT_OPTIONS = [
  { id: "serif", label: "Serif (Playfair)", css: '"Playfair Display", Georgia, serif' },
  { id: "sans", label: "Sans (Inter)", css: '"Inter", system-ui, sans-serif' },
  { id: "mono", label: "Mono (JetBrains)", css: '"JetBrains Mono", ui-monospace, monospace' },
  { id: "georgia", label: "Georgia", css: "Georgia, 'Times New Roman', serif" },
  { id: "helvetica", label: "Helvetica", css: "Helvetica, Arial, sans-serif" },
] as const;

type Customization = {
  accent: string;
  text: string;
  bg: string;
  fontId: string;
  fontSize: number; // px
  lineHeight: number;
  sectionGap: number; // px
  padding: number; // px
  headerAlign: "start" | "center" | "end";
  uppercaseHeadings: boolean;
  showDivider: boolean;
  order: SectionKey[];
  visible: Record<SectionKey, boolean>;
};

const DEFAULT_CUST: Customization = {
  accent: "#0f766e",
  text: "#111111",
  bg: "#ffffff",
  fontId: "serif",
  fontSize: 14,
  lineHeight: 1.55,
  sectionGap: 24,
  padding: 40,
  headerAlign: "start",
  uppercaseHeadings: true,
  showDivider: true,
  order: DEFAULT_ORDER,
  visible: { summary: true, experience: true, education: true, skills: true, languages: true },
};

function loadCust(id: string): Customization {
  try {
    const raw = localStorage.getItem(`cv-cust-${id}`);
    if (!raw) return DEFAULT_CUST;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CUST, ...parsed, visible: { ...DEFAULT_CUST.visible, ...(parsed.visible ?? {}) } };
  } catch {
    return DEFAULT_CUST;
  }
}

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
  const [cust, setCust] = useState<Customization>(DEFAULT_CUST);
  const [panelOpen, setPanelOpen] = useState(true);

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
      setCust(loadCust(id));
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!loading) localStorage.setItem(`cv-cust-${id}`, JSON.stringify(cust));
  }, [cust, id, loading]);

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

  const fontCss = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === cust.fontId)?.css ?? FONT_OPTIONS[0].css,
    [cust.fontId],
  );

  const sheetStyle: React.CSSProperties = {
    ["--cv-accent" as string]: cust.accent,
    ["--cv-text" as string]: cust.text,
    ["--cv-bg" as string]: cust.bg,
    ["--cv-font" as string]: fontCss,
    ["--cv-size" as string]: `${cust.fontSize}px`,
    ["--cv-line" as string]: cust.lineHeight,
    ["--cv-gap" as string]: `${cust.sectionGap}px`,
    ["--cv-pad" as string]: `${cust.padding}px`,
    ["--cv-align" as string]: cust.headerAlign,
    ["--cv-heading-transform" as string]: cust.uppercaseHeadings ? "uppercase" : "none",
    ["--cv-heading-border" as string]: cust.showDivider ? "1px solid currentColor" : "none",
  };

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate({ to: "/cv/$id/build", params: { id } })}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← {w(lang, "preview_edit")}
          </button>
          <div className="flex-1" />
          <LanguageSwitcher />
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="px-4 py-2 text-xs font-semibold border border-border rounded-xs hover:bg-paper"
          >
            {panelOpen ? "×" : "⚙"} {w(lang, "cust_title")}
          </button>
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

      <main className="max-w-7xl mx-auto px-6 py-8 print:p-0 print:max-w-none flex gap-6 items-start">
        {panelOpen && (
          <aside className="w-72 shrink-0 sticky top-24 print:hidden">
            <CustomizePanel lang={lang} cust={cust} setCust={setCust} />
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {!generated ? (
            <div className="text-center py-20 text-muted-foreground">{w(lang, "preview_empty")}</div>
          ) : (
            <div className={`grid gap-6 print:block ${outLangs.length > 1 && !panelOpen ? "lg:grid-cols-2" : "grid-cols-1"}`}>
              {outLangs.map((l) => {
                const cv = generated[l];
                if (!cv) return null;
                return (
                  <div
                    key={l}
                    data-cv-lang={l}
                    className={`cv-sheet shadow-sm ${LANG_FONT[l]}`}
                    dir={LANG_DIR[l]}
                    style={sheetStyle}
                  >
                    <CvRender template={template} cv={cv} cust={cust} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .cv-sheet {
          background: var(--cv-bg);
          color: var(--cv-text);
          font-family: var(--cv-font);
          font-size: var(--cv-size);
          line-height: var(--cv-line);
          padding: var(--cv-pad);
          min-height: 1056px;
          max-width: 816px;
          margin: 0 auto;
        }
        .cv-sheet .cv-heading {
          text-transform: var(--cv-heading-transform);
          border-bottom: var(--cv-heading-border);
          color: var(--cv-accent);
          letter-spacing: 0.16em;
          font-weight: 700;
          font-size: 0.75rem;
          padding-bottom: 4px;
          margin-bottom: 10px;
        }
        .cv-sheet .cv-header { text-align: var(--cv-align); }
        .cv-sheet .cv-section + .cv-section { margin-top: var(--cv-gap); }
        .cv-sheet .cv-accent { color: var(--cv-accent); }
        .cv-sheet .cv-accent-bg { background: var(--cv-accent); }
        .cv-sheet a { color: inherit; }
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .cv-sheet { box-shadow: none; margin: 0; max-width: none; min-height: auto; }
          [data-cv-lang] { display: none; }
          html[data-print-lang="en"] [data-cv-lang="en"],
          html[data-print-lang="ku"] [data-cv-lang="ku"],
          html[data-print-lang="ar"] [data-cv-lang="ar"] { display: block; page-break-after: always; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- customize panel ---------------- */

function CustomizePanel({
  lang,
  cust,
  setCust,
}: {
  lang: ReturnType<typeof useLang>["lang"];
  cust: Customization;
  setCust: React.Dispatch<React.SetStateAction<Customization>>;
}) {
  function move(key: SectionKey, dir: -1 | 1) {
    setCust((c) => {
      const i = c.order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.order.length) return c;
      const next = [...c.order];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...c, order: next };
    });
  }

  return (
    <div className="border border-border rounded-xs bg-paper p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">{w(lang, "cust_title")}</h3>
        <button
          onClick={() => setCust(DEFAULT_CUST)}
          className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          {w(lang, "cust_reset")}
        </button>
      </div>

      <ColorRow label={w(lang, "cust_accent")} value={cust.accent} onChange={(v) => setCust((c) => ({ ...c, accent: v }))} />
      <ColorRow label={w(lang, "cust_text")} value={cust.text} onChange={(v) => setCust((c) => ({ ...c, text: v }))} />
      <ColorRow label={w(lang, "cust_bg")} value={cust.bg} onChange={(v) => setCust((c) => ({ ...c, bg: v }))} />

      <Field label={w(lang, "cust_font")}>
        <select
          value={cust.fontId}
          onChange={(e) => setCust((c) => ({ ...c, fontId: e.target.value }))}
          className="w-full px-2 py-1.5 text-xs border border-border rounded-xs bg-background"
        >
          {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </Field>

      <Slider label={w(lang, "cust_size")} min={10} max={20} value={cust.fontSize} onChange={(v) => setCust((c) => ({ ...c, fontSize: v }))} suffix="px" />
      <Slider label={w(lang, "cust_line")} min={1.1} max={2} step={0.05} value={cust.lineHeight} onChange={(v) => setCust((c) => ({ ...c, lineHeight: v }))} />
      <Slider label={w(lang, "cust_space")} min={8} max={48} value={cust.sectionGap} onChange={(v) => setCust((c) => ({ ...c, sectionGap: v }))} suffix="px" />
      <Slider label={w(lang, "cust_pad")} min={16} max={80} value={cust.padding} onChange={(v) => setCust((c) => ({ ...c, padding: v }))} suffix="px" />

      <Field label={w(lang, "cust_align")}>
        <div className="grid grid-cols-3 gap-1">
          {(["start", "center", "end"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setCust((c) => ({ ...c, headerAlign: a }))}
              className={`px-2 py-1.5 text-xs border rounded-xs ${cust.headerAlign === a ? "border-foreground bg-foreground text-primary-foreground" : "border-border bg-background"}`}
            >
              {w(lang, `cust_align_${a}`)}
            </button>
          ))}
        </div>
      </Field>

      <Toggle label={w(lang, "cust_upper")} value={cust.uppercaseHeadings} onChange={(v) => setCust((c) => ({ ...c, uppercaseHeadings: v }))} />
      <Toggle label={w(lang, "cust_divider")} value={cust.showDivider} onChange={(v) => setCust((c) => ({ ...c, showDivider: v }))} />

      <div className="mt-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{w(lang, "cust_sections")}</p>
        <div className="space-y-1">
          {cust.order.map((k, i) => (
            <div key={k} className="flex items-center gap-1 border border-border rounded-xs bg-background px-2 py-1.5">
              <span className="text-xs flex-1 capitalize">{k}</span>
              <button
                onClick={() => setCust((c) => ({ ...c, visible: { ...c.visible, [k]: !c.visible[k] } }))}
                className="text-[10px] px-1.5 py-0.5 border border-border rounded-xs hover:bg-paper"
                title={cust.visible[k] ? w(lang, "cust_hide") : w(lang, "cust_show")}
              >
                {cust.visible[k] ? "👁" : "∅"}
              </button>
              <button
                onClick={() => move(k, -1)}
                disabled={i === 0}
                className="text-[10px] px-1.5 py-0.5 border border-border rounded-xs hover:bg-paper disabled:opacity-30"
              >↑</button>
              <button
                onClick={() => move(k, 1)}
                disabled={i === cust.order.length - 1}
                className="text-[10px] px-1.5 py-0.5 border border-border rounded-xs hover:bg-paper disabled:opacity-30"
              >↓</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 rounded-xs border border-border bg-transparent cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-border rounded-xs bg-background font-mono" />
      </div>
    </Field>
  );
}

function Slider({ label, min, max, step = 1, value, onChange, suffix }: { label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <Field label={<span className="flex justify-between"><span>{label}</span><span className="text-foreground">{value}{suffix ?? ""}</span></span> as unknown as string}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-foreground" />
    </Field>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-xs">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors ${value ? "bg-foreground" : "bg-border"}`}
      >
        <span className={`block w-4 h-4 bg-background rounded-full transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

/* ---------------- templates ---------------- */

function CvRender({ template, cv, cust }: { template: TemplateId; cv: GeneratedCV; cust: Customization }) {
  const sections = cust.order.filter((k) => cust.visible[k]).map((k) => <SectionBlock key={k} which={k} cv={cv} />);
  const header = <HeaderBlock template={template} cv={cv} />;
  if (template === "compact") {
    return (
      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <aside>
          {header}
          {cust.visible.skills && <SectionBlock which="skills" cv={cv} compact />}
          {cust.visible.languages && <SectionBlock which="languages" cv={cv} compact />}
        </aside>
        <main>
          {cust.order.filter((k) => k !== "skills" && k !== "languages" && cust.visible[k]).map((k) => (
            <SectionBlock key={k} which={k} cv={cv} />
          ))}
        </main>
      </div>
    );
  }
  return (
    <div>
      {header}
      {sections}
    </div>
  );
}

function HeaderBlock({ template, cv }: { template: TemplateId; cv: GeneratedCV }) {
  if (template === "modern") {
    return (
      <div className="cv-header mb-2">
        <div className="flex items-center gap-3">
          <span className="cv-accent-bg" style={{ width: 4, alignSelf: "stretch", minHeight: 40 }} />
          <div>
            <h1 className="text-3xl font-bold leading-tight">{cv.fullName}</h1>
            <p className="text-base opacity-80 mt-1">{cv.headline}</p>
          </div>
        </div>
        <div className="mt-3"><ContactLine cv={cv} /></div>
      </div>
    );
  }
  if (template === "minimal") {
    return (
      <div className="cv-header mb-2">
        <h1 className="text-4xl font-light tracking-tight">{cv.fullName}</h1>
        <p className="text-sm uppercase tracking-widest opacity-60 mt-2">{cv.headline}</p>
        <div className="mt-3"><ContactLine cv={cv} /></div>
      </div>
    );
  }
  if (template === "compact") {
    return (
      <div className="cv-header mb-2">
        <h1 className="text-2xl font-bold">{cv.fullName}</h1>
        <p className="text-sm opacity-70 mt-1">{cv.headline}</p>
        <p className="text-xs mt-3 leading-relaxed opacity-80 whitespace-pre-line">{[cv.contact.email, cv.contact.phone, cv.contact.city].filter(Boolean).join("\n")}</p>
      </div>
    );
  }
  return (
    <div className="cv-header mb-2">
      <h1 className="text-3xl font-bold">{cv.fullName}</h1>
      <p className="text-lg italic mt-1">{cv.headline}</p>
      <div className="mt-2"><ContactLine cv={cv} /></div>
    </div>
  );
}

function ContactLine({ cv }: { cv: GeneratedCV }) {
  const parts = [cv.contact.email, cv.contact.phone, cv.contact.city, cv.meta.nationality, cv.meta.civilStatus].filter(Boolean);
  return <p className="text-sm opacity-70 leading-relaxed">{parts.join(" · ")}</p>;
}

function SectionBlock({ which, cv, compact }: { which: SectionKey; cv: GeneratedCV; compact?: boolean }) {
  if (which === "summary") {
    if (!cv.summary) return null;
    return <section className="cv-section"><p className="leading-relaxed">{cv.summary}</p></section>;
  }
  if (which === "experience") {
    if (!cv.experience.length) return null;
    return (
      <section className="cv-section">
        <h2 className="cv-heading">Experience</h2>
        {cv.experience.map((j, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">{j.role} — {j.company}</p>
              <span className="text-xs opacity-70 shrink-0">{j.dates}</span>
            </div>
            <ul className="list-disc ms-5 mt-1 space-y-0.5">
              {j.bullets.map((b, k) => <li key={k}>{b}</li>)}
            </ul>
          </div>
        ))}
      </section>
    );
  }
  if (which === "education") {
    if (!cv.education.length) return null;
    return (
      <section className="cv-section">
        <h2 className="cv-heading">Education</h2>
        {cv.education.map((e, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 mb-1.5">
            <p><span className="font-semibold">{e.degree}</span> — {e.school}</p>
            <span className="text-xs opacity-70 shrink-0">{e.dates}</span>
          </div>
        ))}
      </section>
    );
  }
  if (which === "skills") {
    if (!cv.skills.length) return null;
    if (compact) {
      return (
        <section className="cv-section">
          <h2 className="cv-heading">Skills</h2>
          <ul className="text-xs space-y-0.5">{cv.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      );
    }
    return (
      <section className="cv-section">
        <h2 className="cv-heading">Skills</h2>
        <p>{cv.skills.join(" · ")}</p>
      </section>
    );
  }
  if (which === "languages") {
    if (!cv.languages.length) return null;
    if (compact) {
      return (
        <section className="cv-section">
          <h2 className="cv-heading">Languages</h2>
          <ul className="text-xs space-y-0.5">
            {cv.languages.map((l, i) => <li key={i}>{l.name} — {l.level}</li>)}
          </ul>
        </section>
      );
    }
    return (
      <section className="cv-section">
        <h2 className="cv-heading">Languages</h2>
        <p>{cv.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
      </section>
    );
  }
  return null;
}
