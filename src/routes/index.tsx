import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CvCenterpiece } from "@/components/marketing/CvCenterpiece";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { CtaBand } from "@/components/marketing/PageHero";

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
  return (
    <MarketingShell>
      <Hero />
      <TrustStrip />
      <Highlights />
      <HowItWorks />
      <PricingTeaser />
      <FinalCta />
    </MarketingShell>
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
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent">{t("hero_badge")}</span>
        </div>
        <h1
          className={`font-display text-5xl md:text-7xl mb-6 text-balance leading-[1.05] ${isEn ? "italic" : ""}`}
        >
          {t("hero_title_a")}{" "}
          <span className={`text-accent ${isEn ? "not-italic font-sans font-bold" : "font-bold"}`}>
            {t("hero_title_b")}
          </span>{" "}
          {t("hero_title_c")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-[45ch] mb-10 leading-relaxed">{t("hero_subtitle")}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/auth"
            className="px-8 py-4 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 transition-transform active:scale-95"
          >
            {t("hero_cta_primary")}
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-4 border border-border font-semibold rounded-xs hover:bg-paper transition-colors"
          >
            {t("home_pricing_cta")}
          </Link>
        </div>
      </div>
      <CvCenterpiece />
    </section>
  );
}

function Highlights() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  const items = [
    { title: t("home_highlight_1_t"), body: t("home_highlight_1_b"), to: "/faq" as const },
    { title: t("home_highlight_2_t"), body: t("home_highlight_2_b"), to: "/about" as const },
    { title: t("home_highlight_3_t"), body: t("home_highlight_3_b"), to: "/about" as const },
  ];
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{t("home_highlight_eyebrow")}</p>
      <h2 className={`font-display text-3xl md:text-5xl mb-12 leading-tight max-w-2xl ${isEn ? "italic" : ""}`}>
        {t("home_highlight_title")}
      </h2>
      <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="bg-background p-8 hover:bg-paper transition-colors group block"
          >
            <span className="size-1.5 rounded-full bg-accent mb-6 block" />
            <h3 className="font-display text-xl mb-3 leading-snug">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.body}</p>
            <span className="text-xs font-semibold text-accent group-hover:underline">{t("home_highlight_learn")}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  const steps = [
    { n: "01", title: t("home_how_1_t"), body: t("home_how_1_b") },
    { n: "02", title: t("home_how_2_t"), body: t("home_how_2_b") },
    { n: "03", title: t("home_how_3_t"), body: t("home_how_3_b") },
    { n: "04", title: t("home_how_4_t"), body: t("home_how_4_b") },
  ];
  return (
    <section className="bg-paper border-y border-border py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{t("home_how_eyebrow")}</p>
        <h2 className={`font-display text-3xl md:text-4xl mb-12 max-w-xl leading-tight ${isEn ? "italic" : ""}`}>
          {t("home_how_title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <article key={s.n}>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.n}</span>
              <h3 className="font-display text-lg mt-3 mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  return (
    <section className="px-6 py-24 max-w-3xl mx-auto text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{t("home_pricing_eyebrow")}</p>
      <h2 className={`font-display text-3xl md:text-5xl mb-6 ${isEn ? "italic" : ""}`}>{t("home_pricing_title")}</h2>
      <p className="text-muted-foreground leading-relaxed mb-8">{t("home_pricing_body")}</p>
      <Link
        to="/pricing"
        className="inline-flex px-8 py-4 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90"
      >
        {t("home_pricing_cta")}
      </Link>
    </section>
  );
}

function FinalCta() {
  const { t } = useLang();
  return (
    <CtaBand
      eyebrow={t("home_cta_eyebrow")}
      title={t("home_cta_title")}
      body={t("home_cta_body")}
      to="/auth"
      label={t("home_cta_btn")}
    />
  );
}
