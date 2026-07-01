import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageHero, SectionEyebrow, SectionTitle } from "@/components/marketing/PageHero";
import { CheckoutButton } from "@/components/marketing/CheckoutButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PlanStatus } from "@/lib/constants";

export const Route = createFileRoute("/pricing")({
  validateSearch: (s: Record<string, unknown>) => ({
    payment: typeof s.payment === "string" ? s.payment : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pricing · LocalCV" },
      { name: "description", content: "$10 one-time for lifetime access to LocalCV." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const { payment } = Route.useSearch();
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);

  useEffect(() => {
    if (payment === "cancelled") toast.message(t("pricing_toast_cancelled"));
  }, [payment, t]);

  useEffect(() => {
    if (!user) {
      setPlanStatus(null);
      return;
    }
    supabase
      .from("profiles")
      .select("plan_status")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setPlanStatus((data?.plan_status as PlanStatus) ?? "free"));
  }, [user]);

  const includes = [
    t("pricing_inc_1"),
    t("pricing_inc_2"),
    t("pricing_inc_3"),
    t("pricing_inc_4"),
    t("pricing_inc_5"),
    t("pricing_inc_6"),
    t("pricing_inc_7"),
    t("pricing_inc_8"),
    t("pricing_inc_9"),
    t("pricing_inc_10"),
  ];

  const compareRows: { feature: string; localcv: boolean; canva: boolean; generic: boolean; word: boolean }[] = [
    { feature: t("pricing_row_rtl"), localcv: true, canva: false, generic: false, word: true },
    { feature: t("pricing_row_regional"), localcv: true, canva: false, generic: false, word: true },
    { feature: t("pricing_row_ats"), localcv: true, canva: false, generic: true, word: true },
    { feature: t("pricing_row_ai"), localcv: true, canva: false, generic: false, word: false },
    { feature: t("pricing_row_bilingual"), localcv: true, canva: false, generic: false, word: false },
    { feature: t("pricing_row_whatsapp"), localcv: true, canva: true, generic: false, word: true },
    { feature: t("pricing_row_price"), localcv: true, canva: false, generic: false, word: true },
  ];

  const pricingFaqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    q: t(`pricing_faq_${i}_q` as "pricing_faq_1_q"),
    a: t(`pricing_faq_${i}_a` as "pricing_faq_1_a"),
  }));

  return (
    <MarketingShell>
      <PageHero eyebrow={t("pricing_hero_eyebrow")} title={t("pricing_hero_title")} body={t("pricing_hero_body")}>
        <CheckoutButton planStatus={planStatus} className="mx-auto" />
      </PageHero>

      <section className="px-6 pb-16 max-w-lg mx-auto">
        <article className="border-2 border-foreground bg-paper p-8 md:p-10 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">{t("pricing_plan_name")}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display text-5xl font-bold">{t("pricing_plan_price")}</span>
            <span className="text-sm text-muted-foreground font-mono uppercase">{t("pricing_plan_period")}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">{t("pricing_plan_tagline")}</p>
          <CheckoutButton planStatus={planStatus} className="w-full" />
        </article>
      </section>

      <section className="px-6 py-16 bg-paper border-y border-border">
        <div className="max-w-2xl mx-auto">
          <SectionEyebrow>{t("pricing_included_eyebrow")}</SectionEyebrow>
          <ul className="space-y-3 mt-6">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <Check className="size-4 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16 max-w-5xl mx-auto overflow-x-auto">
        <SectionEyebrow>{t("pricing_compare_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("pricing_compare_title")}</SectionTitle>
        <table className="w-full mt-8 text-sm border border-border">
          <thead>
            <tr className="bg-paper border-b border-border">
              <th className="text-start p-4 font-mono text-[10px] uppercase tracking-widest">{t("pricing_compare_feature")}</th>
              <th className="p-4 font-semibold">{t("pricing_compare_localcv")}</th>
              <th className="p-4 text-muted-foreground">{t("pricing_compare_canva")}</th>
              <th className="p-4 text-muted-foreground">{t("pricing_compare_generic")}</th>
              <th className="p-4 text-muted-foreground">{t("pricing_compare_word")}</th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.feature} className="border-b border-border last:border-0">
                <td className="p-4 text-muted-foreground">{row.feature}</td>
                <td className="p-4 text-center"><CellIcon ok={row.localcv} /></td>
                <td className="p-4 text-center"><CellIcon ok={row.canva} /></td>
                <td className="p-4 text-center"><CellIcon ok={row.generic} /></td>
                <td className="p-4 text-center"><CellIcon ok={row.word} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="px-6 py-16 max-w-2xl mx-auto border-t border-border">
        <SectionEyebrow>{t("pricing_faq_eyebrow")}</SectionEyebrow>
        <SectionTitle>{t("pricing_faq_title")}</SectionTitle>
        <Accordion type="single" collapsible className="mt-8">
          {pricingFaqs.map((faq, i) => (
            <AccordionItem key={i} value={`p-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </MarketingShell>
  );
}

function CellIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="size-4 text-accent mx-auto" />
  ) : (
    <X className="size-4 text-muted-foreground/40 mx-auto" />
  );
}
