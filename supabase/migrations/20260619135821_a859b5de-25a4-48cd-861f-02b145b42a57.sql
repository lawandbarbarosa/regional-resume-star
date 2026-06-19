
CREATE TABLE public.cv_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL UNIQUE REFERENCES public.cvs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  template text NOT NULL DEFAULT 'classic',
  output_languages text[] NOT NULL DEFAULT ARRAY['en','ar']::text[],
  generated jsonb,
  current_step integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_drafts TO authenticated;
GRANT ALL ON public.cv_drafts TO service_role;

ALTER TABLE public.cv_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own cv drafts"
  ON public.cv_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_cv_drafts_updated_at
  BEFORE UPDATE ON public.cv_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
