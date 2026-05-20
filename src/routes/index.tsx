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
      { title: "Kongsi — Wholesale Coffee, Tea & Cafe Supplies" },
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
      {/* HERO
      <section className="container mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[3rem] glass border border-border min-h-[620px] md:min-h-[720px] grid gap-8 md:grid-cols-[1.2fr_0.95fr]">
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[rgba(231,173,115,0.25)] blur-3xl" />
          <div className="absolute right-0 top-[35%] h-72 w-72 rounded-full bg-[rgba(255,244,229,0.72)] blur-3xl hidden md:block" />

          <div className="relative z-10 p-8 md:p-14 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-script text-3xl text-secondary">Sip the art of craft coffee</span>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(122,74,42,0.18)] bg-[rgba(255,245,235,0.85)] px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <Sparkles className="size-4 text-primary" />
                Wholesale supplies for cafes & dessert bars
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[0.96] mt-6 max-w-xl">
                Cafe-grade coffee supplies for every <br />
                <span className="text-gradient-gold">shared moment</span>
              </h1>
              <p className="mt-6 max-w-2xl text-muted-foreground">
                Handcrafted ingredients, premium packaging, and elegant presentation built for modern cafes and boutique tea shops.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/menu">
                  <Button size="lg" className="rounded-full btn-glow bg-primary text-primary-foreground hover:bg-[#8c5139]">
                    Explore Menu <ArrowRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </div>


              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { Icon: Award, label: "Premium", sub: "Quality beans" },
                  { Icon: Coffee, label: "Handcrafted", sub: "Small-batch roast" },
                  { Icon: Leaf, label: "Seasonal", sub: "Curated blends" },
                ].map(({ Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 rounded-3xl border border-[rgba(122,74,42,0.12)] bg-[rgba(255,245,235,0.75)] p-4 shadow-sm">
                    <span className="grid place-items-center h-12 w-12 rounded-3xl bg-[rgba(122,74,42,0.12)] text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-sm text-muted-foreground">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 p-8 md:p-14 flex items-center justify-center">
            <div className="relative w-full max-w-md rounded-[2.25rem] border border-border bg-white/90 p-6 shadow-card-var">
              <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(131,86,55,0.16)]">
                <img src={heroImg} alt="Premium coffee with latte art" className="size-full object-cover" />
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Barista favorite</p>
                <h3 className="font-serif text-3xl">Velvet Latte Blend</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Rich caramel notes, silky texture, and balanced roast crafted for boutique coffee experiences.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-[rgba(122,74,42,0.1)] px-4 py-2 text-xs font-medium text-primary">Fresh Roasted</span>
                <span className="rounded-full bg-[rgba(226,184,145,0.3)] px-4 py-2 text-xs font-medium text-secondary">Brew Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ABOUT */}
      {/* <section className="container mx-auto px-4 mt-24 grid md:grid-cols-2 gap-10 items-center">
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
            More Than Just <span className="text-gradient-gold">Supplies</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            At Kongsi, we believe premium wholesale supplies are essential for any thriving cafe or dessert shop.
            Every product we offer is carefully sourced and curated for quality, consistency, and excellence.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Premium Quality Products",
              "Wholesale Pricing",
              "Reliable Delivery",
              "Expert Support",
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
            <Button className="rounded-full btn-glow">Explore Catalog <ArrowRight className="ml-1 size-4" /></Button>
          </Link>
        </motion.div>
      </section> */}

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
      {/* <section className="container mx-auto px-4 mt-24">
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
      </section> */}

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
      {/* <section className="container mx-auto px-4 mt-24">
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
      </section> */}

      {/* CTA */}
      {/* <section className="container mx-auto px-4 mt-24">
        <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-border bg-amber-gradient">
          <h2 className="font-serif text-3xl md:text-5xl text-foreground">
            Ready to upgrade your cafe?
          </h2>
          <p className="mt-3 text-foreground/90 max-w-xl mx-auto">
            Sign up as a partner store, browse the catalog, and place your first wholesale order today.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" variant="secondary" className="rounded-full">Become a Partner</Button></Link>
            <Link to="/menu"><Button size="lg" variant="outline" className="rounded-full bg-transparent border-foreground/40 text-foreground hover:bg-foreground/10">Browse Menu</Button></Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
