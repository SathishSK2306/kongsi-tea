import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { CATEGORIES } from "@/lib/categories";
import { Input } from "@/components/ui/input";

const searchSchema = z.object({
  category: z.string().optional().default(""),
  q: z.string().optional().default(""),
});

export const Route = createFileRoute("/menu")({
  validateSearch: searchSchema,
  component: MenuPage,
  head: () => ({ meta: [{ title: "Menu — Kongsi" }] }),
});

function MenuPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [localQ, setLocalQ] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ["products", category, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category as never);
      if (q) query = query.ilike("product_name", `%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  return (
    <div className="container mx-auto px-4">
      <div className="text-center pt-4">
        <span className="font-script text-2xl text-primary">Catalog</span>
        <h1 className="font-serif text-4xl md:text-5xl">Our Full Menu</h1>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate({ search: (p: { category: string; q: string }) => ({ ...p, q: localQ }) });
            }}
            placeholder="Search products..."
            className="pl-9 rounded-full bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => navigate({ search: (p: { category: string; q: string }) => ({ ...p, category: "" }) })}
            className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border ${!category ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => navigate({ search: (p: { category: string; q: string }) => ({ ...p, category: c.key }) })}
              className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border ${category === c.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : data?.length === 0
            ? <div className="col-span-full text-center py-20 text-muted-foreground">No products found. <Link to="/menu" search={{ category: "", q: "" }} className="text-primary underline">Reset filters</Link></div>
            : data?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
