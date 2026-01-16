-- Fix security definer view issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.team_members_public;

CREATE VIEW public.team_members_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  name_fr,
  name_pl,
  role,
  role_fr,
  role_pl,
  bio,
  bio_fr,
  bio_pl,
  photo_url,
  category,
  sort_order,
  active,
  created_at,
  updated_at
FROM public.team_members
WHERE active = true;

-- Grant public read access to the view
GRANT SELECT ON public.team_members_public TO anon, authenticated;