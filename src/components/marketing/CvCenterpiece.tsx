import { useLang } from "@/i18n/LanguageProvider";

export function CvCenterpiece() {
  const { t, lang } = useLang();
  const nameValue = { en: "Zana Ahmed", ku: "زانا ئەحمەد", ar: "زانا أحمد" }[lang];

  return (
    <div id="preview" className="lg:col-span-6 animate-paper [animation-delay:200ms] relative group">
      <div className="absolute -inset-4 bg-accent/5 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
      <article className="relative bg-paper aspect-[1/1.414] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/50 p-8 md:p-12 overflow-hidden">
        <header className="border-b-2 border-foreground pb-6 mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2
              className={`text-xl md:text-2xl font-bold tracking-tight truncate ${lang === "en" ? "uppercase" : ""}`}
            >
              {nameValue}
            </h2>
            <p className="text-xs md:text-sm text-accent font-mono mt-1">{t("cv_role")}</p>
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
                <span className="font-mono text-xs shrink-0 text-muted-foreground">{t("cv_company_dates")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t("cv_company_body")}</p>
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
