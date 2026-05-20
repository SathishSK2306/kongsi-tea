import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { sendOrderEmails } from "@/lib/email-service";
import { loadRazorpayScript, openRazorpayCheckout, type RazorpayPaymentResponse } from "@/lib/razorpay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR, genId } from "@/lib/format";
import { AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Kongsi" }] }),
});

interface CheckoutForm {
  store_name: string;
  store_id: string;
  store_uuid: string;
  owner_name: string;
  phone: string;
  email: string;
  delivery_address: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<CheckoutForm>({
    store_name: "",
    store_id: "",
    store_uuid: "",
    owner_name: "",
    phone: "",
    email: "",
    delivery_address: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm((f) => ({
            ...f,
            store_name: data.store_name || "",
            store_id: data.store_id || "",
            store_uuid: data.id || "",
            owner_name: data.owner_name || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
            delivery_address: data.address || "",
          }));
        } else {
          setForm((f) => ({ ...f, email: user.email || "" }));
        }
      });
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.store_name.trim()) newErrors.store_name = "Store name is required";
    if (!form.owner_name.trim()) newErrors.owner_name = "Owner name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be a valid 10-digit number";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.delivery_address.trim()) newErrors.delivery_address = "Delivery address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="size-16 mx-auto text-muted-foreground" />
        <h1 className="font-serif text-3xl mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add items before proceeding to checkout.</p>
        <Button onClick={() => navigate({ to: "/menu" })} className="mt-6 rounded-full btn-glow">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (!user) return null;

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/20 mb-6">
            <CheckCircle2 className="size-10 text-emerald-500" />
          </div>
          <h1 className="font-serif text-4xl mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Order ID: <span className="font-semibold text-foreground">{orderId}</span></p>
          <p className="text-sm text-muted-foreground mb-8">
            A confirmation email has been sent to {form.email}
          </p>
          <Button onClick={() => navigate({ to: "/menu" })} className="rounded-full btn-glow">
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  const shipping = total >= 2499 ? 0 : 99;
  const grand = total + shipping;

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxx";
  const isPlaceholderKey = RAZORPAY_KEY_ID === "rzp_test_xxxxxxxxx";

  async function saveOrder(payment: RazorpayPaymentResponse) {
    const newOrderId = genId("ORD-");
    const responseOrderId = payment.razorpay_order_id || `rzp_test_order_${Date.now()}`;

    const createOrderPayload = (includePaymentMetadata: boolean) => ({
      order_id: newOrderId,
      user_id: user!.id,
      store_name: form.store_name,
      store_id: form.store_uuid || null,
      customer_name: form.owner_name,
      phone: form.phone,
      email: form.email,
      address: form.delivery_address,
      total_amount: grand,
      notes: form.notes || null,
      ...(includePaymentMetadata
        ? {
            payment_id: payment.razorpay_payment_id,
            razorpay_order_id: responseOrderId,
            payment_method: "Razorpay",
            payment_status: "paid",
          }
        : {}),
    });

    const { data: order, error } = await supabase
      .from("orders")
      .insert(createOrderPayload(true) as never)
      .select()
      .single();

    let persistedOrder = order;
    let insertError = error;

    const needsFallback =
      error &&
      (error.code === "PGRST204" ||
        error.message?.includes("Could not find the 'payment_id' column") ||
        error.message?.includes("payment_id") ||
        error.message?.includes("payment_method") ||
        error.message?.includes("razorpay_order_id"));

    if (needsFallback) {
      const fallbackResult = await supabase
        .from("orders")
        .insert(createOrderPayload(false) as never)
        .select()
        .single();

      persistedOrder = fallbackResult.data;
      insertError = fallbackResult.error;

      if (persistedOrder && !insertError) {
        toast.warning(
          "Order saved without payment metadata because the database schema is missing the payment columns. Apply the latest migration to preserve payment details."
        );
      }
    }

    if (insertError || !persistedOrder) {
      throw insertError || new Error("Unable to persist order payment details.");
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: persistedOrder.id,
        product_id: it.id,
        product_name: it.name,
        quantity: it.qty,
        price: it.price,
        subtotal: it.price * it.qty,
      }))
    );

    if (itemsErr) {
      throw itemsErr;
    }

    try {
      await sendOrderEmails({
        order_id: newOrderId,
        store_name: form.store_name,
        store_id: form.store_id,
        customer_name: form.owner_name,
        phone: form.phone,
        email: form.email,
        address: form.delivery_address,
        total_amount: grand,
        subtotal: total,
        shipping: shipping,
        payment_method: "Razorpay",
        notes: form.notes,
        order_items: items.map((it) => ({
          product_id: it.product_id,
          product_name: it.name,
          quantity: it.qty,
          price: it.price,
          subtotal: it.price * it.qty,
        })),
      });
      toast.success("Order confirmation sent to your email!");
    } catch (emailError) {
      console.warn("Email notification failed, but order was created:", emailError);
      toast.warning("Order placed! Email notification will be sent shortly.");
    }

    return newOrderId;
  }

  async function placeOrder() {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    try {
      if (!RAZORPAY_KEY_ID) {
        throw new Error("Razorpay key is missing. Please set VITE_RAZORPAY_KEY_ID.");
      }

      if (isPlaceholderKey) {
        toast.warning(
          "Razorpay is running with the temporary placeholder key. Replace VITE_RAZORPAY_KEY_ID with a test key for a working payment flow."
        );
      }

      toast.success("Opening Razorpay checkout...");
      await loadRazorpayScript();

      const paymentResponse = await openRazorpayCheckout({
        amount: grand,
        name: form.owner_name,
        description: "Kongsi order payment",
        email: form.email,
        contact: form.phone,
      });

      toast.success("Payment successful. Saving your order...");
      const generatedOrderId = await saveOrder(paymentResponse);

      clear();
      setOrderId(generatedOrderId);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Payment failed. Order was not created.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl md:text-5xl mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details</p>
      </motion.div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Store Information */}
          <div className="glass border border-border rounded-2xl p-6">
            <h2 className="font-serif text-2xl mb-4">Store Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Store Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                  placeholder="Your store name"
                  className={`rounded-lg border-border ${errors.store_name ? "border-destructive" : ""}`}
                  disabled={submitting}
                />
                {errors.store_name && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.store_name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Store ID <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  value={form.store_id}
                  onChange={(e) => setForm({ ...form, store_id: e.target.value })}
                  placeholder="ST-XXXXX"
                  className="rounded-lg border-border"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="glass border border-border rounded-2xl p-6">
            <h2 className="font-serif text-2xl mb-4">Owner Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Owner Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  placeholder="Full name"
                  className={`rounded-lg border-border ${errors.owner_name ? "border-destructive" : ""}`}
                  disabled={submitting}
                />
                {errors.owner_name && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.owner_name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  className={`rounded-lg border-border ${errors.phone ? "border-destructive" : ""}`}
                  disabled={submitting}
                />
                {errors.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`rounded-lg border-border ${errors.email ? "border-destructive" : ""}`}
                  disabled={submitting}
                />
                {errors.email && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="glass border border-border rounded-2xl p-6">
            <h2 className="font-serif text-2xl mb-4">Delivery Address</h2>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                placeholder="Street address, city, state, postal code"
                className={`rounded-lg border-border resize-none ${errors.delivery_address ? "border-destructive" : ""}`}
                rows={3}
                disabled={submitting}
              />
              {errors.delivery_address && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.delivery_address}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">
                Special Notes <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions for delivery..."
                className="rounded-lg border-border resize-none"
                rows={2}
                disabled={submitting}
              />
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24"
        >
          <h2 className="font-serif text-2xl mb-4">Order Summary</h2>

          <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pb-4 border-b border-border/30">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(it.price)} × {it.qty}
                  </p>
                </div>
                <p className="font-semibold text-right whitespace-nowrap">
                  {formatINR(it.price * it.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? <span className="text-emerald-500">Free</span> : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/30">
              <span>Total</span>
              <span className="text-gradient-gold text-xl">{formatINR(grand)}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={placeOrder}
              disabled={submitting}
              className="w-full mt-6 rounded-full btn-glow py-2 font-medium"
            >
              {submitting ? "Opening payment..." : `Proceed Payment • ${formatINR(grand)}`}
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            A confirmation email will be sent to your email address.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
