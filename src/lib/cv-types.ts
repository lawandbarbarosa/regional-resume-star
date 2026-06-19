export type CvLang = "en" | "ku" | "ar";

export type WizardAnswers = {
  fullName: string;
  headline: string; // target role / title
  email: string;
  phone: string;
  city: string;
  nationality: string;
  civilStatus: string;
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    dates: string;
  }>;
  skills: string[];
  languages: Array<{ name: string; level: string }>;
};

export const EMPTY_ANSWERS: WizardAnswers = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  city: "",
  nationality: "",
  civilStatus: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
};

export type GeneratedCV = {
  fullName: string;
  headline: string;
  contact: { email: string; phone: string; city: string };
  meta: { nationality?: string; civilStatus?: string };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{ degree: string; school: string; dates: string }>;
  skills: string[];
  languages: Array<{ name: string; level: string }>;
};

export type GeneratedByLang = Partial<Record<CvLang, GeneratedCV>>;

export const TEMPLATES = [
  { id: "classic", name: "Classic", note: "Serif, traditional, corporate standard" },
  { id: "modern", name: "Modern", note: "Sans-serif with subtle accent bar" },
  { id: "minimal", name: "Minimal", note: "Pure typography, no color" },
  { id: "compact", name: "Compact", note: "Tight two-section single-page" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];
