import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Coffee, Leaf, Sparkles, Truck, ShieldCheck, Star, Quote, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import heroImg from "@/assets/hero-coffee.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "BrewHaven — Wholesale Coffee, Tea & Cafe Supplies" },
      { name: "description", content: "Premium handcrafted coffee, tea leaves, packaging and food supplies — wholesale for cafes across India." },
    ],
  }),
});

function Landing() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="container mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-3xl glass border border-border min-h-[560px] md:min-h-[640px] grid md:grid-cols-2">
          <img
            src={heroImg}
            alt="Premium coffee with latte art"
            className="absolute inset-0 size-full object-cover md:opacity-100 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 md:via-card/70 to-transparent" />

          <div className="relative z-10 p-8 md:p-14 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-script text-2xl text-primary">Rich. Smooth. Perfect.</span>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mt-2">
                Experience<br />
                Coffee Like<br />
                <span className="text-gradient-gold">Never Before</span>
              </h1>
              <p className="mt-5 max-w-md text-muted-foreground">
                Handcrafted ingredients, premium packaging and gourmet menu items —
                wholesale supplies for India's finest cafes & bubble tea bars.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/menu">
                  <Button size="lg" className="rounded-full btn-glow">
                    Explore Menu <ArrowRight className="ml-1 size-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Become a Partner
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { Icon: Award, label: "Premium", sub: "Quality Beans" },
                  { Icon: Coffee, label: "Expertly", sub: "Roasted" },
                  { Icon: Leaf, label: "Made With", sub: "Love" },
                ].map(({ Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="grid place-items-center size-9 rounded-full border border-border bg-muted/50">
                      <Icon className="size-4 text-primary" />
                    </span>
                    <div className="text-xs leading-tight">
                      <div className="font-medium">{label}</div>
                      <div className="text-muted-foreground">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container mx-auto px-4 mt-24 grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="aspect-[4/5] rounded-3xl overflow-hidden glass border border-border"
        >
          <img src={heroImg} alt="Coffee craft" className="size-full object-cover" loading="lazy" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="font-script text-2xl text-primary">About Us</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-1">
            More Than Just <span className="text-gradient-gold">a Coffee</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            At BrewHaven, we believe coffee is more than a drink — it's an experience.
            Every cup we serve is a blend of passion, quality, and perfection.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Sustainably Sourced Beans",
              "Ethically Traded",
              "Freshly Roasted",
              "Barista Crafted",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <span className="grid place-items-center size-7 rounded-full bg-primary/15 text-primary">
                  <Sparkles className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/menu" className="inline-block mt-8">
            <Button className="rounded-full btn-glow">Learn More <ArrowRight className="ml-1 size-4" /></Button>
          </Link>
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 mt-24">
        <div className="text-center">
          <span className="font-script text-2xl text-primary">Browse</span>
          <h2 className="font-serif text-4xl md:text-5xl">Our Categories</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to="/menu"
                search={{ category: c.key, q: "" }}
                className="block group relative aspect-[3/4] rounded-2xl overflow-hidden card-hover glass border border-border"
              >
                <img src={c.image} alt={c.label} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif text-xl">{c.label}</h3>
                  <p className="text-xs text-muted-foreground">{c.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* POPULAR PICKS */}
      <section className="container mx-auto px-4 mt-24">
        <div className="text-center">
          <span className="font-script text-2xl text-primary">Our Signature</span>
          <h2 className="font-serif text-4xl md:text-5xl">Popular Picks</h2>
          <div className="mx-auto mt-3 h-px w-24 bg-primary/40" />
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/menu">
            <Button variant="outline" className="rounded-full">
              View Full Menu <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="container mx-auto px-4 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 glass border border-border rounded-2xl p-6 md:p-8">
          {[
            { Icon: Truck, t: "Free Delivery", s: "On orders above ₹2,499" },
            { Icon: PackageCheck, t: "Fresh & Fast", s: "Prepared with care" },
            { Icon: ShieldCheck, t: "Secure Payment", s: "100% safe & secure" },
            { Icon: Star, t: "Loyalty Rewards", s: "Earn points every order" },
          ].map(({ Icon, t, s }) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid place-items-center size-12 rounded-full bg-primary/15 text-primary shrink-0">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-medium text-sm">{t}</div>
                <div className="text-xs text-muted-foreground">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 mt-24">
        <div className="text-center">
          <span className="font-script text-2xl text-primary">What They Say</span>
          <h2 className="font-serif text-4xl md:text-5xl">Loved by Cafes</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { name: "Aarav, Cha Bar", text: "Their boba and Thai tea consistency is unbeatable. Our customers love the upgrade." },
            { name: "Priya, Brew Lounge", text: "Reliable wholesale supplier. Branded packaging looks premium and ships on time." },
            { name: "Rohan, Cafe Mosaic", text: "Sourdough and baos are restaurant-grade. Our menu costs went down too." },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl glass border border-border p-6"
            >
              <Quote className="size-6 text-primary mb-3" />
              <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
              <div className="mt-4 text-sm font-medium">— {t.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 mt-24">
        <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-border" style={{ background: "var(--gradient-amber)" }}>
          <h2 className="font-serif text-3xl md:text-5xl text-primary-foreground">
            Ready to upgrade your cafe?
          </h2>
          <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto">
            Sign up as a partner store, browse the catalog, and place your first wholesale order today.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" variant="secondary" className="rounded-full">Become a Partner</Button></Link>
            <Link to="/menu"><Button size="lg" variant="outline" className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">Browse Menu</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
