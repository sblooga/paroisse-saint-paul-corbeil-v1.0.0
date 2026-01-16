-- Add multilingual columns to articles table
ALTER TABLE public.articles
ADD COLUMN title_fr text,
ADD COLUMN title_pl text,
ADD COLUMN content_fr text,
ADD COLUMN content_pl text,
ADD COLUMN excerpt_fr text,
ADD COLUMN excerpt_pl text;

-- Add multilingual columns to pages table
ALTER TABLE public.pages
ADD COLUMN title_fr text,
ADD COLUMN title_pl text,
ADD COLUMN content_fr text,
ADD COLUMN content_pl text,
ADD COLUMN meta_title_fr text,
ADD COLUMN meta_title_pl text,
ADD COLUMN meta_description_fr text,
ADD COLUMN meta_description_pl text;

-- Migrate existing data to French columns (assuming current content is in French)
UPDATE public.articles SET title_fr = title, content_fr = content, excerpt_fr = excerpt WHERE title_fr IS NULL;
UPDATE public.pages SET title_fr = title, content_fr = content, meta_title_fr = meta_title, meta_description_fr = meta_description WHERE title_fr IS NULL;