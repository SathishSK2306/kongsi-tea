import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getStoreSession } from "@/lib/store-session";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import {
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  PackageCheck,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: CustomerOrdersPage,
});

const STATUS_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    dot: string;
    label: string;
  }
> = {
  pending: {
    icon: <Clock className="size-4" />,
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    label: "Pending",
  },

  confirmed: {
    icon: <PackageCheck className="size-4" />,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
    label: "Confirmed",
  },

  shipped: {
    icon: <Truck className="size-4" />,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
    label: "Shipped",
  },

  delivered: {
    icon: <CheckCircle2 className="size-4" />,
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    dot: "bg-green-400",
    label: "Delivered",
  },

  cancelled: {
    icon: <AlertCircle className="size-4" />,
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    label: "Cancelled",
  },
};

function CustomerOrdersPage() {
  const [storeSession] = useState(() => getStoreSession());

  const { data: orders, isLoading } = useQuery({
    enabled: !!storeSession,

    queryKey: ["customer-orders", storeSession?.id],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("store_id", storeSession?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl mb-8">
        My Orders
      </h1>

      <div className="space-y-5">
        {orders?.map((order, idx) => {
          const status =
            STATUS_CONFIG[order.order_status] ||
            STATUS_CONFIG.pending;

          return (
            <motion.div
  key={order.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: idx * 0.05 }}
  className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-md p-4 shadow-sm"
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="font-semibold text-sm">
        ID: {order.order_id}
      </h2>

      <p className="text-[11px] text-muted-foreground mt-1">
        {new Date(order.created_at).toLocaleDateString()}
      </p>
    </div>

    {/* STATUS */}
    <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </div>

      <span className="text-[11px] font-medium text-green-400 capitalize">
        {order.order_status}
      </span>
    </div>
  </div>

  {/* PRODUCTS */}
  <div className="mt-4">
    <p className="text-xs text-muted-foreground mb-2">
      Products
    </p>

    <div className="flex flex-wrap gap-2">
      {(order.order_items as any[])?.map((item) => (
        <div
          key={item.id}
          className="rounded-full bg-muted px-3 py-1 text-xs"
        >
          {item.product_name} × {item.quantity}
        </div>
      ))}
    </div>
  </div>

  {/* DETAILS */}
  <div className="mt-4 grid grid-cols-2 gap-3">
    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="text-[10px] text-muted-foreground">
        Total
      </p>

      <p className="font-semibold text-sm">
        {formatINR(Number(order.total_amount))}
      </p>
    </div>

    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="text-[10px] text-muted-foreground">
        Payment
      </p>

      <p className="font-semibold text-sm capitalize">
        {order.payment_status}
      </p>
    </div>
  </div>
</motion.div>
          );
        })}
      </div>
    </div>
  );
}
