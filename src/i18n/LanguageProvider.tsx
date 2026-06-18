import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LANG_META, STRINGS, type Lang, type StringKey } from "./translations";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  font: string;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
};

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "localcv:lang";

function readInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ku" || stored === "ar") return stored;
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("ku") || nav.startsWith("ckb")) return "ku";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setLangState(readInitial());
  }, []);

  // Apply <html> lang/dir
  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = LANG_META[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  // Hydrate from profile once a session exists (server-of-truth)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled && data?.preferred_language) {
        const pref = data.preferred_language as Lang;
        if (pref === "en" || pref === "ku" || pref === "ar") {
          setLangState(pref);
          if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, pref);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    // Persist to profile if signed in (fire & forget)
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;
      supabase.from("profiles").update({ preferred_language: l }).eq("id", userId).then();
    });
  };

  const meta = LANG_META[lang];
  const t = (k: StringKey) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;

  return (
    <LanguageContext.Provider value={{ lang, dir: meta.dir, font: meta.font, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
