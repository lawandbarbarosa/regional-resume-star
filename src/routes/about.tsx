import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageHero, SectionEyebrow, SectionTitle, CtaBand } from "@/components/marketing/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · LocalCV" },
      {
        name: "description",
        content: "Learn why LocalCV was built for the Iraqi and KRG job markets.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLang();
  return (
    <MarketingShell>
      <PageHero eyebrow={t("about_hero_eyebrow")} title={t("about_hero_title")} body={t("about_hero_body")} />

      <section className="px-6 py-16 max-w-3xl mx-auto border-t border-border">
        <SectionEyebrow>{t("about_problem_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("about_problem_title")}</SectionTitle>
        <p className="text-muted-foreground leading-relaxed">{t("about_problem_body")}</p>
      </section>

      <section className="px-6 py-16 bg-paper border-y border-border">
        <div className="max-w-7xl mx-auto">
          <SectionEyebrow>{t("about_approach_eyebrow")}</SectionEyebrow>
          <SectionTitle>{t("about_approach_title")}</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              { t: t("about_approach_1_t"), b: t("about_approach_1_b") },
              { t: t("about_approach_2_t"), b: t("about_approach_2_b") },
              { t: t("about_approach_3_t"), b: t("about_approach_3_b") },
            ].map((item) => (
              <article key={item.t} className="bg-background border border-border p-8">
                <h3 className="font-display text-lg mb-3">{item.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-7xl mx-auto">
        <SectionEyebrow>{t("about_serve_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("about_serve_title")}</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mt-8">
          {[t("about_serve_1"), t("about_serve_2"), t("about_serve_3"), t("about_serve_4")].map((label) => (
            <div key={label} className="bg-paper p-6 text-sm font-medium leading-snug">
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-paper border-y border-border">
        <div className="max-w-7xl mx-auto">
          <SectionEyebrow>{t("about_values_eyebrow")}</SectionEyebrow>
          <SectionTitle>{t("about_values_title")}</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {[
              { t: t("about_values_1_t"), b: t("about_values_1_b") },
              { t: t("about_values_2_t"), b: t("about_values_2_b") },
              { t: t("about_values_3_t"), b: t("about_values_3_b") },
            ].map((item) => (
              <article key={item.t}>
                <h3 className="font-display text-lg mb-2">{item.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-7xl mx-auto">
        <SectionEyebrow>{t("about_regions_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("about_regions_title")}</SectionTitle>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            t("about_regions_erbil"),
            t("about_regions_baghdad"),
            t("about_regions_south"),
          ].map((text) => (
            <div key={text} className="border border-border p-6 bg-background text-sm leading-relaxed text-muted-foreground">
              {text}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 border-t border-border max-w-7xl mx-auto">
        <SectionEyebrow>{t("about_timeline_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("about_timeline_title")}</SectionTitle>
        <div className="grid md:grid-cols-2 gap-12 mt-10">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-widest text-accent mb-4">{t("about_timeline_live")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>· {t("about_timeline_live_1")}</li>
              <li>· {t("about_timeline_live_2")}</li>
              <li>· {t("about_timeline_live_3")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {t("about_timeline_next")}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>· {t("about_timeline_next_1")}</li>
              <li>· {t("about_timeline_next_2")}</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={t("about_hero_eyebrow")}
        title={t("about_cta_title")}
        body={t("about_hero_body")}
        to="/pricing"
        label={t("about_cta_btn")}
      />
    </MarketingShell>
  );
}
