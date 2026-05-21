import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Mail, MapPin, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  clearStoreSession,
  getStoreSession,
  setStoreSession,
} from "@/lib/store-session";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Account - Kongsi" }] }),
});

function AccountPage() {
  const navigate = useNavigate();
  const storeSession = getStoreSession();

  useEffect(() => {
    if (!storeSession) {
      navigate({ to: "/auth", search: { redirect: "/account" } });
    }
  }, [storeSession, navigate]);

  const { data: store, isLoading } = useQuery({
    queryKey: ["store-account", storeSession?.id],
    enabled: !!storeSession,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, store_id, store_name, owner_name, phone, address, email, status")
        .eq("id", storeSession!.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        clearStoreSession();
        navigate({ to: "/auth", search: { redirect: "/account" } });
        return null;
      }

      setStoreSession(data);
      return data;
    },
  });

  if (!storeSession || isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading account...
      </div>
    );
  }

  if (!store) return null;

  const details = [
    { label: "Store ID", value: store.store_id, Icon: Building2 },
    { label: "Owner", value: store.owner_name, Icon: User },
    { label: "Email", value: store.email || "-", Icon: Mail },
    { label: "Phone", value: store.phone || "-", Icon: Phone },
    { label: "Address", value: store.address || "-", Icon: MapPin },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Store Account</p>
            <h1 className="font-serif text-4xl md:text-5xl">{store.store_name}</h1>
          </div>

          <Link to="/orders">
            <Button className="rounded-full btn-glow gap-2">
              View Orders
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="glass border border-border/60 rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Store Details</h2>
              <p className="text-sm text-muted-foreground">
                These details are linked to your store email and Store ID.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
              Active
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {details.map(({ label, value, Icon }) => (
              <div key={label} className="rounded-2xl border border-border/50 bg-card/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" />
                  {label}
                </div>
                <p className="break-words text-base font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
