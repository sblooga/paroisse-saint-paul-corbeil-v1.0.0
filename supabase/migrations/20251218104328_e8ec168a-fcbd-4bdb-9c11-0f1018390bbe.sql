-- Create site_settings table for storing encrypted settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins/editors can view settings
CREATE POLICY "Admins can view settings"
ON public.site_settings
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_admin_or_editor(auth.uid()));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.site_settings
FOR UPDATE
USING (is_admin_or_editor(auth.uid()));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
ON public.site_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();