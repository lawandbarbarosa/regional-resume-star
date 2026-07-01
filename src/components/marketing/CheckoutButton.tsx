import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/i18n/LanguageProvider";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  planStatus?: "free" | "lifetime" | null;
  variant?: "primary" | "secondary";
};

export function CheckoutButton({ className, planStatus, variant = "primary" }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const callCheckout = useServerFn(createCheckoutSession);
  const [busy, setBusy] = useState(false);

  if (authLoading) return null;

  if (planStatus === "lifetime") {
    return (
      <Link
        to="/dashboard"
        className={cn(
          "inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xs text-sm",
          variant === "primary"
            ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
            : "border border-border hover:bg-paper",
          className,
        )}
      >
        {t("pricing_cta_paid")} · {t("pricing_cta_dashboard")}
      </Link>
    );
  }

  async function handleCheckout() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/pricing" } });
      return;
    }
    setBusy(true);
    try {
      const { url } = await callCheckout();
      if (url) window.location.href = url;
      else toast.error(t("pricing_toast_error"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pricing_toast_error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xs text-sm transition-transform active:scale-95 disabled:opacity-60",
        variant === "primary"
          ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
          : "border border-border hover:bg-paper",
        className,
      )}
    >
      {busy ? t("auth_btn_wait") : user ? t("pricing_cta_unlock") : t("pricing_cta_signin")}
    </button>
  );
}
