import { Link } from "@tanstack/react-router";
import { Coffee, Instagram, Twitter, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(131,86,55,0.16)] bg-[rgba(255,248,238,0.85)]">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center size-9 rounded-full bg-amber-gradient">
              <Coffee className="size-5 text-primary-foreground" />
            </span>
            <span className="font-serif text-xl">
              <span className="text-gradient-gold">Kongsi</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Wholesale supplies for cafés, bubble-tea bars and dessert shops. Premium ingredients, delivered.
          </p>
          <div className="flex gap-3 mt-4 text-muted-foreground">
            <Instagram className="size-4 hover:text-primary cursor-pointer" />
            <Twitter className="size-4 hover:text-primary cursor-pointer" />
            <Facebook className="size-4 hover:text-primary cursor-pointer" />
            <Youtube className="size-4 hover:text-primary cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="font-script text-primary text-lg mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/menu" className="hover:text-foreground">Menu</Link></li>
            <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-script text-primary text-lg mb-3">Customer Care</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>FAQs</li>
            <li>Shipping & Delivery</li>
            <li>Returns & Refunds</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-script text-primary text-lg mb-3">Contact Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4 text-primary" /> +91 xxxxxxxxx</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-primary" /> hello@brewhaven.com</li>
            <li className="flex items-start gap-2"><MapPin className="size-4 text-primary mt-0.5" /> 123 Coffee Lane, Brew City — 560001</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kongsi. Premium Wholesale Supplies.
      </div>
    </footer>
  );
}
