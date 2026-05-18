import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, Coffee, User as UserIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
];

export function Navbar() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 glass-strong transition-all duration-300 ${scrolled ? "py-3 shadow-md" : "py-4 shadow-sm"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center size-9 rounded-full bg-amber-gradient shadow-glow-var group-hover:scale-110 transition-transform">
            <Coffee className="size-5 text-primary-foreground" />
          </span>
          <span className="font-serif text-xl tracking-tight">
            <span className="text-gradient-gold">Kongsi</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                  active ? "bg-[rgba(122,74,42,0.1)] text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-[rgba(122,74,42,0.08)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
                >
                  {count}
                </motion.span>
              )}
            </Button>
          </Link>

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-5" />
            </Button>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="outline" size="sm" className="rounded-full">
                <UserIcon className="size-4 mr-1" />
                Sign in
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((s) => !s)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg hover:bg-muted text-sm"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="px-3 py-3 rounded-lg hover:bg-muted text-sm text-left"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg hover:bg-muted text-sm"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
