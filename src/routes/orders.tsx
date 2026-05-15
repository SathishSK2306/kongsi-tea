import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "My Orders — BrewHaven" }] }),
});

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  packed: "bg-blue-500/20 text-blue-300",
  shipped: "bg-purple-500/20 text-purple-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/orders" } });
  }, [loading, user, navigate]);

  const { data: orders, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4">
      <h1 className="font-serif text-4xl md:text-5xl">My Orders</h1>
      {isLoading ? (
        <div className="mt-8 text-muted-foreground">Loading orders...</div>
      ) : orders?.length === 0 ? (
        <div className="mt-16 text-center">
          <Package className="size-16 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Link to="/menu"><Button className="mt-4 rounded-full">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders?.map((o) => (
            <div key={o.id} className="glass border border-border rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-sm text-primary">{o.order_id}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] uppercase rounded-full ${STATUS_COLOR[o.order_status] || ""}`}>{o.order_status}</span>
                  <span className="font-semibold text-gradient-gold">{formatINR(Number(o.total_amount))}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {(o.order_items as { product_name: string; quantity: number }[]).map((it, i) => (
                  <span key={i}>{it.product_name} × {it.quantity}{i < o.order_items.length - 1 ? ", " : ""}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
