
-- Fix has_role: restrict execute to service role + authenticated (no anon) and keep stable
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Drop public listing policy and recreate scoped to authenticated.
-- Public file URLs still work because public buckets bypass storage.objects RLS for direct downloads.
DROP POLICY IF EXISTS "product images public read" ON storage.objects;
CREATE POLICY "product images authenticated list" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images');
