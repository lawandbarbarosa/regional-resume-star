import type { ReactNode } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingShell({ children }: { children: ReactNode }) {
  const { dir, font } = useLang();
  return (
    <div
      dir={dir}
      className={`min-h-screen bg-background ${font} text-foreground selection:bg-accent/10 flex flex-col`}
    >
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
