import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { WHATSAPP_URL } from "@/lib/constants";

export function MarketingFooter() {
  const { t, lang } = useLang();
  const isEn = lang === "en";

  return (
    <footer className="px-6 py-20 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h4 className={`font-display text-2xl mb-6 ${isEn ? "italic" : ""}`}>Pîşe</h4>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{t("footer_about")}</p>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            {t("footer_product")}
          </h5>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/pricing" className="hover:text-accent transition-colors">
                {t("nav_pricing")}
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-accent transition-colors">
                {t("nav_faq")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-accent transition-colors">
                {t("nav_about")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            {t("footer_support_col")}
          </h5>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                {t("footer_support")}
              </a>
            </li>
            <li>
              <Link to="/faq" className="hover:text-accent transition-colors">
                {t("footer_faq_link")}
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-accent transition-colors">
                {t("nav_signIn")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>{t("footer_copy")}</span>
        <div className="flex flex-wrap gap-6">
          <Link to="/faq" search={{ section: "privacy" }} className="hover:text-foreground">
            {t("footer_privacy")}
          </Link>
          <Link to="/faq" className="hover:text-foreground">
            {t("footer_terms")}
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            {t("footer_support")}
          </a>
        </div>
      </div>
    </footer>
  );
}
