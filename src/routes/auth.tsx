import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Pîşe" },
      {
        name: "description",
        content: "Sign in or create your Pîşe account to build trilingual, ATS-ready resumes.",
      },
    ],
  }),
  component: AuthPage,
});

type Tab = "email" | "phone";
type Mode = "signin" | "signup";

const ALLOWED_REDIRECTS = ["/dashboard", "/pricing"] as const;

function safeRedirect(path: string | undefined): "/dashboard" | "/pricing" {
  if (path && (ALLOWED_REDIRECTS as readonly string[]).includes(path)) {
    return path as "/dashboard" | "/pricing";
  }
  return "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const afterAuth = safeRedirect(redirect);
  const { t, dir, font, lang } = useLang();
  const isEn = lang === "en";
  const [tab, setTab] = useState<Tab>("email");
  const [mode, setMode] = useState<Mode>("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: afterAuth, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" && s) navigate({ to: afterAuth, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, afterAuth]);

  return (
    <div dir={dir} className={`min-h-screen bg-background grid lg:grid-cols-2 ${font}`}>
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-primary-foreground relative overflow-hidden">
        <Link to="/" className={`font-display text-2xl relative z-10 ${isEn ? "italic" : ""}`}>
          Pîşe
        </Link>
        <div className="relative z-10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary-foreground/60 mb-4">
            {t("auth_brand_eyebrow")}
          </p>
          <h2 className={`font-display text-4xl leading-tight mb-6 text-balance ${isEn ? "italic" : ""}`}>
            {t("auth_brand_title")}
          </h2>
          <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
            {t("auth_brand_body")}
          </p>
        </div>
        <div className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-primary-foreground/40">
          {t("auth_brand_copy")}
        </div>
        <div className="absolute -end-32 -bottom-32 size-96 rounded-full bg-accent/20 blur-3xl" />
      </aside>

      <main className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className={`lg:hidden font-display text-2xl ${isEn ? "italic" : ""}`}
            >
              Pîşe
            </Link>
            <div className="ms-auto">
              <LanguageSwitcher />
            </div>
          </div>
          <h1 className={`font-display text-3xl md:text-4xl mb-2 leading-tight ${isEn ? "italic" : ""}`}>
            {mode === "signin" ? t("auth_welcome_back") : t("auth_create_account")}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "signin" ? t("auth_subtitle_signin") : t("auth_subtitle_signup")}
          </p>

          <GoogleButton />
          <Divider />
          <Tabs tab={tab} setTab={setTab} />

          {tab === "email" ? <EmailForm mode={mode} /> : <PhoneForm />}

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {mode === "signin" ? t("auth_new_here") : t("auth_already")}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-accent font-semibold hover:underline"
            >
              {mode === "signin" ? t("auth_switch_signup") : t("auth_switch_signin")}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function Divider() {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-4 my-6">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {t("auth_or")}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { t } = useLang();
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-sm border border-border mb-6">
      {(["email", "phone"] as Tab[]).map((id) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest rounded-xs transition-colors ${
            tab === id
              ? "bg-foreground text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {id === "email" ? t("auth_tab_email") : t("auth_tab_phone")}
        </button>
      ))}
    </div>
  );
}

function GoogleButton() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error(result.error.message ?? t("auth_toast_google_fail"));
      setLoading(false);
      return;
    }
    if (result.redirected) return;
  }
  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 bg-paper border border-border rounded-xs font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50"
    >
      <GoogleIcon />
      <span>{loading ? t("auth_redirecting") : t("auth_continue_google")}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function EmailForm({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success(t("auth_toast_created"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth_toast_signedin"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg.includes("Invalid login") ? t("auth_toast_wrongcreds") : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <Input label={t("auth_label_displayname")} type="text" value={displayName} onChange={setDisplayName} placeholder="Zana Ahmed" required />
      )}
      <Input label={t("auth_label_email")} type="email" value={email} onChange={setEmail} placeholder={t("auth_placeholder_email")} required />
      <Input label={t("auth_label_password")} type="password" value={password} onChange={setPassword} placeholder={t("auth_placeholder_password")} required minLength={mode === "signup" ? 8 : undefined} />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 transition-transform active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? t("auth_btn_wait") : mode === "signin" ? t("auth_btn_signin") : t("auth_btn_signup")}
      </button>
    </form>
  );
}

function PhoneForm() {
  const { t } = useLang();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth_toast_sent"));
    setStep("otp");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth_toast_signedin"));
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <Input label={t("auth_label_phone")} type="tel" value={phone} onChange={setPhone} placeholder={t("auth_placeholder_phone")} required />
        <p className="text-[11px] text-muted-foreground -mt-2">{t("auth_phone_hint")}</p>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? t("auth_btn_sending") : t("auth_btn_send_code")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <Input label={t("auth_label_otp")} type="text" value={code} onChange={setCode} placeholder={t("auth_placeholder_otp")} required />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 disabled:opacity-50"
      >
        {loading ? t("auth_btn_verifying") : t("auth_btn_verify")}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-xs text-muted-foreground hover:text-foreground"
      >
        {t("auth_btn_different_phone")}
      </button>
    </form>
  );
}

function Input({
  label,
  ...props
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        minLength={props.minLength}
        className="w-full bg-paper border border-border px-4 py-3 rounded-xs outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
      />
    </div>
  );
}
