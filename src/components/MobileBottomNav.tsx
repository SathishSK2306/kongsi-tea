import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/menu", label: "Menu", Icon: ShoppingBag },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon }) => {
          const active = path === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {to === "/cart" && count > 0 && (
                    <span className="absolute -top-1.5 -right-2 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                      {count}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
