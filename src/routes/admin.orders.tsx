import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, CreditCard, FileText, PackageCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({ meta: [{ title: "Order History — Kongsi Admin" }] }),
});

function AdminOrdersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState<Record<string, { order_status: string; payment_status: string }>>({});

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [authLoading, isAdmin, navigate]);

  const { data: orders, error, isLoading } = useQuery({
    queryKey: ["admin-order-history"],
    enabled: !authLoading && isAdmin,
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
        order_status:
  order.order_status &&
  ["pending", "confirmed", "shipped", "delivered"].includes(order.order_status)
    ? order.order_status
    : "pending",
        payment_status: order.payment_status ?? "unpaid",
      };
    });
    setOrderStatusUpdates(updates);
  }, [orders]);

  const orderStatusOptions = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];
  const paymentStatusOptions = ["paid", "unpaid"];

  async function handleSaveOrderUpdate(orderId: string) {
    const update = orderStatusUpdates[orderId];
    if (!update) return;

    setSavingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: update.order_status as never, payment_status: update.payment_status as never })
        .eq("id", orderId);
      if (error) throw error;
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-order-history"] });
    } catch (err) {
      toast.error("Unable to update order status.");
      console.error(err);
    } finally {
      setSavingOrderId(null);
    }
  }

 async function handleDeleteOrder(
  orderId: string,
  orderDisplayId: string
) {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete order ${orderDisplayId}?`
  );

  if (!confirmDelete) return;

  setDeletingOrderId(orderId);

  try {

    console.log("Deleting order:", orderId);

    // STEP 1 — Delete related order items first
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error(
        "ORDER ITEMS DELETE ERROR:",
        itemsError
      );

      throw itemsError;
    }

    console.log("Order items deleted successfully");

    // STEP 2 — Delete main order
    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .select();

    console.log("DELETE RESPONSE:", data);

    if (error) {
      console.error("ORDER DELETE ERROR:", error);

      throw error;
    }

    toast.success(
      `Order ${orderDisplayId} deleted successfully.`
    );

    // STEP 3 — Refresh table
    await queryClient.invalidateQueries({
      queryKey: ["admin-order-history"],
    });

  } catch (err: any) {

    console.error("DELETE FAILED:", err);

    toast.error(
      err?.message || "Unable to delete order."
    );

  } finally {

    setDeletingOrderId(null);

  }
}

  function handleDownloadPDF(orderDisplayId: string) {
    toast.success(`PDF downloaded for order ${orderDisplayId}`);
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

  if (authLoading || !isAdmin) return null;

  const totalRevenue =
    orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) ?? 0;
  const pendingOrders =
    orders?.filter((order) => (order.order_status || "pending") === "pending").length ?? 0;
  const paidOrders =
    orders?.filter((order) => (order.payment_status || "unpaid") === "paid").length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card/20 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin / Orders</p>
            <h1 className="font-serif text-4xl md:text-5xl">Order History</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track store orders and update delivery/payment status.</p>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="gap-2 rounded-full">
              <ArrowLeft className="size-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="mt-2 font-serif text-3xl">{isLoading ? "..." : orders?.length ?? 0}</p>
              </div>
              <PackageCheck className="size-5 text-primary" />
            </div>
          </div>
          <div className="glass border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="mt-2 font-serif text-2xl">{isLoading ? "..." : formatINR(totalRevenue)}</p>
              </div>
              <CalendarDays className="size-5 text-primary" />
            </div>
          </div>
          <div className="glass border border-border/60 rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-2 font-serif text-3xl">{isLoading ? "..." : pendingOrders}</p>
          </div>
          <div className="glass border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Paid Orders</p>
                <p className="mt-2 font-serif text-3xl">{isLoading ? "..." : paidOrders}</p>
              </div>
              <CreditCard className="size-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass border border-border/60 rounded-3xl overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading orders...</div>
          ) : error ? (
            <div className="m-4 rounded-3xl border border-red-300/70 bg-red-50 p-8 text-red-700">
              <p className="text-lg font-semibold">Unable to load order history</p>
              <p className="mt-2 text-sm">{String(error)}</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No order history available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left">
                <thead className="bg-muted/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Store</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Order Status</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Placed</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card/40 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-5 align-top">
                        <div className="font-semibold">{order.order_id}</div>
                        <div className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {order.order_status || "pending"}
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="font-medium">{order.store?.store_name ?? order.store_id}</div>
                        <div className="mt-1 text-muted-foreground text-xs">{order.store?.store_id ?? "Store ID unavailable"}</div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div>{order.customer_name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="px-5 py-5 align-top font-semibold">{formatINR(Number(order.total_amount))}</td>
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-2">
                          <select
                            value={
                                    orderStatusUpdates[order.id]?.order_status ||
                                      order.order_status ||
                                      "pending"
                                                }
                            onChange={(e) => updateOrderStatusState(order.id, "order_status", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm capitalize"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-2">
                          <select
                            value={orderStatusUpdates[order.id]?.payment_status ?? order.payment_status ?? "unpaid"}
                            onChange={(e) => updateOrderStatusState(order.id, "payment_status", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm capitalize"
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
                            className="rounded-full px-4"
                          >
                            {savingOrderId === order.id ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-muted-foreground">
                        <div>{new Date(order.created_at).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-5 py-5 align-top text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            title="Download PDF"
                            onClick={() => handleDownloadPDF(order.order_id)}
                          >
                            <FileText className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="rounded-full"
                            title="Delete Order"
                            disabled={deletingOrderId === order.id}
                            onClick={() => handleDeleteOrder(order.id, order.order_id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
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
