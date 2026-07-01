import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/" as const, key: "nav_home" as const },
  { to: "/about" as const, key: "nav_about" as const },
  { to: "/pricing" as const, key: "nav_pricing" as const },
  { to: "/faq" as const, key: "nav_faq" as const },
];

export function MarketingNav() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-6 md:gap-8">
          <Link to="/" className="font-display text-xl font-bold tracking-tight truncate shrink-0">
            LocalCV
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map(({ to, key }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    active && "text-foreground underline underline-offset-4 decoration-accent decoration-2",
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          {!loading &&
            (user ? (
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
            ))}
        </div>
      </div>
    </nav>
  );
}
