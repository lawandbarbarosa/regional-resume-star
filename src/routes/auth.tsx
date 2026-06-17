import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · LocalCV" },
      {
        name: "description",
        content: "Sign in or create your LocalCV account to build trilingual, ATS-ready resumes.",
      },
    ],
  }),
  component: AuthPage,
});

type Tab = "email" | "phone";
type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("email");
  const [mode, setMode] = useState<Mode>("signin");

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" && s) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-primary-foreground relative overflow-hidden">
        <Link to="/" className="font-display text-2xl italic relative z-10">
          LocalCV
        </Link>
        <div className="relative z-10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary-foreground/60 mb-4">
            For Iraq &amp; the Kurdistan Region
          </p>
          <h2 className="font-display text-4xl italic leading-tight mb-6 text-balance">
            One account. Three languages. Resumes that get read.
          </h2>
          <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
            Sign in to build, save, and export ATS-friendly CVs in English, Kurdish (Sorani),
            and Arabic — ready for NGOs, oil &amp; gas, and the private sector.
          </p>
        </div>
        <div className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-primary-foreground/40">
          © LocalCV · Erbil &amp; Baghdad
        </div>
        <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-accent/20 blur-3xl" />
      </aside>

      {/* Right: form panel */}
      <main className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden font-display text-2xl italic mb-8 inline-block"
          >
            LocalCV
          </Link>
          <h1 className="font-display text-3xl md:text-4xl italic mb-2 leading-tight">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "signin"
              ? "Sign in to continue building your CV."
              : "Free forever. Start building in seconds."}
          </p>

          <GoogleButton />

          <Divider />

          <Tabs tab={tab} setTab={setTab} />

          {tab === "email" ? (
            <EmailForm mode={mode} />
          ) : (
            <PhoneForm />
          )}

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {mode === "signin" ? "New to LocalCV?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-accent font-semibold hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-sm border border-border mb-6">
      {(["email", "phone"] as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest rounded-xs transition-colors ${
            tab === t
              ? "bg-foreground text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t === "email" ? "Email" : "Phone (SMS)"}
        </button>
      ))}
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Could not sign in with Google");
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
      <span>{loading ? "Redirecting…" : "Continue with Google"}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function EmailForm({ mode }: { mode: Mode }) {
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
        toast.success("Account created. Welcome!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg.includes("Invalid login") ? "Wrong email or password." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <Input
          label="Display name"
          type="text"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Zana Ahmed"
          required
        />
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        required
        minLength={mode === "signup" ? 8 : undefined}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 transition-transform active:scale-[0.99] disabled:opacity-50"
      >
        {loading
          ? "Please wait…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}

function PhoneForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Code sent. Check your SMS.");
    setStep("otp");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in.");
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <Input
          label="Phone number"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+9647501234567"
          required
        />
        <p className="text-[11px] text-muted-foreground -mt-2">
          Include the country code (e.g. +964 for Iraq).
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <Input
        label="6-digit code"
        type="text"
        value={code}
        onChange={setCode}
        placeholder="123456"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify & sign in"}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-xs text-muted-foreground hover:text-foreground"
      >
        ← Use a different number
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
