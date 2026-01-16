-- =====================================================
-- 1. PROTECT TEAM MEMBERS SENSITIVE DATA
-- =====================================================

-- Drop the public SELECT policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view active team members" ON public.team_members;

-- Create a view that excludes sensitive contact information
CREATE OR REPLACE VIEW public.team_members_public AS
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
  -- Explicitly excluding: email, phone
FROM public.team_members
WHERE active = true;

-- Grant public read access to the view
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- =====================================================
-- 2. CLEAN UP CONTACT_MESSAGES RLS POLICIES
-- =====================================================

-- Remove duplicate/conflicting SELECT policies
DROP POLICY IF EXISTS "Anonymous users cannot access contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;

-- Keep only one clear SELECT policy for admins/editors
-- "Only admins and editors can view contact messages" already exists and is correct