-- Table pour les articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  category TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author_id UUID REFERENCES auth.users(id)
);

-- Table pour les pages
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les membres de l'équipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL, -- 'priests', 'team', 'services', 'secretariat', 'choir'
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les horaires de messes
CREATE TABLE public.mass_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  is_special BOOLEAN DEFAULT false,
  special_date DATE,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_schedules ENABLE ROW LEVEL SECURITY;

-- Policies pour articles
CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all articles" ON public.articles FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert articles" ON public.articles FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update articles" ON public.articles FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete articles" ON public.articles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour pages
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all pages" ON public.pages FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert pages" ON public.pages FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour team_members
CREATE POLICY "Anyone can view active team members" ON public.team_members FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all team members" ON public.team_members FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour mass_schedules
CREATE POLICY "Anyone can view active mass schedules" ON public.mass_schedules FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all mass schedules" ON public.mass_schedules FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert mass schedules" ON public.mass_schedules FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update mass schedules" ON public.mass_schedules FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete mass schedules" ON public.mass_schedules FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mass_schedules_updated_at BEFORE UPDATE ON public.mass_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();