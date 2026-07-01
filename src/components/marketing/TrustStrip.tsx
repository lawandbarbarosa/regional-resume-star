import { useLang } from "@/i18n/LanguageProvider";

const NAMES = [
  "UNAMI",
  "Shell Iraq",
  "KRG Ministries",
  "TotalEnergies",
  "Save the Children",
  "WFP",
  "Basra Gas",
];

export function TrustStrip() {
  const { t } = useLang();
  return (
    <div className="py-12 px-6 border-y border-border bg-paper">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-xs text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
          {t("trust_disclaimer")}
        </p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-muted-foreground shrink-0">
            {t("trust_label")}
          </span>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold tracking-tight text-foreground/60">
            {NAMES.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
