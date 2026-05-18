import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({ meta: [{ title: "Order History — Kongsi Admin" }] }),
});

function AdminOrdersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState<Record<string, { order_status: string; payment_status: string }>>({});

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdmin, navigate]);

  const { data: orders, error, isLoading } = useQuery({
    queryKey: ["admin-order-history"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, order_id, customer_name, phone, address, total_amount, order_status, payment_status, created_at, store_id, store:store_id(store_id, store_name, owner_name, email)`
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!orders) return;
    const updates: Record<string, { order_status: string; payment_status: string }> = {};
    orders.forEach((order) => {
      updates[order.id] = {
        order_status: order.order_status ?? "pending",
        payment_status: order.payment_status ?? "unpaid",
      };
    });
    setOrderStatusUpdates(updates);
  }, [orders]);

  const orderStatusOptions = ["pending", "packed", "delivered"];
  const paymentStatusOptions = ["paid", "unpaid"];

  async function handleSaveOrderUpdate(orderId: string) {
    const update = orderStatusUpdates[orderId];
    if (!update) return;

    setSavingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: update.order_status, payment_status: update.payment_status })
        .eq("id", orderId);
      if (error) throw error;
      toast.success("Order status updated.");
      queryClient.invalidateQueries(["admin-order-history"]);
    } catch (err) {
      toast.error("Unable to update order status.");
      console.error(err);
    } finally {
      setSavingOrderId(null);
    }
  }

  function updateOrderStatusState(orderId: string, field: "order_status" | "payment_status", value: string) {
    setOrderStatusUpdates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Admin / Orders</p>
            <h1 className="font-serif text-4xl">Order History</h1>
            <p className="text-sm text-muted-foreground">Track all orders placed by stores with status and payment details.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/dashboard">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft className="size-4" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="glass border border-border/60 rounded-3xl p-6">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading orders...</div>
          ) : error ? (
            <div className="rounded-3xl border border-red-300/70 bg-red-50 p-8 text-red-700">
              <p className="text-lg font-semibold">Unable to load order history</p>
              <p className="mt-2 text-sm">{String(error)}</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No order history available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-muted text-sm uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-4 font-semibold">{order.order_id}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{order.store?.store_name ?? order.store_id}</div>
                        <div className="text-muted-foreground text-xs">{order.store?.store_id ?? "Store ID unavailable"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div>{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="px-4 py-4">{formatINR(Number(order.total_amount))}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <select
                            value={orderStatusUpdates[order.id]?.order_status ?? order.order_status ?? "pending"}
                            onChange={(e) => updateOrderStatusState(order.id, "order_status", e.target.value)}
                            className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <select
                            value={orderStatusUpdates[order.id]?.payment_status ?? order.payment_status ?? "unpaid"}
                            onChange={(e) => updateOrderStatusState(order.id, "payment_status", e.target.value)}
                            className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                          >
                            {paymentStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={
                              savingOrderId === order.id ||
                              (orderStatusUpdates[order.id]?.order_status === order.order_status &&
                                orderStatusUpdates[order.id]?.payment_status === order.payment_status)
                            }
                            onClick={() => handleSaveOrderUpdate(order.id)}
                            className="rounded-full"
                          >
                            Save
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
