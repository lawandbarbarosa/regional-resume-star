
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'free'
    CHECK (plan_status IN ('free', 'lifetime')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;
