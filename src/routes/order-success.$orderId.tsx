import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-success/$orderId")({
  component: OrderSuccess,
  head: () => ({ meta: [{ title: "Order Placed — BrewHaven" }] }),
});

function OrderSuccess() {
  const { orderId } = Route.useParams();
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
        <CheckCircle2 className="size-20 mx-auto text-primary" />
      </motion.div>
      <h1 className="font-serif text-4xl mt-6">Order Placed!</h1>
      <p className="mt-3 text-muted-foreground">Your order <span className="text-primary font-mono">{orderId}</span> has been received. We'll start preparing it shortly.</p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link to="/menu"><Button className="rounded-full btn-glow">Continue Shopping</Button></Link>
      </div>
    </div>
  );
}
