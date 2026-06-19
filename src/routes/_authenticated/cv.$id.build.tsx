import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { w } from "@/lib/cv-wizard-strings";
import { EMPTY_ANSWERS, type WizardAnswers } from "@/lib/cv-types";

export const Route = createFileRoute("/_authenticated/cv/$id/build")({
  head: () => ({ meta: [{ title: "Build your CV · LocalCV" }] }),
  component: BuildWizard,
});

const TOTAL_STEPS = 8;

function BuildWizard() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { lang, dir, font } = useLang();

  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // ensure draft exists, hydrate
      const { data: existing } = await supabase
        .from("cv_drafts")
        .select("answers, current_step")
        .eq("cv_id", id)
        .maybeSingle();
      if (existing) {
        setAnswers({ ...EMPTY_ANSWERS, ...(existing.answers as Partial<WizardAnswers>) });
        setStep(existing.current_step ?? 0);
      } else {
        await supabase.from("cv_drafts").insert({
          cv_id: id,
          user_id: user.id,
          answers: EMPTY_ANSWERS,
          current_step: 0,
        });
      }
      setLoading(false);
    })();
  }, [id, user.id]);

  async function persist(next: WizardAnswers, nextStep: number) {
    setSaving(true);
    const { error } = await supabase
      .from("cv_drafts")
      .update({ answers: next, current_step: nextStep })
      .eq("cv_id", id);
    if (error) toast.error(error.message);

    // update CV title to a friendlier value if possible
    if (next.fullName || next.headline) {
      const title = [next.fullName, next.headline].filter(Boolean).join(" · ") || "Untitled CV";
      await supabase.from("cvs").update({ title }).eq("id", id);
    }
    setSaving(false);
  }

  async function goNext() {
    const next = Math.min(step + 1, TOTAL_STEPS - 1);
    await persist(answers, next);
    setStep(next);
  }

  async function goBack() {
    const prev = Math.max(step - 1, 0);
    setStep(prev);
    await persist(answers, prev);
  }

  async function saveExit() {
    await persist(answers, step);
    toast.success(w(lang, "toast_saved"));
    navigate({ to: "/dashboard" });
  }

  async function finish() {
    await persist(answers, TOTAL_STEPS - 1);
    navigate({ to: "/cv/$id/design", params: { id } });
  }

  const update = <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const StepBody = useMemo(() => {
    switch (step) {
      case 0: return <Step1 answers={answers} update={update} />;
      case 1: return <Step2 answers={answers} update={update} />;
      case 2: return <Step3 answers={answers} update={update} />;
      case 3: return <Step4 answers={answers} update={update} />;
      case 4: return <Step5 answers={answers} update={update} />;
      case 5: return <Step6 answers={answers} update={update} />;
      case 6: return <Step7 answers={answers} update={update} />;
      case 7: return <Step8 answers={answers} />;
      default: return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, answers, lang]);

  if (loading) {
    return (
      <div dir={dir} className={`min-h-screen bg-background grid place-items-center ${font}`}>
        <div className="text-sm font-mono text-muted-foreground">…</div>
      </div>
    );
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div dir={dir} className={`min-h-screen bg-background ${font} flex flex-col`}>
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={saveExit}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← {w(lang, "save_exit")}
          </button>
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 md:py-20">
        <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-6">
          {w(lang, "step_of", { n: step + 1, total: TOTAL_STEPS })}
        </p>
        {StepBody}
      </main>

      <footer className="border-t border-border bg-paper">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="px-5 py-2.5 text-sm font-semibold border border-border rounded-xs disabled:opacity-30 hover:bg-background"
          >
            {w(lang, "back")}
          </button>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {saving ? "…" : ""}
          </span>
          <button
            onClick={isLast ? finish : goNext}
            className="px-6 py-2.5 text-sm font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90"
          >
            {isLast ? w(lang, "s8_continue") : w(lang, "continue")}
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ---------- shared inputs ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-5">
      <span className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-paper border border-border rounded-xs px-4 py-3 text-base focus:outline-none focus:border-accent transition-colors";

/* ---------- steps ---------- */

type StepProps = {
  answers: WizardAnswers;
  update: <K extends keyof WizardAnswers>(k: K, v: WizardAnswers[K]) => void;
};

function StepTitle({ k }: { k: string }) {
  const { lang } = useLang();
  return <h1 className="font-display text-3xl md:text-4xl leading-tight mb-2">{w(lang, k)}</h1>;
}
function StepSub({ k }: { k: string }) {
  const { lang } = useLang();
  return <p className="text-muted-foreground mb-8">{w(lang, k)}</p>;
}

function Step1({ answers, update }: StepProps) {
  const { lang } = useLang();
  return (
    <>
      <StepTitle k="s1_title" />
      <StepSub k="s1_sub" />
      <Field label={w(lang, "s1_name")}>
        <input className={inputCls} value={answers.fullName} onChange={(e) => update("fullName", e.target.value)} autoFocus />
      </Field>
      <Field label={w(lang, "s1_headline")}>
        <input
          className={inputCls}
          value={answers.headline}
          placeholder={w(lang, "s1_headline_ph")}
          onChange={(e) => update("headline", e.target.value)}
        />
      </Field>
    </>
  );
}

function Step2({ answers, update }: StepProps) {
  const { lang } = useLang();
  return (
    <>
      <StepTitle k="s2_title" />
      <div className="grid sm:grid-cols-2 gap-x-6 mt-6">
        <Field label={w(lang, "s2_email")}>
          <input type="email" className={inputCls} value={answers.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label={w(lang, "s2_phone")}>
          <input className={inputCls} value={answers.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+9647..." />
        </Field>
        <Field label={w(lang, "s2_city")}>
          <input className={inputCls} value={answers.city} onChange={(e) => update("city", e.target.value)} />
        </Field>
        <Field label={w(lang, "s2_nat")}>
          <input className={inputCls} value={answers.nationality} onChange={(e) => update("nationality", e.target.value)} />
        </Field>
        <Field label={w(lang, "s2_civil")}>
          <select className={inputCls} value={answers.civilStatus} onChange={(e) => update("civilStatus", e.target.value)}>
            <option value="">—</option>
            <option value={w(lang, "civil_single")}>{w(lang, "civil_single")}</option>
            <option value={w(lang, "civil_married")}>{w(lang, "civil_married")}</option>
            <option value={w(lang, "civil_divorced")}>{w(lang, "civil_divorced")}</option>
            <option value={w(lang, "civil_prefer")}>{w(lang, "civil_prefer")}</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function Step3({ answers, update }: StepProps) {
  const { lang } = useLang();
  return (
    <>
      <StepTitle k="s3_title" />
      <StepSub k="s3_sub" />
      <textarea
        className={`${inputCls} min-h-[160px] leading-relaxed`}
        value={answers.summary}
        onChange={(e) => update("summary", e.target.value)}
        placeholder={w(lang, "s3_ph")}
        autoFocus
      />
    </>
  );
}

function Step4({ answers, update }: StepProps) {
  const { lang } = useLang();
  const list = answers.experience;
  function addOne() {
    update("experience", [...list, { role: "", company: "", dates: "", description: "" }]);
  }
  function patch(i: number, key: keyof WizardAnswers["experience"][number], v: string) {
    const copy = list.slice();
    copy[i] = { ...copy[i], [key]: v };
    update("experience", copy);
  }
  function remove(i: number) {
    update("experience", list.filter((_, idx) => idx !== i));
  }
  return (
    <>
      <StepTitle k="s4_title" />
      <StepSub k="s4_sub" />
      {list.length === 0 && (
        <button onClick={addOne} className="w-full border border-dashed border-border rounded-xs py-6 text-sm text-muted-foreground hover:bg-paper">
          {w(lang, "s4_add")}
        </button>
      )}
      {list.map((job, i) => (
        <div key={i} className="border border-border rounded-xs p-5 mb-4 bg-paper">
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label={w(lang, "s4_role")}>
              <input className={inputCls} value={job.role} onChange={(e) => patch(i, "role", e.target.value)} />
            </Field>
            <Field label={w(lang, "s4_company")}>
              <input className={inputCls} value={job.company} onChange={(e) => patch(i, "company", e.target.value)} />
            </Field>
          </div>
          <Field label={w(lang, "s4_dates")}>
            <input className={inputCls} value={job.dates} onChange={(e) => patch(i, "dates", e.target.value)} />
          </Field>
          <Field label={w(lang, "s4_desc")}>
            <textarea
              className={`${inputCls} min-h-[100px]`}
              value={job.description}
              onChange={(e) => patch(i, "description", e.target.value)}
            />
          </Field>
          <button onClick={() => remove(i)} className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-destructive">
            {w(lang, "s4_remove")}
          </button>
        </div>
      ))}
      {list.length > 0 && (
        <button onClick={addOne} className="w-full border border-dashed border-border rounded-xs py-4 text-sm text-muted-foreground hover:bg-paper">
          {w(lang, "s4_add")}
        </button>
      )}
    </>
  );
}

function Step5({ answers, update }: StepProps) {
  const { lang } = useLang();
  const list = answers.education;
  function addOne() {
    update("education", [...list, { degree: "", school: "", dates: "" }]);
  }
  function patch(i: number, k: keyof WizardAnswers["education"][number], v: string) {
    const copy = list.slice();
    copy[i] = { ...copy[i], [k]: v };
    update("education", copy);
  }
  function remove(i: number) {
    update("education", list.filter((_, idx) => idx !== i));
  }
  return (
    <>
      <StepTitle k="s5_title" />
      {list.length === 0 && (
        <button onClick={addOne} className="mt-6 w-full border border-dashed border-border rounded-xs py-6 text-sm text-muted-foreground hover:bg-paper">
          {w(lang, "s5_add")}
        </button>
      )}
      {list.map((ed, i) => (
        <div key={i} className="border border-border rounded-xs p-5 mb-4 bg-paper mt-6">
          <Field label={w(lang, "s5_degree")}>
            <input className={inputCls} value={ed.degree} onChange={(e) => patch(i, "degree", e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label={w(lang, "s5_school")}>
              <input className={inputCls} value={ed.school} onChange={(e) => patch(i, "school", e.target.value)} />
            </Field>
            <Field label={w(lang, "s5_dates")}>
              <input className={inputCls} value={ed.dates} onChange={(e) => patch(i, "dates", e.target.value)} />
            </Field>
          </div>
          <button onClick={() => remove(i)} className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-destructive">
            {w(lang, "s4_remove")}
          </button>
        </div>
      ))}
      {list.length > 0 && (
        <button onClick={addOne} className="w-full border border-dashed border-border rounded-xs py-4 text-sm text-muted-foreground hover:bg-paper">
          {w(lang, "s5_add")}
        </button>
      )}
    </>
  );
}

function Step6({ answers, update }: StepProps) {
  const { lang } = useLang();
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!answers.skills.includes(v)) update("skills", [...answers.skills, v]);
    setDraft("");
  }
  return (
    <>
      <StepTitle k="s6_title" />
      <StepSub k="s6_sub" />
      <input
        className={inputCls}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={w(lang, "s6_ph")}
        autoFocus
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {answers.skills.map((s, i) => (
          <button
            key={i}
            onClick={() => update("skills", answers.skills.filter((_, idx) => idx !== i))}
            className="px-3 py-1.5 border border-border bg-paper text-sm rounded-xs hover:bg-background"
          >
            {s} ×
          </button>
        ))}
      </div>
    </>
  );
}

function Step7({ answers, update }: StepProps) {
  const { lang } = useLang();
  const list = answers.languages;
  const levels = [w(lang, "lvl_native"), w(lang, "lvl_pro"), w(lang, "lvl_conv"), w(lang, "lvl_basic")];
  function addOne() {
    update("languages", [...list, { name: "", level: levels[1] }]);
  }
  function patch(i: number, k: "name" | "level", v: string) {
    const copy = list.slice();
    copy[i] = { ...copy[i], [k]: v };
    update("languages", copy);
  }
  function remove(i: number) {
    update("languages", list.filter((_, idx) => idx !== i));
  }
  return (
    <>
      <StepTitle k="s7_title" />
      <StepSub k="s7_sub" />
      {list.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3">
          <input className={inputCls} value={l.name} onChange={(e) => patch(i, "name", e.target.value)} placeholder={w(lang, "s7_name")} />
          <select className={inputCls} value={l.level} onChange={(e) => patch(i, "level", e.target.value)}>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <button onClick={() => remove(i)} className="px-3 border border-border rounded-xs text-sm hover:bg-paper">×</button>
        </div>
      ))}
      <button onClick={addOne} className="w-full border border-dashed border-border rounded-xs py-4 text-sm text-muted-foreground hover:bg-paper">
        {w(lang, "s7_add")}
      </button>
    </>
  );
}

function Step8({ answers }: { answers: WizardAnswers }) {
  return (
    <>
      <StepTitle k="s8_title" />
      <StepSub k="s8_sub" />
      <div className="space-y-4 text-sm">
        <ReviewRow label="Name" value={answers.fullName} />
        <ReviewRow label="Headline" value={answers.headline} />
        <ReviewRow label="Email" value={answers.email} />
        <ReviewRow label="Phone" value={answers.phone} />
        <ReviewRow label="City" value={answers.city} />
        <ReviewRow label="Nationality" value={answers.nationality} />
        <ReviewRow label="Civil status" value={answers.civilStatus} />
        <ReviewRow label="Summary" value={answers.summary} />
        <ReviewRow label="Experience" value={`${answers.experience.length} jobs`} />
        <ReviewRow label="Education" value={`${answers.education.length} entries`} />
        <ReviewRow label="Skills" value={answers.skills.join(", ")} />
        <ReviewRow label="Languages" value={answers.languages.map((l) => `${l.name} (${l.level})`).join(", ")} />
      </div>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border pb-3">
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}
