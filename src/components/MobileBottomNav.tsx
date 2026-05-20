import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/menu", label: "Menu", Icon: ShoppingBag },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/account", label: "Account", Icon: User },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  if (path.startsWith("/admin") || path.startsWith("/auth")) return null;

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40">
      <div className="glass-strong border border-border rounded-2xl shadow-card-var backdrop-blur-xl">
        <ul className="grid grid-cols-4">
          {items.map(({ to, label, Icon }, idx) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <motion.li
                key={to}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={to}
                  className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="navActive"
                      className="absolute inset-x-3 top-1 h-1 rounded-full bg-primary/70"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.span className="relative" whileTap={{ scale: 0.9 }}>
                    <Icon className="size-5" />
                    {to === "/cart" && count > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold"
                      >
                        {count}
                      </motion.span>
                    )}
                  </motion.span>
                  {label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
