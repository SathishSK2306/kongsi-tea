import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { setStoreSession } from "@/lib/store-session";
// import { useAuth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    redirect: z.string().optional().default("/"),
  }),

  component: AuthPage,

  head: () => ({
    meta: [{ title: "Sign in — Kongsi" }],
  }),
});

function AuthPage() {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // useEffect(() => {
  //   if (user) {
  //     navigate({ to: redirect || "/" });
  //   }
  // }, [user, navigate, redirect]);

  function onMouseMove(e: React.MouseEvent) {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;

    setTilt({
      rx: -py * 8,
      ry: px * 10,
    });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

 async function doSignin(
  e: React.FormEvent
) {
  e.preventDefault();

  setBusy(true);

  try {
    const cleanEmail =
      email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data, error } =
      await supabase.rpc("verify_store_login", {
        p_email: cleanEmail,
        p_password: cleanPassword,
      });

    if (error) {
      throw error;
    }

    const store = Array.isArray(data) ? data[0] : data;

    if (!store) {
      toast.error(
        "Invalid store email or password"
      );

      setBusy(false);
      return;
    }

    setStoreSession(store);

    toast.success(
      `Welcome ${store.store_name}`
    );

    navigate({
      to: redirect || "/",
    });

  } catch (err) {
    console.error(err);

    toast.error(
      "Verification failed"
    );

  } finally {
    setBusy(false);
  }
}

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#071b2f] px-3 py-4 text-white sm:px-5 sm:py-8 md:grid md:place-items-center">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 0%, rgba(86,162,201,0.26), transparent 34%), radial-gradient(circle at 92% 18%, rgba(75,174,214,0.2), transparent 30%), linear-gradient(135deg, #0a2038 0%, #07172a 46%, #03101f 100%)",
        }}
      />
      <div aria-hidden className="absolute -left-24 top-0 h-64 w-64 rounded-full border-[42px] border-cyan-300/5 md:h-96 md:w-96" />
      <div aria-hidden className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border-[44px] border-cyan-300/5 md:h-[30rem] md:w-[30rem]" />
      <div aria-hidden className="absolute right-0 top-24 h-[34rem] w-[34rem] rounded-full bg-cyan-400/5 blur-3xl" />

      {/* Floating Coffee Beans */}
      {Array.from({
        length: typeof window !== "undefined" && window.innerWidth < 640 ? 7 : 13,
      }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.6;
        const dur = 9 + (i % 5) * 1.3;
        const size = 10 + ((i * 5) % 18);

        return (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: "110%",
              width: size,
              height: size * 1.4,
              background:
                i % 3 === 0
                  ? "radial-gradient(ellipse at center, #12d7ff 0%, #1b7db6 68%, #07345a 100%)"
                  : "radial-gradient(ellipse at center, #9a5a35 0%, #4c2414 72%, #1e0c07 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 22px rgba(20,203,255,0.16)",
              opacity: 0.78,
              transform: "rotate(-28deg)",
            }}
            animate={{
              y: ["0%", "-130vh"],
              rotate: [0, 360],
            }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}

      {/* Login Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
        }}
        className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-cyan-200/15 bg-white/[0.04] shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl md:min-h-[620px] md:grid-cols-[1.12fr_0.88fr]"
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-cyan-300/12 via-transparent to-cyan-950/30" />
        <div aria-hidden className="absolute -left-20 top-20 h-[34rem] w-[34rem] rounded-full bg-[#06182b] shadow-[0_0_0_1px_rgba(125,236,255,0.25),0_0_60px_rgba(26,202,255,0.2)]" />
        <motion.div
          aria-hidden
          className="absolute left-[-8%] top-[14%] h-[105%] w-[72%] rounded-[50%] border-r border-cyan-200/30"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex min-h-[260px] flex-col justify-center p-6 sm:p-8 md:min-h-[620px] md:p-12">
          <div>
            <div className="grid size-12 place-items-center rounded-full border border-cyan-100/70 text-xs font-semibold text-cyan-50">
              K
            </div>
            <h1 className="mt-12 max-w-sm text-4xl font-light tracking-[0.2em] text-cyan-50 sm:text-5xl md:mt-16">
              KONGSI
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-cyan-50/70">
              Partner access for coffee, tea, packaging and cafe supply orders.
            </p>
          </div>

          <div className="relative mt-10 h-28 overflow-hidden rounded-[24px] border border-cyan-100/15 bg-cyan-50/5 shadow-2xl shadow-cyan-950/40 sm:h-36 md:h-48">
            <motion.div
              aria-hidden
              className="absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-2xl"
              animate={{ x: [0, 120, 0], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute -inset-y-20 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent blur-sm"
              animate={{ x: ["0%", "430%"] }}
              transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
            />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(103,232,249,0.18),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%,rgba(0,0,0,0.16))]" />
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute size-1 rounded-full bg-cyan-100/70 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
                style={{
                  left: `${8 + ((i * 19) % 84)}%`,
                  top: `${12 + ((i * 23) % 76)}%`,
                }}
                animate={{ y: [0, -18, 0], opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.4, 0.7] }}
                transition={{ duration: 3.5 + (i % 5) * 0.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
            <div className="absolute inset-x-5 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
          </div>
        </div>

        <div className="relative flex items-center p-5 sm:p-8 md:p-10" style={{ transform: "translateZ(40px)" }}>
          <div className="w-full rounded-[24px] border border-cyan-100/15 bg-[#071b2f]/55 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-7">
          <h2 className="font-serif text-3xl text-cyan-50 sm:text-4xl">
            Customer Login
          </h2>
          <p className="mt-2 text-sm leading-6 text-cyan-50/65">
            Sign in using your partner store email and password.
          </p>
          {/* Form */}
          <form onSubmit={doSignin} className="space-y-3.5 sm:space-y-4 mt-5 sm:mt-7">
            {/* Store Email */}
            <div className="space-y-1.5">
              <Label className="text-[rgba(255,245,235,0.85)]">Store Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,245,235,0.5)]" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="store@example.com"
                  className="pl-9 bg-white/10 border-cyan-100/20 text-cyan-50 placeholder:text-cyan-50/35"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label className="text-[rgba(255,245,235,0.85)]">Password</Label>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,245,235,0.5)]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="9-character password"
                  className="pl-9 pr-11 bg-white/10 border-cyan-100/20 text-cyan-50 placeholder:text-cyan-50/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cyan-50/65 hover:bg-white/10 hover:text-cyan-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full btn-glow h-10 sm:h-11 text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #68d7eb 0%, #2f86ad 100%)",
                color: "#06182b",
              }}
            >
              {busy ? "Verifying..." : (
                <>
                  Enter Application
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs mt-6 text-[rgba(255,245,235,0.55)]">
            Partner-only access. Contact admin if you forgot your store email or password.
          </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
