-- Add multilingual columns to team_members table
ALTER TABLE public.team_members
ADD COLUMN name_fr text,
ADD COLUMN name_pl text,
ADD COLUMN role_fr text,
ADD COLUMN role_pl text,
ADD COLUMN bio_fr text,
ADD COLUMN bio_pl text;

-- Migrate existing data to French columns (assuming current content is in French)
UPDATE public.team_members 
SET name_fr = name, role_fr = role, bio_fr = bio 
WHERE name_fr IS NULL;