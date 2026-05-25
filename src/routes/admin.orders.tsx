import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CalendarDays, CreditCard, FileText, PackageCheck, Printer, Search, Trash2, X } from "lucide-react";

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
  const [savingReportId, setSavingReportId] = useState<string | null>(null);
  const [billOrder, setBillOrder] = useState<any | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [filters, setFilters] = useState({ search: "", fromDate: "", toDate: "" });
  const [reportStatusUpdates, setReportStatusUpdates] = useState<Record<string, string>>({});
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
          `id, order_id, customer_name, phone, address, total_amount, order_status, payment_status, created_at, store_id, notes, order_items(id, product_name, quantity, price, subtotal), store:store_id(store_id, store_name, owner_name, email)`
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: damageReports, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ["admin-damage-reports"],
    enabled: !authLoading && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("damage_reports")
        .select("id, store_name, store_id, customer_name, contact, order_id, image_url, message, status, created_at")
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

  useEffect(() => {
    if (!damageReports) return;
    const updates: Record<string, string> = {};
    damageReports.forEach((report) => {
      updates[report.id] = report.status || "unsolved";
    });
    setReportStatusUpdates(updates);
  }, [damageReports]);

  const orderStatusOptions = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];
  const paymentStatusOptions = ["paid", "unpaid"];
  const complaintStatusOptions = ["unsolved", "solved"];

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

  function handleDownloadPDF(order: NonNullable<typeof orders>[number]) {
    setBillOrder(order);
  }

  function handlePrintBill() {
    window.print();
  }

  async function handleSaveReportStatus(reportId: string) {
    const status = reportStatusUpdates[reportId];
    if (!status) return;

    setSavingReportId(reportId);
    try {
      const { error } = await supabase
        .from("damage_reports")
        .update({ status } as never)
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Complaint status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-damage-reports"] });
    } catch (err) {
      console.error(err);
      toast.error("Unable to update complaint status.");
    } finally {
      setSavingReportId(null);
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

  function applyOrderFilters(e?: React.FormEvent) {
    e?.preventDefault();
    setFilters({
      search: searchInput.trim().toLowerCase(),
      fromDate: fromDateInput,
      toDate: toDateInput,
    });
  }

  function clearOrderFilters() {
    setSearchInput("");
    setFromDateInput("");
    setToDateInput("");
    setFilters({ search: "", fromDate: "", toDate: "" });
  }

  const filteredOrders = useMemo(() => {
    const source = orders ?? [];
    const fromTime = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null;
    const toTime = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999`).getTime() : null;

    return source.filter((order) => {
      const orderTime = new Date(order.created_at).getTime();
      const matchesDate =
        (fromTime === null || orderTime >= fromTime) &&
        (toTime === null || orderTime <= toTime);

      if (!matchesDate) return false;

      if (!filters.search) return true;

      const haystack = [
        order.order_id,
        order.customer_name,
        order.phone,
        order.address,
        order.store?.store_name,
        order.store?.email,
        order.store?.store_id,
        order.store_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(filters.search);
    });
  }, [filters, orders]);

  if (authLoading || !isAdmin) return null;

  const totalRevenue =
    filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingOrders =
    filteredOrders.filter((order) => (order.order_status || "pending") === "pending").length;
  const paidOrders =
    filteredOrders.filter((order) => (order.payment_status || "unpaid") === "paid").length;
  const openReports =
    damageReports?.filter((report) => (report.status || "unsolved") !== "solved").length ?? 0;

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

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="glass border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="mt-2 font-serif text-3xl">{isLoading ? "..." : filteredOrders.length}</p>
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
          <div className="glass border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Complaints</p>
                <p className="mt-2 font-serif text-3xl">{reportsLoading ? "..." : openReports}</p>
              </div>
              <AlertTriangle className="size-5 text-primary" />
            </div>
          </div>
        </div>

        <form onSubmit={applyOrderFilters} className="mb-6 glass border border-border/60 rounded-3xl p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Search Orders</h2>
            <p className="text-sm text-muted-foreground">
              Search by store email, store name, customer name, contact number, store ID, or order ID.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
            <div>
              <label htmlFor="order_search" className="mb-1.5 block text-sm text-muted-foreground">
                Search
              </label>
              <input
                id="order_search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Store email, name, phone..."
                className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="from_date" className="mb-1.5 block text-sm text-muted-foreground">
                From date
              </label>
              <input
                id="from_date"
                type="date"
                value={fromDateInput}
                onChange={(e) => setFromDateInput(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="to_date" className="mb-1.5 block text-sm text-muted-foreground">
                To date
              </label>
              <input
                id="to_date"
                type="date"
                value={toDateInput}
                onChange={(e) => setToDateInput(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-11 w-full rounded-full gap-2">
                <Search className="size-4" />
                Search
              </Button>
            </div>
            <div className="flex items-end">
              <Button type="button" variant="secondary" onClick={clearOrderFilters} className="h-11 w-full rounded-full">
                Clear
              </Button>
            </div>
          </div>
          {(filters.search || filters.fromDate || filters.toDate) && (
            <p className="mt-4 text-sm text-muted-foreground">
              Showing {filteredOrders.length} matching order{filteredOrders.length === 1 ? "" : "s"}.
            </p>
          )}
        </form>

        <div className="mb-6 glass border border-border/60 rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Complaints</h2>
              <p className="text-sm text-muted-foreground">Damage reports submitted from customer accounts.</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              {damageReports?.length ?? 0} reports
            </div>
          </div>

          {reportsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading complaints...</div>
          ) : reportsError ? (
            <div className="rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm text-red-700">
              Unable to load complaints. Apply the latest damage reports migration if this is a fresh database.
            </div>
          ) : !damageReports || damageReports.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No complaints registered yet.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {damageReports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{report.order_id}</p>
                      <h3 className="mt-1 text-lg font-semibold">{report.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.store_name} · {report.store_id}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{report.contact}</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      <select
                        value={reportStatusUpdates[report.id] || report.status || "unsolved"}
                        onChange={(e) =>
                          setReportStatusUpdates((prev) => ({
                            ...prev,
                            [report.id]: e.target.value,
                          }))
                        }
                        className="rounded-xl border border-border bg-background/80 px-3 py-2 text-sm capitalize"
                      >
                        {complaintStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={savingReportId === report.id || (reportStatusUpdates[report.id] || "unsolved") === (report.status || "unsolved")}
                        onClick={() => handleSaveReportStatus(report.id)}
                        className="rounded-full"
                      >
                        {savingReportId === report.id ? "Saving..." : "Save Status"}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6">{report.message}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{new Date(report.created_at).toLocaleString()}</span>
                    {report.image_url && (
                      <a
                        href={report.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
                      >
                        View Image
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No orders match your search filters.</div>
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
                  {filteredOrders.map((order) => (
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
                            title="Print Bill"
                            onClick={() => handleDownloadPDF(order)}
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

      {billOrder && (
        <div className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm print:static print:bg-white print:p-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #bill-print-area, #bill-print-area * {
                visibility: visible !important;
              }
              #bill-print-area {
                position: absolute !important;
                inset: 0 auto auto 0 !important;
                width: 100% !important;
                margin: 0 !important;
              }
              @page {
                size: A4;
                margin: 12mm;
              }
            }
          `}</style>
          <div className="mx-auto flex max-h-[calc(100dvh-1.5rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4 print:hidden">
              <div>
                <h2 className="text-xl font-semibold">Bill Preview</h2>
                <p className="text-sm text-muted-foreground">Order {billOrder.order_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={handlePrintBill} className="rounded-full gap-2">
                  <Printer className="size-4" />
                  Print Bill
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setBillOrder(null)} className="rounded-full">
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0">
              <div id="bill-print-area">
                <BillPreview order={billOrder} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BillPreview({ order }: { order: any }) {
  const items = (order.order_items || []) as Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  const total = Number(order.total_amount || 0);
  const subtotal = items.length > 0 ? items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) : total;
  const delivery = Math.max(total - subtotal, 0);

  return (
    <div className="mx-auto max-w-[720px] bg-white p-6 text-slate-950 shadow-sm print:max-w-none print:p-8 print:shadow-none">
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Kongsi</p>
            <h1 className="mt-1 text-3xl font-bold tracking-wide">Tax Invoice</h1>
            <p className="mt-2 text-sm text-slate-600">Wholesale coffee, tea and cafe supplies</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold">Order ID</p>
            <p className="font-mono text-lg">{order.order_id}</p>
            <p className="mt-2 text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 py-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bill To</p>
          <h2 className="mt-2 text-lg font-semibold">{order.customer_name}</h2>
          <p className="mt-1 text-sm text-slate-700">{order.phone}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{order.address}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Store</p>
          <h2 className="mt-2 text-lg font-semibold">{order.store?.store_name ?? "Store details unavailable"}</h2>
          <p className="mt-1 text-sm text-slate-700">{order.store?.store_id ?? order.store_id}</p>
          <p className="mt-1 text-sm text-slate-700">{order.store?.email ?? ""}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-slate-600" colSpan={4}>
                  No line items available for this order.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.product_name}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatINR(Number(item.price || 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(Number(item.subtotal || 0))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ml-auto mt-5 w-full max-w-sm space-y-2 text-sm">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold">{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-600">Delivery</span>
          <span className="font-semibold">{delivery > 0 ? formatINR(delivery) : "Free"}</span>
        </div>
        <div className="flex justify-between pt-2 text-xl font-bold">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3">
        <div>
          <p className="font-semibold">Order Status</p>
          <p className="mt-1 capitalize text-slate-600">{order.order_status || "pending"}</p>
        </div>
        <div>
          <p className="font-semibold">Payment</p>
          <p className="mt-1 capitalize text-slate-600">{order.payment_status || "unpaid"}</p>
        </div>
        <div>
          <p className="font-semibold">Generated</p>
          <p className="mt-1 text-slate-600">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Notes: </span>
          {order.notes}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">Thank you for ordering with Kongsi.</p>
    </div>
  );
}
