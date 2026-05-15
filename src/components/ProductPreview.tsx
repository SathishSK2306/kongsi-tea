import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { CATEGORY_IMG } from "@/lib/categories";
import { toast } from "sonner";
import type { Product } from "./ProductCard";

export function ProductPreview({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const img = product.image || CATEGORY_IMG[product.category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden glass-strong border-border">
        <DialogTitle className="sr-only">{product.product_name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-muted">
            <img src={img} alt={product.product_name} className="size-full object-cover" />
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div>
              <span className="text-xs font-script text-primary">Premium Selection</span>
              <h2 className="font-serif text-2xl md:text-3xl mt-1">{product.product_name}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {product.description || `Wholesale ${product.product_name.toLowerCase()} for cafes and dessert shops.`}
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-gold">{formatINR(product.price)}</div>
              <div className="text-xs text-muted-foreground">per {product.unit} • {product.stock_qty} in stock</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  className="p-2 hover:text-primary"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button
                  className="p-2 hover:text-primary"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                disabled={product.stock_qty <= 0}
                className="flex-1 rounded-full btn-glow"
                onClick={() => {
                  add(
                    {
                      id: product.id,
                      product_id: product.product_id,
                      name: product.product_name,
                      price: Number(product.price),
                      image: product.image,
                      unit: product.unit,
                    },
                    qty,
                  );
                  toast.success(`Added ${qty} × ${product.product_name}`);
                  onOpenChange(false);
                  setQty(1);
                }}
              >
                <ShoppingCart className="size-4 mr-2" /> Add to cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
