-- Add SELECT policy to protect contact messages - only admins/editors can view
CREATE POLICY "Only admins and editors can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Ensure anonymous users cannot access contact messages at all
CREATE POLICY "Anonymous users cannot access contact messages"
ON public.contact_messages
FOR SELECT
TO anon
USING (false);