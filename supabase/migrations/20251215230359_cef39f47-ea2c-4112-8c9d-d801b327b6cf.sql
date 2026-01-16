-- Create footer_links table for managing quick links
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  label_fr TEXT,
  label_pl TEXT,
  url TEXT NOT NULL DEFAULT '#',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Public can view active links
CREATE POLICY "Anyone can view active footer links"
ON public.footer_links
FOR SELECT
USING (active = true);

-- Admins can view all footer links
CREATE POLICY "Admins can view all footer links"
ON public.footer_links
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Admins/editors can insert footer links
CREATE POLICY "Admins can insert footer links"
ON public.footer_links
FOR INSERT
WITH CHECK (is_admin_or_editor(auth.uid()));

-- Admins/editors can update footer links
CREATE POLICY "Admins can update footer links"
ON public.footer_links
FOR UPDATE
USING (is_admin_or_editor(auth.uid()));

-- Admins can delete footer links
CREATE POLICY "Admins can delete footer links"
ON public.footer_links
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_footer_links_updated_at
BEFORE UPDATE ON public.footer_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default links
INSERT INTO public.footer_links (label, label_fr, label_pl, url, sort_order) VALUES
('Mass Schedule', 'Horaires des messes', 'Godziny mszy', '/mass-schedules', 1),
('Baptism', 'Baptême', 'Chrzest', '#', 2),
('Wedding', 'Mariage', 'Ślub', '#', 3),
('Catechesis', 'Catéchèse', 'Katecheza', '#', 4),
('Funerals', 'Funérailles', 'Pogrzeby', '#', 5),
('Bulletin', 'Bulletin paroissial', 'Biuletyn parafialny', '#', 6);