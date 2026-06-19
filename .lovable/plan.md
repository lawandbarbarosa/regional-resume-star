# CV Builder Wizard

When a user clicks "New CV" on the dashboard, take them through a guided, one-question-at-a-time wizard, then a template + language picker, then an AI-generated CV preview they can download.

## Flow

```
Dashboard → [New CV] → /cv/$id/build
   Step 1  Personal info     (name, headline/title, photo optional)
   Step 2  Contact           (email, phone, city, nationality, civil status)
   Step 3  Summary           (1-2 sentence "about me" in their words)
   Step 4  Work experience   (add multiple: role, company, dates, bullets) — raw text OK
   Step 5  Education         (add multiple: degree, school, dates)
   Step 6  Skills            (chips input)
   Step 7  Languages         (language + proficiency grid; Kurdish/Arabic/English + regional)
   Step 8  Review            (scrollable summary of everything entered)
→ /cv/$id/design
   - Pick 1 of 4 CV templates (visual cards, ATS-friendly)
   - Pick output languages: exactly 2 from {English, Kurdish Sorani, Arabic}
   - [Generate with AI]
→ /cv/$id/preview
   - Side-by-side bilingual preview (LTR + RTL where relevant)
   - [Regenerate] [Edit answers] [Download PDF]
```

One question per screen. Big input, clear progress bar (Step X of 8), Back / Continue, Esc to save & exit. Autosave after every step so users can resume from the dashboard.

## Templates (v1)

Four ATS-safe layouts, all single-column, print-ready:
1. **Classic** — serif, traditional, Iraqi corporate standard
2. **Modern** — sans-serif, subtle accent bar
3. **Minimal** — pure typography, no color
4. **Compact** — two-section, fits on one page

Each renders identically in English, Kurdish, and Arabic with correct font + direction.

## Bilingual AI generation

User picks **exactly two** languages from English / Kurdish (Sorani) / Arabic. Valid pairs: EN+KU, EN+AR, KU+AR.

AI does two passes:
1. **Polish pass** — takes raw answers (often informal Iraqi/KRG phrasing) and rewrites into professional corporate terminology in the user's primary language.
2. **Translate pass** — translates the polished CV into the second language, preserving structure, dates, proper nouns.

Output stored as structured JSON per language so the template renders it cleanly. PDF export renders both language versions (user picks which to download, or downloads both).

## Data model

New table `public.cv_drafts` (one row per CV, JSON payload for wizard answers):
- `cv_id` (FK to `cvs.id`)
- `answers jsonb` — all wizard step data
- `template text` — chosen template id
- `output_languages text[]` — exactly 2
- `generated jsonb` — `{ [lang]: { summary, experience, education, ... } }`
- `current_step int` — for resume
- standard timestamps + RLS scoped to owner

`cvs.title` auto-updates from the entered name + role.

## Technical notes

- New routes under `src/routes/_authenticated/cv.$id.*`:
  - `build.tsx` — wizard host, reads `current_step`, renders the right step component
  - `design.tsx` — template + language picker
  - `preview.tsx` — final rendered CV + download
- Wizard steps as small components in `src/components/cv-wizard/` (Step1Personal, Step2Contact, …).
- Trilingual UI: wizard chrome translated via existing `STRINGS` in `src/i18n/translations.ts` (extend with wizard keys).
- AI generation via a `createServerFn` (`src/lib/cv-generate.functions.ts`) using Lovable AI Gateway with `google/gemini-3-flash-preview`. Structured output (Zod schema) for the CV JSON.
- PDF: client-side render of the chosen template into a print-ready React component, then `react-to-print` / browser print → PDF (ATS-friendly text, not images). WhatsApp/Viber-sized file footprint.
- Dashboard `createCV()` updated to insert into `cvs` + `cv_drafts`, then navigate to `/cv/$id/build`.
- Resume logic: clicking an existing draft on the dashboard reopens at its `current_step`.

## Out of scope (v1)

- Photo upload (we'll show optional placeholder, wire storage later if you want)
- Custom template editor
- Sharing links / public CV URLs

## Open questions before I build

1. **PDF approach**: in-browser print-to-PDF (simplest, always matches preview) vs server-rendered PDF (more consistent across devices, more work). Browser print is my default.
2. **Photo on CV**: include optional photo upload now, or skip for v1?
3. **Bilingual PDF layout**: one PDF with both languages side-by-side, or two separate PDFs (one per language)?
