import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";

export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const { lang } = useLang();
  const isEn = lang === "en";
  return (
    <section className="px-6 pt-16 pb-12 md:pb-16 max-w-4xl mx-auto text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{eyebrow}</p>
      <h1 className={`font-display text-4xl md:text-6xl mb-6 text-balance leading-tight ${isEn ? "italic" : ""}`}>
        {title}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">{body}</p>
      {children}
    </section>
  );
}

export function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">{children}</p>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const { lang } = useLang();
  const isEn = lang === "en";
  return (
    <h2 className={`font-display text-3xl md:text-4xl mb-6 leading-tight text-balance ${isEn ? "italic" : ""}`}>
      {children}
    </h2>
  );
}

export function CtaBand({
  eyebrow,
  title,
  body,
  to,
  label,
}: {
  eyebrow: string;
  title: string;
  body: string;
  to: "/pricing" | "/auth";
  label: string;
}) {
  const { lang } = useLang();
  const isEn = lang === "en";
  return (
    <section className="px-6 py-20 bg-foreground text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary-foreground/60 mb-4">{eyebrow}</p>
        <h2 className={`font-display text-3xl md:text-4xl mb-4 leading-tight ${isEn ? "italic" : ""}`}>{title}</h2>
        <p className="text-sm text-primary-foreground/75 mb-8 leading-relaxed">{body}</p>
        <Link
          to={to}
          className="inline-flex px-8 py-4 bg-primary-foreground text-foreground font-semibold rounded-xs hover:bg-primary-foreground/90 transition-transform active:scale-95"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
