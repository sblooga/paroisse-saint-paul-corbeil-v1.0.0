-- Add bilingual fields to mass_schedules table
ALTER TABLE public.mass_schedules
ADD COLUMN day_of_week_fr text,
ADD COLUMN day_of_week_pl text,
ADD COLUMN description_fr text,
ADD COLUMN description_pl text,
ADD COLUMN location_fr text,
ADD COLUMN location_pl text;