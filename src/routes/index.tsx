import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalCV — Resumes built for the Iraqi & KRG job market" },
      {
        name: "description",
        content:
          "Trilingual resume builder for Iraq and Kurdistan. Instant LTR/RTL, regional civil-status & nationality fields, language proficiency grid, AI localization, ATS-friendly PDF for WhatsApp & Viber.",
      },
      { property: "og:title", content: "LocalCV — Resumes for Iraq & KRG" },
      {
        property: "og:description",
        content:
          "Build ATS-friendly CVs in English, Kurdish (Sorani) and Arabic. Mobile-first, WhatsApp-ready.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { dir, font } = useLang();
  return (
    <div
      dir={dir}
      className={`min-h-screen bg-background ${font} text-foreground selection:bg-accent/10`}
    >
      <Nav />
      <Hero />
      <BuilderPreview />
      <Features />
      <TrustStrip />
      <Footer />
    </div>
  );
}

function Nav() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="font-display text-xl font-bold tracking-tight truncate">
            LocalCV
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#builder" className="hover:text-foreground transition-colors">{t("nav_builder")}</a>
            <a href="#features" className="hover:text-foreground transition-colors">{t("nav_features")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("nav_ngo")}</a>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          {!loading && (
            user ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90"
              >
                {t("nav_dashboard")}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-3 py-1.5 text-xs font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90"
              >
                {t("nav_signIn")}
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  return (
    <section className="px-6 pt-16 pb-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/15 rounded-full mb-6">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
            {t("hero_badge")}
          </span>
        </div>
        <h1 className={`font-display text-5xl md:text-7xl mb-6 text-balance leading-[1.05] ${isEn ? "italic" : ""}`}>
          {t("hero_title_a")}{" "}
          <span className={`text-accent ${isEn ? "not-italic font-sans font-bold" : "font-bold"}`}>
            {t("hero_title_b")}
          </span>{" "}
          {t("hero_title_c")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-[45ch] mb-10 leading-relaxed">
          {t("hero_subtitle")}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/auth"
            className="px-8 py-4 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 transition-transform active:scale-95"
          >
            {t("hero_cta_primary")}
          </Link>
          <a
            href="#preview"
            className="px-8 py-4 border border-border font-semibold rounded-xs hover:bg-paper transition-colors"
          >
            {t("hero_cta_secondary")}
          </a>
        </div>
      </div>

      <CvCenterpiece />
    </section>
  );
}

function CvCenterpiece() {
  const { t, lang } = useLang();
  const nameValue = { en: "Zana Ahmed", ku: "زانا ئەحمەد", ar: "زانا أحمد" }[lang];
  return (
    <div
      id="preview"
      className="lg:col-span-6 animate-paper [animation-delay:200ms] relative group"
    >
      <div className="absolute -inset-4 bg-accent/5 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
      <article className="relative bg-paper aspect-[1/1.414] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/50 p-8 md:p-12 overflow-hidden">
        <header className="border-b-2 border-foreground pb-6 mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight truncate ${lang === "en" ? "uppercase" : ""}`}>
              {nameValue}
            </h2>
            <p className="text-xs md:text-sm text-accent font-mono mt-1">
              {t("cv_role")}
            </p>
          </div>
          <div className="text-end text-[10px] font-mono text-muted-foreground uppercase leading-tight shrink-0">
            {t("cv_city")}
            <br />
            {t("cv_civil_label")}: {t("cv_civil_value")}
            <br />
            {t("cv_nat_label")}: {t("cv_nat_value")}
          </div>
        </header>

        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3">
              {t("cv_section_experience")}
            </h3>
            <div>
              <div className="flex justify-between font-bold text-sm gap-2">
                <span className="truncate">{t("cv_company")}</span>
                <span className="font-mono text-xs shrink-0 text-muted-foreground">
                  {t("cv_company_dates")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("cv_company_body")}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3">
              {t("cv_section_languages")}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {[
                [t("cv_lang_sorani"), t("cv_lang_native")],
                [t("cv_lang_arabic_iraqi"), t("cv_lang_native")],
                [t("cv_lang_english_corp"), t("cv_lang_pro")],
                [t("cv_lang_badini"), t("cv_lang_conv")],
              ].map(([name, level], i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs border-b border-border/40 pb-1 gap-2"
                >
                  <span className={`font-medium truncate ${lang === "en" ? "italic" : ""}`}>{name}</span>
                  <span className="text-accent font-mono text-[10px] shrink-0">{level}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function BuilderPreview() {
  const { t, dir, lang } = useLang();
  const isEn = lang === "en";
  return (
    <section id="builder" className="bg-paper border-y border-border py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className={`text-3xl md:text-4xl font-display mb-4 leading-tight ${isEn ? "italic" : ""}`}>
              {t("builder_title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("builder_subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-sm self-start md:self-auto">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              {t("builder_direction")}
            </span>
            <span className="text-xs font-mono font-bold text-accent">
              {dir.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-background p-6 md:p-8 rounded-sm border border-border">
          <FormSide />
          <LivePreview />
        </div>
      </div>
    </section>
  );
}

function FormSide() {
  const { t, dir, lang } = useLang();
  const nameValue = { en: "Zana Ahmed", ku: "زانا ئەحمەد", ar: "زانا أحمد" }[lang];

  return (
    <div className="space-y-6" dir={dir}>
      <Field label={t("builder_field_name")} value={nameValue} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("builder_field_civil")} value={t("cv_civil_value")} as="select" />
        <Field label={t("builder_field_nat")} value={t("cv_nat_value")} />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">{t("builder_field_exp")}</label>
        <textarea
          dir={dir}
          defaultValue={t("cv_company_body")}
          className="w-full bg-paper border border-border px-4 py-3 rounded-xs h-32 outline-none focus:ring-1 focus:ring-accent transition-all leading-relaxed"
        />
      </div>
      <div className="flex items-center justify-between pt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>{t("builder_autosaved")}</span>
        <span className="text-accent">{t("builder_ai")}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  as = "input",
}: {
  label: string;
  value: string;
  as?: "input" | "select";
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2">{label}</label>
      {as === "select" ? (
        <select
          defaultValue={value}
          className="w-full bg-paper border border-border px-4 py-3 rounded-xs appearance-none outline-none focus:ring-1 focus:ring-accent"
        >
          <option>{value}</option>
        </select>
      ) : (
        <input
          type="text"
          defaultValue={value}
          className="w-full bg-paper border border-border px-4 py-3 rounded-xs outline-none focus:ring-1 focus:ring-accent"
        />
      )}
    </div>
  );
}

function LivePreview() {
  const { t, dir, lang } = useLang();
  const nameValue = { en: "Zana Ahmed", ku: "زانا ئەحمەد", ar: "زانا أحمد" }[lang];

  return (
    <div className="hidden lg:flex flex-col">
      <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
        <span>{t("builder_live")}</span>
        <span className="text-accent">{dir.toUpperCase()}</span>
      </div>
      <article
        dir={dir}
        className="bg-paper border border-border shadow-sm flex-1 p-8"
      >
        <header className="border-b-2 border-foreground pb-4 mb-6">
          <h3 className={`text-xl font-bold tracking-tight ${lang === "en" ? "uppercase" : ""}`}>
            {nameValue}
          </h3>
          <p className="text-xs text-accent font-mono mt-1">{t("cv_role")}</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
            {t("cv_city")} · {t("cv_civil_value")} · {t("cv_nat_value")}
          </p>
        </header>
        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-widest border-b border-border pb-1 mb-3">
            {t("builder_field_exp")}
          </h4>
          <p className="text-xs leading-relaxed">{t("cv_company_body")}</p>
        </section>
        <div className="mt-8 pt-4 border-t border-border/40 flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>localcv.iq</span>
          <span>{t("builder_ats")}</span>
        </div>
      </article>
    </div>
  );
}

function Features() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  const items = [
    { tag: "01", title: t("feat_1_t"), body: t("feat_1_b") },
    { tag: "02", title: t("feat_2_t"), body: t("feat_2_b") },
    { tag: "03", title: t("feat_3_t"), body: t("feat_3_b") },
    { tag: "04", title: t("feat_4_t"), body: t("feat_4_b") },
    { tag: "05", title: t("feat_5_t"), body: t("feat_5_b") },
    { tag: "06", title: t("feat_6_t"), body: t("feat_6_b") },
  ];
  return (
    <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
          {t("features_eyebrow")}
        </p>
        <h2 className={`text-3xl md:text-5xl font-display leading-tight text-balance ${isEn ? "italic" : ""}`}>
          {t("features_title")}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {items.map((f) => (
          <article
            key={f.tag}
            className="bg-background p-8 hover:bg-paper transition-colors"
          >
            <div className="flex items-baseline justify-between mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {f.tag}
              </span>
              <span className="size-1.5 rounded-full bg-accent" />
            </div>
            <h3 className="font-display text-xl mb-3 leading-snug">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustStrip() {
  const { t } = useLang();
  const names = ["UNAMI", "Shell Iraq", "KRG Ministries", "TotalEnergies", "Save the Children", "WFP", "Basra Gas"];
  return (
    <div className="py-12 px-6 border-y border-border bg-paper">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-muted-foreground shrink-0">
          {t("trust_label")}
        </span>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold tracking-tight text-foreground/60">
          {names.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  return (
    <footer className="px-6 py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h4 className={`font-display text-2xl mb-6 ${isEn ? "italic" : ""}`}>LocalCV</h4>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {t("footer_about")}
          </p>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            {t("footer_product")}
          </h5>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_templates")}</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_ats")}</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_ai_loc")}</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            {t("footer_market")}
          </h5>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_trends")}</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_laws")}</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">{t("footer_ngo")}</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>{t("footer_copy")}</span>
        <div className="flex gap-6">
          <a href="#">{t("footer_privacy")}</a>
          <a href="#">{t("footer_terms")}</a>
          <a href="#">{t("footer_support")}</a>
        </div>
      </div>
    </footer>
  );
}
