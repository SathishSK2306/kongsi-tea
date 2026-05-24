DROP POLICY IF EXISTS "users insert own orders" ON public.orders;
CREATE POLICY "customers insert store orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      user_id IS NULL
      AND store_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = store_id
          AND s.status = 'active'
      )
    )
  );

DROP POLICY IF EXISTS "users view own orders" ON public.orders;
CREATE POLICY "authenticated users view own or admin orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "customers view store orders"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (
    user_id IS NULL
    AND store_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.stores s
      WHERE s.id = store_id
        AND s.status = 'active'
    )
  );

DROP POLICY IF EXISTS "insert items for own orders" ON public.order_items;
CREATE POLICY "insert items for customer store orders"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          (auth.uid() IS NOT NULL AND o.user_id = auth.uid())
          OR (
            o.user_id IS NULL
            AND o.store_id IS NOT NULL
          )
        )
    )
  );

DROP POLICY IF EXISTS "view items of own orders" ON public.order_items;
CREATE POLICY "authenticated users view own or admin order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          (auth.uid() IS NOT NULL AND o.user_id = auth.uid())
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "customers view store order items"
  ON public.order_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id IS NULL
        AND o.store_id IS NOT NULL
    )
  );
