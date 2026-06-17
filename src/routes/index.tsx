import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalCV — Resumes built for the Iraqi & KRG job market" },
      {
        name: "description",
        content:
          "Trilingual resume builder for Iraq and Kurdistan. Instant LTR/RTL, regional civil-status & nationality fields, language proficiency grid, AI localization, ATS-friendly PDF for WhatsApp & Viber.",
      },
      { property: "og:title", content: "LocalCV — Resumes for Iraq & KRG" },
      {
        property: "og:description",
        content:
          "Build ATS-friendly CVs in English, Kurdish (Sorani) and Arabic. Mobile-first, WhatsApp-ready.",
      },
    ],
  }),
  component: Index,
});

type Lang = "en" | "ku" | "ar";

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const dir = lang === "en" ? "ltr" : "rtl";

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/10">
      <Nav lang={lang} setLang={setLang} />
      <Hero />
      <BuilderPreview dir={dir} lang={lang} />
      <Features />
      <TrustStrip />
      <Footer />
    </div>
  );
}

function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const { user, loading } = useAuth();
  const langs: { id: Lang; label: string; arabic?: boolean }[] = [
    { id: "en", label: "EN" },
    { id: "ku", label: "کوردی", arabic: true },
    { id: "ar", label: "العربية", arabic: true },
  ];
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="font-display text-xl font-bold tracking-tight truncate">
            LocalCV
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#builder" className="hover:text-foreground transition-colors">Builder</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">NGO Guide</a>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-paper/80 p-1 rounded-sm border border-border shadow-xs">
            {langs.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-3 py-1 text-xs rounded-xs transition-colors ${
                  l.arabic ? "font-arabic font-medium" : "font-semibold"
                } ${
                  lang === l.id
                    ? "bg-foreground text-primary-foreground"
                    : "hover:bg-foreground/5 text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {!loading && (
            user ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-3 py-1.5 text-xs font-semibold bg-foreground text-primary-foreground rounded-xs hover:bg-foreground/90"
              >
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-6 pt-16 pb-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/15 rounded-full mb-6">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
            Updated for 2026 hiring cycles
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl mb-6 text-balance leading-[1.05] italic">
          Local expertise for{" "}
          <span className="text-accent not-italic font-sans font-bold">Global</span> standards.
        </h1>
        <p className="text-lg text-muted-foreground max-w-[45ch] mb-10 leading-relaxed">
          The only resume builder designed specifically for the Iraqi and KRG job markets.
          Instant RTL/LTR switching, regional civil-status fields, and ATS-ready formats
          trusted by NGOs and oil &amp; gas employers.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/auth"
            className="px-8 py-4 bg-foreground text-primary-foreground font-semibold rounded-xs hover:bg-foreground/90 transition-transform active:scale-95"
          >
            Create my CV
          </Link>
          <a
            href="#preview"
            className="px-8 py-4 border border-border font-semibold rounded-xs hover:bg-paper transition-colors"
          >
            View examples
          </a>
        </div>
      </div>

      <CvCenterpiece />
    </section>
  );
}

function CvCenterpiece() {
  return (
    <div
      id="preview"
      className="lg:col-span-6 animate-paper [animation-delay:200ms] relative group"
    >
      <div className="absolute -inset-4 bg-accent/5 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
      <article className="relative bg-paper aspect-[1/1.414] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/50 p-8 md:p-12 overflow-hidden">
        <header className="border-b-2 border-foreground pb-6 mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase truncate">
              Zana Ahmed
            </h2>
            <p className="text-xs md:text-sm text-accent font-mono mt-1">
              Senior Project Engineer
            </p>
          </div>
          <div className="text-right text-[10px] font-mono text-muted-foreground uppercase leading-tight shrink-0">
            Erbil, KRG
            <br />
            Civil Status: Married
            <br />
            Nationality: Iraqi
          </div>
        </header>

        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3">
              Experience
            </h3>
            <div>
              <div className="flex justify-between font-bold text-sm gap-2">
                <span className="truncate">Gas &amp; Oil Logistics Corp</span>
                <span className="font-mono text-xs shrink-0 text-muted-foreground">
                  2019 — Present
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Led a team of 12 for pipeline infrastructure development across Basra and
                Missan provinces. Reduced downtime 34% with predictive maintenance.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3">
              Languages
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {[
                ["Kurdish (Sorani)", "Native"],
                ["Arabic (Iraqi)", "Native"],
                ["English (Corporate)", "Professional"],
                ["Kurdish (Badini)", "Conversational"],
              ].map(([name, level]) => (
                <div
                  key={name}
                  className="flex justify-between items-center text-xs border-b border-border/40 pb-1 gap-2"
                >
                  <span className="font-medium italic truncate">{name}</span>
                  <span className="text-accent font-mono text-[10px] shrink-0">{level}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function BuilderPreview({ dir, lang }: { dir: "ltr" | "rtl"; lang: Lang }) {
  const isRtl = dir === "rtl";
  return (
    <section id="builder" className="bg-paper border-y border-border py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-display italic mb-4 leading-tight">
              Engineered for both worlds.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Switch between LTR and RTL instantly. Our layout engine handles line height,
              punctuation, and alignment for Kurdish and Arabic automatically — using the
              language picker in the navigation above.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-sm self-start md:self-auto">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Direction
            </span>
            <span className="text-xs font-mono font-bold text-accent">
              {dir.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-background p-6 md:p-8 rounded-sm border border-border">
          <FormSide dir={dir} lang={lang} />
          <LivePreview dir={dir} lang={lang} />
        </div>
      </div>
    </section>
  );
}

const COPY = {
  en: {
    fullName: "Full Name",
    nameValue: "Zana Ahmed",
    civil: "Civil Status",
    civilValue: "Married",
    nat: "Nationality",
    natValue: "Iraqi",
    exp: "Professional Experience",
    expValue:
      "Led a 12-person team for pipeline infrastructure development across Basra and Missan provinces.",
    title: "Senior Project Engineer",
    location: "Erbil, Kurdistan Region",
  },
  ku: {
    fullName: "ناوی تەواو",
    nameValue: "زانا ئەحمەد",
    civil: "بارودۆخی هاوسەرگیری",
    civilValue: "هاوسەردار",
    nat: "ڕەگەزنامە",
    natValue: "عێراقی",
    exp: "ئەزموونی پیشەیی",
    expValue:
      "ڕێبەری تیمێکی ١٢ کەسی بۆ گەشەپێدانی ژێرخانی پایپلاینەکان لە پارێزگاکانی بەسرە و مەیسان.",
    title: "ئەندازیاری پڕۆژەی باڵا",
    location: "هەولێر، هەرێمی کوردستان",
  },
  ar: {
    fullName: "الاسم الكامل",
    nameValue: "زانا أحمد",
    civil: "الحالة المدنية",
    civilValue: "متزوج",
    nat: "الجنسية",
    natValue: "عراقي",
    exp: "الخبرة المهنية",
    expValue:
      "قمت بإدارة فريق مكون من ١٢ شخصاً لتطوير البنية التحتية لخطوط الأنابيب في محافظتي البصرة وميسان.",
    title: "مهندس مشاريع أول",
    location: "أربيل، إقليم كردستان",
  },
} as const;

function FormSide({ dir, lang }: { dir: "ltr" | "rtl"; lang: Lang }) {
  const c = COPY[lang];
  const isRtl = dir === "rtl";
  const fontClass = isRtl ? "font-arabic" : "font-sans";

  return (
    <div className={`space-y-6 ${fontClass}`} dir={dir}>
      <Field label={c.fullName} value={c.nameValue} font={fontClass} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={c.civil} value={c.civilValue} font={fontClass} as="select" />
        <Field label={c.nat} value={c.natValue} font={fontClass} />
      </div>
      <div>
        <label className={`block text-sm font-bold mb-2 ${fontClass}`}>{c.exp}</label>
        <textarea
          dir={dir}
          defaultValue={c.expValue}
          className={`w-full bg-paper border border-border px-4 py-3 rounded-xs h-32 outline-none focus:ring-1 focus:ring-accent transition-all leading-relaxed ${fontClass}`}
        />
      </div>
      <div className="flex items-center justify-between pt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>Auto-saved</span>
        <span className="text-accent">AI · localizing terminology</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  font,
  as = "input",
}: {
  label: string;
  value: string;
  font: string;
  as?: "input" | "select";
}) {
  return (
    <div>
      <label className={`block text-sm font-bold mb-2 ${font}`}>{label}</label>
      {as === "select" ? (
        <select
          defaultValue={value}
          className={`w-full bg-paper border border-border px-4 py-3 rounded-xs appearance-none outline-none focus:ring-1 focus:ring-accent ${font}`}
        >
          <option>{value}</option>
        </select>
      ) : (
        <input
          type="text"
          defaultValue={value}
          className={`w-full bg-paper border border-border px-4 py-3 rounded-xs outline-none focus:ring-1 focus:ring-accent ${font}`}
        />
      )}
    </div>
  );
}

function LivePreview({ dir, lang }: { dir: "ltr" | "rtl"; lang: Lang }) {
  const c = COPY[lang];
  const isRtl = dir === "rtl";
  const fontClass = isRtl ? "font-arabic" : "font-sans";

  return (
    <div className="hidden lg:flex flex-col">
      <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
        <span>Live Preview · A4</span>
        <span className="text-accent">{dir.toUpperCase()}</span>
      </div>
      <article
        dir={dir}
        className={`bg-paper border border-border shadow-sm flex-1 p-8 ${fontClass}`}
      >
        <header className="border-b-2 border-foreground pb-4 mb-6">
          <h3 className={`text-xl font-bold tracking-tight ${isRtl ? "" : "uppercase"}`}>
            {c.nameValue}
          </h3>
          <p className="text-xs text-accent font-mono mt-1">{c.title}</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
            {c.location} · {c.civilValue} · {c.natValue}
          </p>
        </header>
        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 font-sans">
            {c.exp}
          </h4>
          <p className="text-xs leading-relaxed">{c.expValue}</p>
        </section>
        <div className="mt-8 pt-4 border-t border-border/40 flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>localcv.iq</span>
          <span>ATS · Ready</span>
        </div>
      </article>
    </div>
  );
}

function Features() {
  const items = [
    {
      tag: "01",
      title: "Trilingual layout engine",
      body: "Instant LTR/RTL with native handling of Kurdish (Sorani), Arabic, and English — punctuation, alignment, and line height adapt automatically.",
    },
    {
      tag: "02",
      title: "Regional fields, on by default",
      body: "Optional civil status, nationality, and place of birth — the fields Iraqi and KRG employers actually expect on a CV.",
    },
    {
      tag: "03",
      title: "Dialect-aware language grid",
      body: "Sorani, Badini, Iraqi Arabic, MSA, Turkmen, and Assyrian — alongside English, French, Turkish, and Persian.",
    },
    {
      tag: "04",
      title: "AI corporate localization",
      body: "Raw descriptions are rewritten into the terminology used by international NGOs and oil & gas operators.",
    },
    {
      tag: "05",
      title: "100% ATS-friendly export",
      body: "Clean text-first PDFs that pass the parsers used by UN agencies, ministries, and multinational employers.",
    },
    {
      tag: "06",
      title: "WhatsApp & Viber ready",
      body: "Compact, sharp PDFs sized for mobile messaging — exactly how shortlists actually move in Iraq.",
    },
  ];
  return (
    <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
          The platform · 06 features
        </p>
        <h2 className="text-3xl md:text-5xl font-display italic leading-tight text-balance">
          A bridge between local talent and the private sector.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {items.map((f) => (
          <article
            key={f.tag}
            className="bg-background p-8 hover:bg-paper transition-colors"
          >
            <div className="flex items-baseline justify-between mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {f.tag}
              </span>
              <span className="size-1.5 rounded-full bg-accent" />
            </div>
            <h3 className="font-display text-xl mb-3 leading-snug">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustStrip() {
  const names = ["UNAMI", "Shell Iraq", "KRG Ministries", "TotalEnergies", "Save the Children", "WFP", "Basra Gas"];
  return (
    <div className="py-12 px-6 border-y border-border bg-paper">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-muted-foreground shrink-0">
          Trusted by candidates entering →
        </span>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold tracking-tight text-foreground/60">
          {names.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h4 className="font-display text-2xl italic mb-6">LocalCV</h4>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Bridge the gap between local talent and global opportunities with precise,
            culturally-aware resumes — built in Erbil &amp; Baghdad.
          </p>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            Product
          </h5>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">CV templates</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">ATS checker</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Localization AI</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            Market
          </h5>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">Iraqi hiring trends</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">KRG labor laws</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">NGO requirements</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>© 2026 LocalCV · Erbil &amp; Baghdad</span>
        <div className="flex gap-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">WhatsApp support</a>
        </div>
      </div>
    </footer>
  );
}
