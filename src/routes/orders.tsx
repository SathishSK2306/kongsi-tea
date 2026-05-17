import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Package, Clock, Truck, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Admin Orders — Kongsi" }] }),
});

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="size-4" />, color: "bg-amber-500/20 text-amber-300", label: "Pending" },
  packed: { icon: <Package className="size-4" />, color: "bg-blue-500/20 text-blue-300", label: "Packed" },
  shipped: { icon: <Truck className="size-4" />, color: "bg-purple-500/20 text-purple-300", label: "Shipped" },
  delivered: { icon: <CheckCircle2 className="size-4" />, color: "bg-emerald-500/20 text-emerald-300", label: "Delivered" },
  cancelled: { icon: <AlertCircle className="size-4" />, color: "bg-red-500/20 text-red-300", label: "Cancelled" },
};

function OrdersPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, isAdmin, navigate]);

  const { data: orders, error, isLoading } = useQuery({
    enabled: isAdmin,
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl md:text-5xl mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </motion.div>

      {isLoading ? (
        <div className="mt-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16 text-center"
        >
          <div className="rounded-3xl border border-red-300/70 bg-red-50 p-8">
            <p className="text-xl font-semibold text-red-700">Unable to load orders</p>
            <p className="mt-2 text-sm text-red-600">{String(error)}</p>
            <p className="mt-4 text-sm text-muted-foreground">Please make sure you are signed in with the admin account to view order data.</p>
          </div>
        </motion.div>
      ) : orders?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-muted mb-6">
            <Package className="size-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to place your first order.</p>
          <Link to="/menu">
            <Button className="rounded-full btn-glow">Browse Catalog</Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="mt-8 space-y-4"
        >
          {orders?.map((o, idx) => {
            const status = o.order_status || "pending";
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass border border-border rounded-2xl p-5 hover:border-border/80 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono text-sm text-primary font-semibold">{o.order_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase rounded-full font-medium ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </div>
                    <span className="font-semibold text-gradient-gold text-lg">{formatINR(Number(o.total_amount))}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground border-t border-border/30 pt-3">
                  <div className="font-medium text-foreground mb-1">Items:</div>
                  <div className="flex flex-wrap gap-1">
                    {(o.order_items as { product_name: string; quantity: number }[])?.map((it, i) => (
                      <span key={i} className="inline-block">
                        {it.product_name} × {it.quantity}
                        {i < (o.order_items as any).length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
