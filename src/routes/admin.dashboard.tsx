import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { BarChart3, CalendarDays, LogOut, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard - Kongsi" }] }),
});

type AdminOrder = {
  id: string;
  order_id: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
};

const chartColors = ["#c98a5a", "#7a4a2a", "#22c55e", "#60a5fa", "#f59e0b", "#ef4444"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "short" });
}

function AdminDashboard() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: "/admin/login" });
      return;
    }

    if (!authLoading && isAdmin) {
      loadStats();
    }
  }, [authLoading, isAdmin, navigate]);

  async function loadStats() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_id, customer_name, total_amount, order_status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data || []) as AdminOrder[]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    toast.success("Logged out successfully");
    navigate({ to: "/admin/login" });
  }

  const analytics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
    const currentMonth = monthKey(now);

    const todayOrders = orders.filter((order) => {
      const created = new Date(order.created_at).getTime();
      return created >= todayStart && created < tomorrowStart;
    });

    const currentMonthOrders = orders.filter((order) => monthKey(new Date(order.created_at)) === currentMonth);

    const monthlyData = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = monthKey(date);
      const monthOrders = orders.filter((order) => monthKey(new Date(order.created_at)) === key);

      return {
        month: monthLabel(date),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      };
    });

    const statusData = Object.entries(
      currentMonthOrders.reduce<Record<string, number>>((acc, order) => {
        const status = order.order_status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return {
      todayOrders,
      todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      currentMonthOrders,
      monthlyRevenue: currentMonthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      monthlyData,
      statusData,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card/20 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid gap-5 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="glass border border-border/60 rounded-3xl p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            <h2 className="font-serif text-3xl mt-2">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Review orders, products, and store records.</p>
          </div>

          <div className="grid gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "..." : orders.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <p className="text-sm text-muted-foreground">Today Revenue</p>
              <p className="mt-2 text-2xl font-semibold">{loading ? "..." : formatINR(analytics.todayRevenue)}</p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-5">
            <nav className="space-y-3">
              <Link to="/admin/orders" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>View Orders</span>
                  <ShoppingCart className="size-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link to="/admin/products" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>Manage Products</span>
                  <BarChart3 className="size-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link to="/admin/customers" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>Visit Stores</span>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </Button>
              </Link>
            </nav>
          </div>

          <div className="mt-6 border-t border-border/50 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
              <p className="text-sm font-medium">Signed in as</p>
              <Button onClick={handleLogout} variant="secondary" className="gap-2">
                <LogOut className="size-4" /> Sign Out
              </Button>
            </div>
            <p className="mt-3 break-all text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </aside>

        <main className="space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border/60 rounded-3xl p-4 sm:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Analytics</p>
                <h1 className="font-serif text-3xl sm:text-4xl mt-1">Today and monthly performance</h1>
              </div>
              <Button type="button" variant="secondary" onClick={loadStats} disabled={loading} className="rounded-full">
                Refresh
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass border border-border/60 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Today Orders</p>
                  <p className="mt-2 font-serif text-4xl">{loading ? "..." : analytics.todayOrders.length}</p>
                </div>
                <CalendarDays className="size-6 text-primary" />
              </div>
            </div>
            <div className="glass border border-border/60 rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">Current Month Orders</p>
              <p className="mt-2 font-serif text-4xl">{loading ? "..." : analytics.currentMonthOrders.length}</p>
            </div>
            <div className="glass border border-border/60 rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="mt-2 font-serif text-3xl">{loading ? "..." : formatINR(analytics.monthlyRevenue)}</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="glass border border-border/60 rounded-3xl p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">Monthly Orders & Revenue</h2>
                <p className="text-sm text-muted-foreground">Last six months order count with revenue trend.</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="orders" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis yAxisId="revenue" orientation="right" tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "revenue" ? [formatINR(Number(value)), "Revenue"] : [value, "Orders"]
                      }
                    />
                    <Bar yAxisId="orders" dataKey="orders" fill="#c98a5a" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass border border-border/60 rounded-3xl p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">Current Month Status</h2>
                <p className="text-sm text-muted-foreground">Order split by status.</p>
              </div>
              <div className="h-72">
                {analytics.statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={4}
                      >
                        {analytics.statusData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    No orders this month.
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {analytics.statusData.map((item, index) => (
                  <span key={item.name} className="rounded-full bg-muted px-3 py-1 text-xs capitalize">
                    <span
                      className="mr-2 inline-block size-2 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass border border-border/60 rounded-3xl p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Today Orders List</h2>
                <p className="text-sm text-muted-foreground">Orders placed today.</p>
              </div>
              <Link to="/admin/orders">
                <Button variant="secondary" className="rounded-full">View Orders</Button>
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Loading orders...</div>
            ) : analytics.todayOrders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No orders placed today.</div>
            ) : (
              <div className="space-y-3">
                {analytics.todayOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border/50 bg-card/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{order.order_id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{order.order_status}</span>
                        <span className="font-semibold">{formatINR(Number(order.total_amount || 0))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
