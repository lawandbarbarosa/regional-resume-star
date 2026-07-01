import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageHero } from "@/components/marketing/PageHero";
import { WHATSAPP_URL } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  validateSearch: (s: Record<string, unknown>) => ({
    section: typeof s.section === "string" ? s.section : undefined,
  }),
  head: () => ({
    meta: [
      { title: "FAQ & Support · LocalCV" },
      { name: "description", content: "Help center for LocalCV — languages, AI, PDF, pricing, and privacy." },
    ],
  }),
  component: FaqPage,
});

type FaqItem = { q: string; a: string };

function FaqPage() {
  const { t } = useLang();
  const { section } = Route.useSearch();

  const categories: { id: string; label: string; items: FaqItem[] }[] = [
    {
      id: "start",
      label: t("faq_cat_start"),
      items: [
        { q: t("faq_start_1_q"), a: t("faq_start_1_a") },
        { q: t("faq_start_2_q"), a: t("faq_start_2_a") },
        { q: t("faq_start_3_q"), a: t("faq_start_3_a") },
      ],
    },
    {
      id: "languages",
      label: t("faq_cat_languages"),
      items: [
        { q: t("faq_lang_1_q"), a: t("faq_lang_1_a") },
        { q: t("faq_lang_2_q"), a: t("faq_lang_2_a") },
        { q: t("faq_lang_3_q"), a: t("faq_lang_3_a") },
        { q: t("faq_lang_4_q"), a: t("faq_lang_4_a") },
      ],
    },
    {
      id: "ai",
      label: t("faq_cat_ai"),
      items: [
        { q: t("faq_ai_1_q"), a: t("faq_ai_1_a") },
        { q: t("faq_ai_2_q"), a: t("faq_ai_2_a") },
        { q: t("faq_ai_3_q"), a: t("faq_ai_3_a") },
      ],
    },
    {
      id: "pdf",
      label: t("faq_cat_pdf"),
      items: [
        { q: t("faq_pdf_1_q"), a: t("faq_pdf_1_a") },
        { q: t("faq_pdf_2_q"), a: t("faq_pdf_2_a") },
        { q: t("faq_pdf_3_q"), a: t("faq_pdf_3_a") },
      ],
    },
    {
      id: "payment",
      label: t("faq_cat_payment"),
      items: [
        { q: t("faq_pay_1_q"), a: t("faq_pay_1_a") },
        { q: t("faq_pay_2_q"), a: t("faq_pay_2_a") },
        { q: t("faq_pay_3_q"), a: t("faq_pay_3_a") },
      ],
    },
    {
      id: "privacy",
      label: t("faq_cat_privacy"),
      items: [
        { q: t("faq_priv_1_q"), a: t("faq_priv_1_a") },
        { q: t("faq_priv_2_q"), a: t("faq_priv_2_a") },
        { q: t("faq_priv_3_q"), a: t("faq_priv_3_a") },
      ],
    },
  ];

  const defaultOpen = section === "privacy" ? "privacy-0" : undefined;

  return (
    <MarketingShell>
      <PageHero eyebrow={t("faq_hero_eyebrow")} title={t("faq_hero_title")} body={t("faq_hero_body")} />

      <div className="px-6 pb-24 max-w-3xl mx-auto space-y-16">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <h2 className="text-sm font-mono uppercase tracking-widest text-accent mb-6">{cat.label}</h2>
            <Accordion type="single" collapsible defaultValue={cat.id === section ? defaultOpen : undefined}>
              {cat.items.map((item, i) => (
                <AccordionItem key={i} value={`${cat.id}-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <section className="px-6 py-20 bg-paper border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{t("faq_support_eyebrow")}</p>
          <h2 className="font-display text-2xl md:text-3xl mb-4">{t("faq_support_title")}</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{t("faq_support_body")}</p>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 text-sm"
            >
              {t("faq_support_btn")}
            </a>
            <span className="text-xs text-muted-foreground font-mono uppercase">{t("faq_support_or")}</span>
            <Link to="/pricing" className="text-sm font-semibold text-accent hover:underline">
              {t("faq_support_pricing")}
            </Link>
            <Link to="/auth" className="text-sm font-semibold text-accent hover:underline">
              {t("faq_support_signin")}
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
