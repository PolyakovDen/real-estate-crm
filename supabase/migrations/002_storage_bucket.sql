-- Create public storage bucket for property photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-photos',
  'property-photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (drop if exist, then recreate)
DROP POLICY IF EXISTS "photos_storage_select" ON storage.objects;
CREATE POLICY "photos_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-photos');

DROP POLICY IF EXISTS "photos_storage_insert" ON storage.objects;
CREATE POLICY "photos_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

DROP POLICY IF EXISTS "photos_storage_delete" ON storage.objects;
CREATE POLICY "photos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-photos');

-- Add UPDATE policy for property_photos (missing from 001)
DROP POLICY IF EXISTS "photos_update" ON public.property_photos;
CREATE POLICY "photos_update" ON public.property_photos
  FOR UPDATE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );
