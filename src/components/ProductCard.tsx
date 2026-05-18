import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { CATEGORY_IMG, type CategoryKey } from "@/lib/categories";
import { toast } from "sonner";
import { ProductPreview } from "./ProductPreview";

export type Product = {
  id: string;
  product_id: string;
  product_name: string;
  description: string | null;
  image: string | null;
  price: number;
  stock_qty: number;
  unit: string;
  category: CategoryKey;
  featured: boolean;
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const img = product.image || CATEGORY_IMG[product.category];
  const oos = product.stock_qty <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    add({
      id: product.id,
      product_id: product.product_id,
      name: product.product_name,
      price: Number(product.price),
      image: product.image,
      unit: product.unit,
    });
    toast.success("Added to cart", { description: product.product_name });
  };

  return (
    <>
      <motion.article
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.5 }}
        className="group relative overflow-hidden rounded-[28px] glass border border-border/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(67,51,27,0.8)]"
      >
        <div className="relative overflow-hidden bg-muted">
          <div className="aspect-4/3 w-full overflow-hidden rounded-t-[28px]">
            <img
              src={img}
              alt={product.product_name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />
            {product.featured && (
              <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground shadow-sm">
                Featured
              </span>
            )}
          </div>
        </div>
        <div className="p-3 space-y-2 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg leading-tight line-clamp-1">{product.product_name}</h3>
            <div className="rounded-2xl bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-950 shadow-inner shadow-amber-100/60">
              {formatINR(product.price)}
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground line-clamp-2 min-h-10">
            {product.description || `Premium ${product.product_name.toLowerCase()}`}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.26em] text-muted-foreground">per {product.unit}</span>
            <Button
              size="icon"
              disabled={oos}
              onClick={handleAddToCart}
              className="rounded-full btn-glow"
              aria-label="Add to cart"
            >
              <ShoppingCart className="size-4" />
            </Button>
          </div>
        </div>
      </motion.article>

      <ProductPreview product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
