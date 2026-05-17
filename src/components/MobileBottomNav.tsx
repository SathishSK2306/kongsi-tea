import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/menu", label: "Menu", Icon: ShoppingBag },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  // Don't show mobile nav on admin pages
  if (path.startsWith("/admin")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon }, idx) => {
          const active = path === to;
          return (
            <motion.li
              key={to}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition relative ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <motion.span
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
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
    </nav>
  );
}
