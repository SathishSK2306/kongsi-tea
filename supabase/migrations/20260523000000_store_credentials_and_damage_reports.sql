ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS store_password TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS stores_store_password_key
  ON public.stores (store_password)
  WHERE store_password IS NOT NULL;

DROP FUNCTION IF EXISTS public.verify_store_login(text, text);

CREATE FUNCTION public.verify_store_login(p_email text, p_password text)
RETURNS TABLE (
  id uuid,
  store_id text,
  store_name text,
  owner_name text,
  email text,
  phone text,
  address text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.store_id,
    s.store_name,
    s.owner_name,
    s.email,
    s.phone,
    s.address,
    s.status
  FROM public.stores s
  WHERE lower(coalesce(s.email, '')) = lower(p_email)
    AND s.store_password = p_password
    AND s.status = 'active'
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_store_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_store_login(text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_store_session(p_store_uuid uuid)
RETURNS TABLE (
  id uuid,
  store_id text,
  store_name text,
  owner_name text,
  email text,
  phone text,
  address text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.store_id,
    s.store_name,
    s.owner_name,
    s.email,
    s.phone,
    s.address,
    s.status
  FROM public.stores s
  WHERE s.id = p_store_uuid
    AND s.status = 'active'
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_store_session(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_store_session(uuid) TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_uuid UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  store_name TEXT NOT NULL,
  store_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  order_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unsolved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers create damage reports" ON public.damage_reports;
CREATE POLICY "customers create damage reports"
  ON public.damage_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins view damage reports" ON public.damage_reports;
CREATE POLICY "admins view damage reports"
  ON public.damage_reports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update damage reports" ON public.damage_reports;
CREATE POLICY "admins update damage reports"
  ON public.damage_reports
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('damage-report-images', 'damage-report-images', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "customers upload damage report images" ON storage.objects;
CREATE POLICY "customers upload damage report images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'damage-report-images');

DROP POLICY IF EXISTS "damage report images public read" ON storage.objects;
CREATE POLICY "damage report images public read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'damage-report-images');
