ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;
