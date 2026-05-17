import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — Kongsi" }] }),
});

function AdminDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/admin/login" });
      return;
    }

    loadStats();
  }, [isAdmin, navigate]);

  async function loadStats() {
    try {
      // Fetch orders
      const { data: orders, error: ordersErr } = await supabase
        .from("orders")
        .select("total_amount");
      if (ordersErr) throw ordersErr;

      // Fetch products
      const { data: products, error: productsErr } = await supabase
        .from("products")
        .select("id");
      if (productsErr) throw productsErr;

      // Fetch customers/stores
      const { data: stores, error: storesErr } = await supabase
        .from("stores")
        .select("id");
      if (storesErr) throw storesErr;

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0,
        totalProducts: products?.length || 0,
        totalCustomers: stores?.length || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    toast.success("Logged out successfully");
    navigate({ to: "/admin/login" });
  }

  const statCards = [
    { icon: ShoppingCart, label: "Total Orders", value: stats.totalOrders, color: "text-blue-500" },
    { icon: TrendingUp, label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-emerald-500" },
    { icon: Package, label: "Products", value: stats.totalProducts, color: "text-amber-500" },
    { icon: Users, label: "Store Partners", value: stats.totalCustomers, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="glass border border-border/60 rounded-3xl p-6 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            <h2 className="font-serif text-3xl mt-2">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use these controls to manage orders, products and stores.</p>
          </div>

          <div className="grid gap-4 mb-8">
            <div className="rounded-3xl border border-border/60 bg-card p-4">
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "..." : stats.totalOrders}</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-4">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "..." : stats.totalProducts}</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-4">
              <p className="text-sm text-muted-foreground">Store Partners</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "..." : stats.totalCustomers}</p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            <nav className="space-y-3">
              <Link to="/admin/orders" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>View Orders</span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{loading ? "..." : stats.totalOrders}</span>
                </Button>
              </Link>
              <Link to="/admin/products" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>Manage Products</span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{loading ? "..." : stats.totalProducts}</span>
                </Button>
              </Link>
              <Link to="/admin/customers" className="block">
                <Button variant="ghost" className="w-full justify-between rounded-2xl py-4 text-left">
                  <span>View Stores</span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{loading ? "..." : stats.totalCustomers}</span>
                </Button>
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-border/50 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Signed in as</p>
              <Button onClick={handleLogout} variant="secondary" className="gap-2">
                <LogOut className="size-4" /> Sign Out
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </aside>

        <main className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border/60 rounded-3xl p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quick overview</p>
                <h2 className="font-serif text-3xl mt-1">Manage your store network</h2>
              </div>
              <p className="text-sm text-muted-foreground">Use the left menu to review orders, update products, and manage store records.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass border border-border/60 rounded-2xl p-6 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                      <p className="font-serif text-3xl">{loading ? "..." : card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-muted ${card.color}`}>
                      <Icon className="size-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
