import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard · LocalCV" }],
  }),
  component: Dashboard,
});

type Profile = {
  display_name: string | null;
  preferred_language: "en" | "ku" | "ar";
};

type CV = {
  id: string;
  title: string;
  language: "en" | "ku" | "ar";
  updated_at: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { t, dir, font, lang } = useLang();
  const isEn = lang === "en";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([
        supabase.from("profiles").select("display_name, preferred_language").eq("id", user.id).maybeSingle(),
        supabase.from("cvs").select("id, title, language, updated_at").order("updated_at", { ascending: false }),
      ]);
      setProfile(p.data);
      setCvs(c.data ?? []);
      setLoading(false);
    })();
  }, [user.id]);

  async function createCV() {
    const { data, error } = await supabase
      .from("cvs")
      .insert({ user_id: user.id, title: t("dash_untitled"), language: lang })
      .select("id, title, language, updated_at")
      .single();
    if (error) return toast.error(error.message);
    toast.success(t("dash_toast_created"));
    navigate({ to: "/cv/$id/build", params: { id: data.id } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const greetName =
    profile?.display_name ?? user.email?.split("@")[0] ?? user.phone ?? "—";

  return (
    <div dir={dir} className={`min-h-screen bg-background ${font}`}>
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Link to="/" className={`font-display text-xl font-bold tracking-tight truncate ${isEn ? "italic" : ""}`}>
            LocalCV
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate max-w-[200px]">
              {user.email ?? user.phone}
            </span>
            <LanguageSwitcher />
            <button
              onClick={signOut}
              className="text-xs font-semibold px-3 py-2 border border-border rounded-xs hover:bg-paper transition-colors"
            >
              {t("dash_signout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-3">
            {t("dash_eyebrow")}
          </p>
          <h1 className={`font-display text-4xl md:text-5xl leading-tight mb-3 ${isEn ? "italic" : ""}`}>
            {t("dash_welcome")}, {greetName}.
          </h1>
          <p className="text-muted-foreground max-w-xl">{t("dash_intro")}</p>
        </div>

        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            {t("dash_your_cvs")} · {cvs.length}
          </h2>
          <button
            onClick={createCV}
            className="px-5 py-2.5 bg-foreground text-primary-foreground font-semibold rounded-xs text-sm hover:bg-foreground/90 active:scale-[0.99]"
          >
            {t("dash_new_cv")}
          </button>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : cvs.length === 0 ? (
          <EmptyState onCreate={createCV} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {cvs.map((cv) => (
              <CVCard key={cv.id} cv={cv} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CVCard({ cv }: { cv: CV }) {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  const langLabel = {
    en: { en: "English", ku: "Kurdish (Sorani)", ar: "Arabic" },
    ku: { en: "ئینگلیزی", ku: "کوردی (سۆرانی)", ar: "عەرەبی" },
    ar: { en: "الإنجليزية", ku: "الكردية (السورانية)", ar: "العربية" },
  }[lang][cv.language];

  return (
    <Link
      to="/cv/$id/build"
      params={{ id: cv.id }}
      className="bg-paper p-6 hover:bg-background transition-colors group block"
    >
      <div className="flex items-baseline justify-between mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
          {langLabel}
        </span>
        <span className="size-1.5 rounded-full bg-accent" />
      </div>
      <h3 className={`font-display text-xl mb-2 leading-snug truncate ${isEn ? "italic" : ""}`}>
        {cv.title}
      </h3>
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {t("dash_card_updated")} {new Date(cv.updated_at).toLocaleDateString()}
      </p>
      <div className="mt-6 flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground">{t("dash_card_draft")}</span>
        <span className="text-accent font-semibold group-hover:underline">{t("dash_card_open")}</span>
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  return (
    <div className="border border-dashed border-border p-16 text-center bg-paper">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
        {t("dash_empty_tag")}
      </p>
      <h3 className={`font-display text-2xl mb-3 ${isEn ? "italic" : ""}`}>{t("dash_empty_title")}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{t("dash_empty_body")}</p>
      <button
        onClick={onCreate}
        className="px-6 py-3 bg-foreground text-primary-foreground font-semibold rounded-xs text-sm hover:bg-foreground/90"
      >
        {t("dash_empty_cta")}
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-paper p-6 animate-pulse">
          <div className="h-3 w-20 bg-border mb-6" />
          <div className="h-5 w-40 bg-border mb-3" />
          <div className="h-3 w-32 bg-border" />
        </div>
      ))}
    </div>
  );
}
