import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR, genId } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — BrewHaven" }] }),
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", notes: "" });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm((f) => ({ ...f, customer_name: data.owner_name, phone: data.phone, address: data.address }));
    });
  }, [user]);

  if (items.length === 0) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Your cart is empty.</div>;
  }
  if (!user) return null;

  const shipping = total >= 2499 ? 0 : 99;
  const grand = total + shipping;

  async function placeOrder() {
    if (!form.customer_name || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data: store } = await supabase.from("stores").select("id").eq("user_id", user!.id).maybeSingle();

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_id: genId("ORD-"),
          user_id: user!.id,
          store_id: store?.id ?? null,
          customer_name: form.customer_name,
          phone: form.phone,
          address: form.address,
          total_amount: grand,
          notes: form.notes || null,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((it) => ({
          order_id: order.id,
          product_id: it.id,
          product_name: it.name,
          quantity: it.qty,
          price: it.price,
          subtotal: it.price * it.qty,
        })),
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed!");
      navigate({ to: "/order-success/$orderId", params: { orderId: order.order_id } });
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="font-serif text-4xl md:text-5xl">Checkout</h1>
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-serif text-2xl">Delivery Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Address *</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </div>

        <aside className="glass border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl">Summary</h2>
          <div className="mt-3 space-y-2 max-h-60 overflow-auto text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground line-clamp-1">{it.name} × {it.qty}</span>
                <span>{formatINR(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2"><span>Total</span><span className="text-gradient-gold text-xl">{formatINR(grand)}</span></div>
          </div>
          <Button onClick={placeOrder} disabled={submitting} className="w-full mt-5 rounded-full btn-glow">
            {submitting ? "Placing..." : "Place Order"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
