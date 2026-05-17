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
        className="card-hover group relative rounded-2xl overflow-hidden glass border border-border/60 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={img}
            alt={product.product_name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent opacity-90" />
          {product.featured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-primary/90 text-primary-foreground">
              Featured
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-serif text-lg leading-tight line-clamp-1">{product.product_name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
            {product.description || `Premium ${product.product_name.toLowerCase()}`}
          </p>
          <div className="flex items-end justify-between pt-1">
            <div>
              <div className="text-lg font-semibold text-gradient-gold">{formatINR(product.price)}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                per {product.unit}
              </div>
            </div>
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
