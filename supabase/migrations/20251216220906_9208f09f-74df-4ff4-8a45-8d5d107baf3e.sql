-- Drop the view and create a secure function instead
DROP VIEW IF EXISTS public.team_members_public;

-- Create a security definer function that returns sanitized team member data
CREATE OR REPLACE FUNCTION public.get_team_members_public()
RETURNS TABLE (
  id uuid,
  name text,
  name_fr text,
  name_pl text,
  role text,
  role_fr text,
  role_pl text,
  bio text,
  bio_fr text,
  bio_pl text,
  photo_url text,
  category text,
  sort_order integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, name, name_fr, name_pl, role, role_fr, role_pl,
    bio, bio_fr, bio_pl, photo_url, category, sort_order,
    active, created_at, updated_at
  FROM public.team_members
  WHERE active = true
  ORDER BY sort_order;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.get_team_members_public() TO anon, authenticated;