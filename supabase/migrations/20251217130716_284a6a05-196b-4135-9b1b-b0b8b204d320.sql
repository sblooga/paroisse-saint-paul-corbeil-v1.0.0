-- Drop and recreate the get_team_members_public function to include community field
DROP FUNCTION IF EXISTS public.get_team_members_public();

CREATE FUNCTION public.get_team_members_public()
 RETURNS TABLE(id uuid, name text, name_fr text, name_pl text, role text, role_fr text, role_pl text, bio text, bio_fr text, bio_pl text, photo_url text, category text, sort_order integer, active boolean, community text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    id, name, name_fr, name_pl, role, role_fr, role_pl,
    bio, bio_fr, bio_pl, photo_url, category, sort_order,
    active, community, created_at, updated_at
  FROM public.team_members
  WHERE active = true
  ORDER BY sort_order;
$function$;