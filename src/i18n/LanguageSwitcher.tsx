import { useLang } from "./LanguageProvider";
import { LANG_META, type Lang } from "./translations";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  const langs: Lang[] = ["en", "ku", "ar"];
  return (
    <div
      className={`flex items-center gap-1 bg-paper/80 p-1 rounded-sm border border-border shadow-xs ${
        compact ? "" : ""
      }`}
      role="group"
      aria-label="Language"
    >
      {langs.map((l) => {
        const meta = LANG_META[l];
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`px-3 py-1 text-xs rounded-xs transition-colors ${
              l === "en" ? "font-semibold" : "font-arabic font-medium"
            } ${
              active
                ? "bg-foreground text-primary-foreground"
                : "hover:bg-foreground/5 text-foreground"
            }`}
          >
            {l === "en" ? "EN" : meta.nativeLabel}
          </button>
        );
      })}
    </div>
  );
}
