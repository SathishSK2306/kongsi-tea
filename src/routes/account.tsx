import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Building2, ImageUp, Mail, MapPin, Phone, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  clearStoreSession,
  getStoreSession,
  setStoreSession,
} from "@/lib/store-session";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Account - Kongsi" }] }),
});

function AccountPage() {
  const navigate = useNavigate();
  const storeSession = getStoreSession();
  const [reportOpen, setReportOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [report, setReport] = useState({
    customer_name: "",
    contact: "",
    order_id: "",
    message: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

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
        .rpc("get_store_session", { p_store_uuid: storeSession!.id });

      if (error) throw error;

      const store = data?.[0] ?? null;

      if (!store) {
        clearStoreSession();
        navigate({ to: "/auth", search: { redirect: "/account" } });
        return null;
      }

      setStoreSession(store);
      return store;
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

  async function handleDamageReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!store || !storeSession) return;

    if (!report.customer_name.trim() || !report.contact.trim() || !report.order_id.trim() || !report.message.trim()) {
      toast.error("Please fill all damage report details.");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a damaged product image.");
      return;
    }

    setSubmittingReport(true);
    try {
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const imagePath = `${storeSession.id}/${Date.now()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("damage-report-images")
        .upload(imagePath, imageFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicImage } = supabase.storage
        .from("damage-report-images")
        .getPublicUrl(imagePath);

      const { error } = await supabase.from("damage_reports").insert({
        store_uuid: store.id,
        store_name: store.store_name,
        store_id: store.store_id,
        customer_name: report.customer_name.trim(),
        contact: report.contact.trim(),
        order_id: report.order_id.trim(),
        image_url: publicImage.publicUrl,
        message: report.message.trim(),
      } as never);

      if (error) throw error;

      toast.success("Damage report sent to admin.");
      setReport({ customer_name: "", contact: "", order_id: "", message: "" });
      setImageFile(null);
      setReportOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Unable to send damage report.");
    } finally {
      setSubmittingReport(false);
    }
  }

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

        <div className="mt-6 glass border border-border/60 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <AlertTriangle className="size-5" />
                <span className="text-sm font-medium">Help</span>
              </div>
              <h2 className="text-2xl font-semibold">Damaged Product Report</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send product damage details directly to the admin team.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setReportOpen((open) => !open)}
              className="rounded-full gap-2"
              variant={reportOpen ? "secondary" : "default"}
            >
              <ImageUp className="size-4" />
              {reportOpen ? "Close Form" : "Report Damage"}
            </Button>
          </div>

          {reportOpen && (
            <form onSubmit={handleDamageReportSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="damage_store_name">Store name</Label>
                <Input id="damage_store_name" value={store.store_name} disabled />
              </div>
              <div>
                <Label htmlFor="damage_store_id">Store ID</Label>
                <Input id="damage_store_id" value={store.store_id} disabled />
              </div>
              <div>
                <Label htmlFor="damage_customer_name">Customer name</Label>
                <Input
                  id="damage_customer_name"
                  required
                  value={report.customer_name}
                  onChange={(e) => setReport({ ...report, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="damage_contact">Contact</Label>
                <Input
                  id="damage_contact"
                  required
                  value={report.contact}
                  onChange={(e) => setReport({ ...report, contact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>
              <div>
                <Label htmlFor="damage_order_id">Order ID</Label>
                <Input
                  id="damage_order_id"
                  required
                  value={report.order_id}
                  onChange={(e) => setReport({ ...report, order_id: e.target.value })}
                  placeholder="ORD-..."
                />
              </div>
              <div>
                <Label htmlFor="damage_image">Damaged product image</Label>
                <Input
                  id="damage_image"
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="damage_message">Message</Label>
                <Textarea
                  id="damage_message"
                  required
                  rows={4}
                  value={report.message}
                  onChange={(e) => setReport({ ...report, message: e.target.value })}
                  placeholder="Describe the damaged product and issue."
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submittingReport} className="rounded-full gap-2">
                  <Send className="size-4" />
                  {submittingReport ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
