-- Persist the CV preview page's customization (colors, font, spacing, section
-- order/visibility) server-side, so it follows the user across devices/browsers
-- instead of only living in localStorage.
ALTER TABLE public.cv_drafts
  ADD COLUMN customization jsonb;
