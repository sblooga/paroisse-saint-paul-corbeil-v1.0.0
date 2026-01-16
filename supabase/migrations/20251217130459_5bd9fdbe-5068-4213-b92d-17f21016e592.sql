-- Add language field to mass_schedules to indicate the language of the mass
ALTER TABLE public.mass_schedules 
ADD COLUMN language text DEFAULT 'fr' CHECK (language IN ('fr', 'pl'));

-- Add community field to team_members to indicate which community they belong to
ALTER TABLE public.team_members 
ADD COLUMN community text DEFAULT 'fr' CHECK (community IN ('fr', 'pl', 'both'));

-- Update existing records with default values
UPDATE public.mass_schedules SET language = 'fr' WHERE language IS NULL;
UPDATE public.team_members SET community = 'fr' WHERE community IS NULL;