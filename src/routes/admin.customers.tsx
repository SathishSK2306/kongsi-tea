import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { generateStoreId } from "@/lib/format";

const emptyStore = {
  store_name: "",
  owner_name: "",
  email: "",
  phone: "",
  address: "",
  status: "active",
};

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
  head: () => ({ meta: [{ title: "View Customers — Kongsi" }] }),
});

function AdminCustomersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyStore);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [authLoading, isAdmin, navigate]);

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ["admin-customers"],
    enabled: !authLoading && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, store_id, store_name, owner_name, phone, address, email, status");
      if (error) throw error;
      return data;
    },
  });

  async function createUniqueStoreId() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const storeId = generateStoreId();
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("store_id", storeId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return storeId;
    }

    throw new Error("Unable to generate a unique store ID.");
  }

  async function handleStoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (!form.store_name.trim()) {
      toast.error("Store name is required.");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("stores")
          .update({
            store_name: form.store_name.trim(),
            owner_name: form.owner_name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            status: form.status,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Store updated successfully.");
      } else {
        const storeId = await createUniqueStoreId();

        const { error } = await supabase.from("stores").insert({
          store_id: storeId,
          user_id: user?.id,
          store_name: form.store_name.trim(),
          owner_name: form.owner_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          status: form.status,
        });

        if (error) throw error;
        toast.success("Store added successfully.");
      }

      setForm(emptyStore);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (err) {
      toast.error(editingId ? "Unable to update store." : "Unable to add store.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleEditStore(store: NonNullable<typeof stores>[number]) {
    setEditingId(store.id);
    setForm({
      store_name: store.store_name || "",
      owner_name: store.owner_name || "",
      email: store.email || "",
      phone: store.phone || "",
      address: store.address || "",
      status: store.status || "active",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyStore);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this store?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("stores").delete().eq("id", id);
      if (error) throw error;
      toast.success("Store deleted.");
      if (editingId === id) cancelEdit();
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (err) {
      toast.error("Unable to delete store.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin / Stores</p>
            <h1 className="font-serif text-4xl">View Stores</h1>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="size-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[420px_1fr]">
          <div className="glass border border-border/60 rounded-3xl p-6 h-fit">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-muted p-3 text-primary-foreground">
                {editingId ? <Edit2 className="size-5" /> : <Plus className="size-5" />}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{editingId ? "Edit store" : "Add new store"}</h2>
                <p className="text-sm text-muted-foreground">
                  {editingId ? "Update partner store details and access status." : "Manually create partner store records for onboarding."}
                </p>
              </div>
            </div>
            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <Label htmlFor="store_name">Store name</Label>
                <Input
                  id="store_name"
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                  placeholder="Kongsi Tea House"
                />
              </div>
              <div>
                <Label htmlFor="owner_name">Owner name</Label>
                <Input
                  id="owner_name"
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  placeholder="Samira Patel"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="store@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="123 Market Street, Bangalore"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={saving} className="rounded-full">
                    {editingId ? "Update store" : "Add store"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={cancelEdit} className="rounded-full gap-1">
                      <X className="size-4" /> Cancel
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Status: {form.status}</p>
              </div>
            </form>
          </div>

          <div className="glass border border-border/60 rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Registered stores</h2>
                <p className="text-sm text-muted-foreground">Browse partner stores and remove stale entries.</p>
              </div>
              <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{stores?.length ?? 0} stores</div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground">Loading stores...</div>
            ) : error ? (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-red-700">
                <p className="font-medium">Unable to load store data.</p>
                <p className="mt-2 text-sm">{String(error)}</p>
                <p className="mt-3 text-sm text-muted-foreground">Ensure you are signed in with the admin account.</p>
              </div>
            ) : !stores || stores.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No stores found yet.</div>
            ) : (
              <div className="space-y-4">
                {stores.map((store) => (
                  <div key={store.id} className="rounded-3xl border border-border/50 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{store.store_id}</p>
                        <h3 className="text-xl font-semibold">{store.store_name}</h3>
                        <p className="text-sm text-muted-foreground">Owner: {store.owner_name}</p>
                        <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          store.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        }`}>
                          {store.status === "active" ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="secondary" onClick={() => handleEditStore(store)} className="gap-2">
                          <Edit2 className="size-4" /> Edit
                        </Button>
                        <Button type="button" variant="destructive" onClick={() => handleDelete(store.id)} className="gap-2">
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                      <p>{store.email}</p>
                      <p>{store.phone}</p>
                      <p className="sm:col-span-2">{store.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
