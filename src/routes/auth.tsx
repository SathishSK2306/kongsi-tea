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
  Coffee,
  Mail,
  Lock,
  ArrowRight,
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
  const [storeId, setStoreId] = useState("");

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

    const cleanStoreId =
      storeId.trim().toUpperCase();

    const { data, error } =
      await supabase
        .from("stores")
        .select("id, store_id, store_name, owner_name, email, phone, address, status")
        .ilike("email", cleanEmail)
        .ilike("store_id", cleanStoreId)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      toast.error(
        "Invalid Store ID or Email"
      );

      setBusy(false);
      return;
    }

    setStoreSession(data);

    toast.success(
      `Welcome ${data.store_name}`
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
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto flex items-start sm:items-center justify-center px-3 py-4 sm:px-4 sm:py-8 md:py-12">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(231,173,115,0.35), transparent 60%), radial-gradient(900px 600px at 90% 90%, rgba(122,74,42,0.28), transparent 60%), linear-gradient(180deg, #2a1a10 0%, #1a110a 100%)",
        }}
      />

      {/* Floating Coffee Beans */}
      {Array.from({
        length: typeof window !== "undefined" && window.innerWidth < 640 ? 8 : 14,
      }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.6;
        const dur = 8 + (i % 5) * 1.4;
        const size = 10 + ((i * 3) % 14);

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
              background: "radial-gradient(ellipse at center, #6b3a1f 0%, #3a1d0e 80%)",
              boxShadow: "inset 0 0 0 1px rgba(255,220,180,0.15)",
              opacity: 0.55,
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
        className="relative w-full max-w-[min(100%,28rem)] sm:max-w-lg rounded-[22px] sm:rounded-[28px] border border-white/15 p-4 sm:p-6 md:p-8 shadow-2xl mx-auto"
      >
        {/* Glass Background */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[28px]"
          style={{
            background: "linear-gradient(160deg, rgba(255,245,235,0.16) 0%, rgba(255,245,235,0.04) 100%)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          }}
        />

        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          {/* Coffee Animation */}
          <div className="relative mx-auto w-fit mb-3 sm:mb-4">
            <div className="relative flex flex-col items-center">
              {/* Steam */}
              <div className="flex gap-1.5 mb-1 h-4 sm:h-6">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-1 rounded-full"
                    style={{
                      background: "linear-gradient(to top, rgba(255,245,235,0) 0%, rgba(255,245,235,0.55) 60%, rgba(255,245,235,0) 100%)",
                      height: 22,
                    }}
                    animate={{
                      y: [-2, -10, -2],
                      opacity: [0.2, 0.7, 0.2],
                      scaleY: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2.4,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Coffee Cup */}
              <motion.span
                className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-glow-var"
                style={{ background: "linear-gradient(135deg, #c98a5a 0%, #7a4a2a 100%)" }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-[#fff5eb]" />
              </motion.span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center text-[#fff5eb] leading-tight">
            Welcome to <span className="text-gradient-gold">Kongsi</span>
          </h1>

          <p className="text-center text-xs sm:text-sm mt-1.5 text-[rgba(255,245,235,0.7)]">
            Sign in using your unique partner store credentials
          </p>

          {/* Form */}
          <form onSubmit={doSignin} className="space-y-3.5 sm:space-y-4 mt-5 sm:mt-7">
            {/* Email */}
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
                  className="pl-9 bg-white/10 border-white/20 text-[#fff5eb] placeholder:text-[rgba(255,245,235,0.4)]"
                />
              </div>
            </div>

            {/* Unique Store ID Input */}
            <div className="space-y-1.5">
              <Label className="text-[rgba(255,245,235,0.85)]">Store ID</Label>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,245,235,0.5)]" />
                <Input
                  type="text"
                  required
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  placeholder="ST-KON3R9I1A9M"
                  className="pl-9 bg-white/10 border-white/20 text-[#fff5eb] placeholder:text-[rgba(255,245,235,0.4)]"
                />
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full btn-glow h-10 sm:h-11 text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #c98a5a 0%, #7a4a2a 100%)",
                color: "#fff5eb",
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
            Partner-only access. Contact admin if you forgot your Store ID.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
