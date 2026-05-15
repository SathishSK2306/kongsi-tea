import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { CATEGORY_IMG } from "@/lib/categories";
import { motion } from "framer-motion";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — BrewHaven" }] }),
});

function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-24">
        <ShoppingBag className="size-16 mx-auto text-muted-foreground" />
        <h1 className="font-serif text-3xl mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Discover our premium wholesale catalog.</p>
        <Link to="/menu" className="inline-block mt-6">
          <Button className="rounded-full btn-glow">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="font-serif text-4xl md:text-5xl">Your Cart</h1>
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass border border-border rounded-2xl p-3 flex gap-4 items-center"
            >
              <img src={it.image || Object.values(CATEGORY_IMG)[0]} alt={it.name} className="size-20 md:size-24 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg line-clamp-1">{it.name}</h3>
                <div className="text-xs text-muted-foreground">{formatINR(it.price)} / {it.unit}</div>
                <div className="mt-2 inline-flex items-center rounded-full border border-border">
                  <button className="p-1.5 hover:text-primary" onClick={() => setQty(it.id, it.qty - 1)}><Minus className="size-3.5" /></button>
                  <span className="w-8 text-center text-sm">{it.qty}</span>
                  <button className="p-1.5 hover:text-primary" onClick={() => setQty(it.id, it.qty + 1)}><Plus className="size-3.5" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gradient-gold">{formatINR(it.price * it.qty)}</div>
                <button onClick={() => remove(it.id)} className="mt-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </motion.div>
          ))}
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive mt-2">Clear cart</button>
        </div>

        <aside className="glass border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total >= 2499 ? "Free" : formatINR(99)}</span></div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="text-gradient-gold text-xl">{formatINR(total + (total >= 2499 ? 0 : 99))}</span></div>
          </div>
          <Link to="/checkout" className="block mt-5">
            <Button className="w-full rounded-full btn-glow">Proceed to Checkout</Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
