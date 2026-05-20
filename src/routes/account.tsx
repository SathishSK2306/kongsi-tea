import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Store, Mail, Phone, MapPin, Pencil, Save, LogOut, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Account — Kongsi" }] }),
});

type StoreRow = {
  id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  address: string;
  email: string | null;
  store_id: string;
};

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<StoreRow>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  const { data: store, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["my-store", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as StoreRow | null;
    },
  });

  useEffect(() => {
    if (store && !editing) setForm(store);
  }, [store, editing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!store) throw new Error("No store profile found");
      const { error } = await supabase
        .from("stores")
        .update({
          store_name: form.store_name ?? store.store_name,
          owner_name: form.owner_name ?? store.owner_name,
          phone: form.phone ?? store.phone,
          address: form.address ?? store.address,
          email: form.email ?? store.email,
        })
        .eq("id", store.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["my-store"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading || isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <span className="grid place-items-center mx-auto size-14 rounded-full bg-amber-gradient shadow-glow-var">
            <User className="size-7 text-primary-foreground" />
          </span>
          <h1 className="font-serif text-3xl mt-3">My Account</h1>
          <p className="text-sm text-muted-foreground">
            {store?.store_id ? `Store ID: ${store.store_id}` : user?.email}
          </p>
        </div>

        <div className="glass-strong border border-border rounded-3xl p-6 md:p-8 shadow-card-var">
          {!store ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No store profile found for this account.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="space-y-4"
            >
              <Field
                icon={<User className="size-4" />}
                label="Owner Name"
                value={form.owner_name ?? ""}
                editing={editing}
                onChange={(v) => setForm({ ...form, owner_name: v })}
              />
              <Field
                icon={<Store className="size-4" />}
                label="Store Name"
                value={form.store_name ?? ""}
                editing={editing}
                onChange={(v) => setForm({ ...form, store_name: v })}
              />
              <Field
                icon={<Mail className="size-4" />}
                label="Email"
                type="email"
                value={form.email ?? ""}
                editing={editing}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                icon={<Phone className="size-4" />}
                label="Contact Number"
                value={form.phone ?? ""}
                editing={editing}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <Field
                icon={<MapPin className="size-4" />}
                label="Address"
                value={form.address ?? ""}
                editing={editing}
                onChange={(v) => setForm({ ...form, address: v })}
                textarea
              />

              <div className="flex flex-wrap gap-3 pt-2">
                {!editing ? (
                  <Button type="button" onClick={() => setEditing(true)} className="rounded-full btn-glow">
                    <Pencil className="size-4 mr-1.5" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button type="submit" disabled={save.isPending} className="rounded-full btn-glow">
                      <Save className="size-4 mr-1.5" />
                      {save.isPending ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setEditing(false);
                        setForm(store);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/menu">
            <Button variant="outline" className="w-full rounded-full">
              <Package className="size-4 mr-1.5" /> Browse Menu
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth", search: { redirect: "/" } });
            }}
          >
            <LogOut className="size-4 mr-1.5" /> Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon, label, value, editing, onChange, type = "text", textarea = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </Label>
      {editing ? (
        textarea ? (
          <textarea
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-20"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        )
      ) : (
        <div className="px-3 py-2.5 rounded-md bg-[rgba(122,74,42,0.06)] border border-border text-sm">
          {value || <span className="text-muted-foreground">—</span>}
        </div>
      )}
    </div>
  );
}
