-- Insert default password using extensions schema for pgcrypto
INSERT INTO public.site_settings (key, value)
VALUES ('docs_password', extensions.crypt('000000', extensions.gen_salt('bf')));

-- Create function to verify docs password (accessible without auth)
CREATE OR REPLACE FUNCTION public.verify_docs_password(input_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.site_settings
    WHERE key = 'docs_password'
      AND value = extensions.crypt(input_password, value)
  )
$$;

-- Create function to update docs password (admin only)
CREATE OR REPLACE FUNCTION public.update_docs_password(new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  UPDATE public.site_settings
  SET value = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE key = 'docs_password';
  
  RETURN true;
END;
$$;