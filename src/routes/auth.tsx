import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Coffee } from "lucide-react";
import { genId } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional().default("/") }),
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Kongsi" }] }),
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  // signin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup
  const [signup, setSignup] = useState({
    email: "", password: "", store_name: "", owner_name: "", phone: "", address: "",
  });

  useEffect(() => {
    if (user) navigate({ to: redirect });
  }, [user, navigate, redirect]);

  async function doSignin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  }

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setBusy(false); return toast.error(error.message); }

    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "customer" });
      await supabase.from("stores").insert({
        user_id: data.user.id,
        store_id: genId("ST-"),
        store_name: signup.store_name,
        owner_name: signup.owner_name,
        phone: signup.phone,
        address: signup.address,
        email: signup.email,
      });
    }
    setBusy(false);
    toast.success("Account created — you're signed in.");
  }

  return (
    <div className="container mx-auto px-4 max-w-md">
      <div className="text-center mb-6">
        <span className="grid place-items-center mx-auto size-12 rounded-full bg-[var(--gradient-amber)]"><Coffee className="size-6 text-primary-foreground" /></span>
        <h1 className="font-serif text-3xl mt-3">Welcome to Kongsi</h1>
        <p className="text-sm text-muted-foreground">Partner store access</p>
      </div>
      <div className="glass border border-border rounded-2xl p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Register Store</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={doSignin} className="space-y-3 mt-4">
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={busy} className="w-full rounded-full btn-glow">{busy ? "Signing in..." : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={doSignup} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>Store name *</Label><Input required value={signup.store_name} onChange={(e) => setSignup({ ...signup, store_name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Owner *</Label><Input required value={signup.owner_name} onChange={(e) => setSignup({ ...signup, owner_name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Phone *</Label><Input required value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} /></div>
                <div className="space-y-1.5 col-span-2"><Label>Address *</Label><Input required value={signup.address} onChange={(e) => setSignup({ ...signup, address: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Email *</Label><Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Password *</Label><Input type="password" required minLength={6} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} /></div>
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full btn-glow">{busy ? "Creating..." : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
