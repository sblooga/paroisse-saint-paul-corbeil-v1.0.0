-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated admins/editors to upload files
CREATE POLICY "Admins and editors can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND public.is_admin_or_editor(auth.uid())
);

-- Allow authenticated admins/editors to update files
CREATE POLICY "Admins and editors can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' 
  AND public.is_admin_or_editor(auth.uid())
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' 
  AND public.has_role(auth.uid(), 'admin')
);