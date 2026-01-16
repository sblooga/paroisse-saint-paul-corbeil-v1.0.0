-- Create FAQ categories table
CREATE TABLE public.faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_fr text,
  title_pl text,
  icon text NOT NULL DEFAULT 'HelpCircle',
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create FAQ items table
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.faq_categories(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  question_fr text,
  question_pl text,
  answer text NOT NULL,
  answer_fr text,
  answer_pl text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Life Stages table
CREATE TABLE public.life_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_fr text,
  title_pl text,
  description text NOT NULL,
  description_fr text,
  description_pl text,
  icon text NOT NULL DEFAULT 'Heart',
  image_url text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faq_categories
CREATE POLICY "Anyone can view active faq categories" ON public.faq_categories FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all faq categories" ON public.faq_categories FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert faq categories" ON public.faq_categories FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update faq categories" ON public.faq_categories FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete faq categories" ON public.faq_categories FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for faq_items
CREATE POLICY "Anyone can view active faq items" ON public.faq_items FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all faq items" ON public.faq_items FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert faq items" ON public.faq_items FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update faq items" ON public.faq_items FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete faq items" ON public.faq_items FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for life_stages
CREATE POLICY "Anyone can view active life stages" ON public.life_stages FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all life stages" ON public.life_stages FOR SELECT USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert life stages" ON public.life_stages FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update life stages" ON public.life_stages FOR UPDATE USING (is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete life stages" ON public.life_stages FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_faq_categories_updated_at BEFORE UPDATE ON public.faq_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_life_stages_updated_at BEFORE UPDATE ON public.life_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();