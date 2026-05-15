import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ phone = "919876543210" }: { phone?: string }) {
  return (
    <motion.a
      href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi BrewHaven, I'd like to place an order.")}`}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring" }}
      className="fixed bottom-20 md:bottom-6 right-5 z-40 grid place-items-center size-14 rounded-full text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
      aria-label="WhatsApp"
    >
      <MessageCircle className="size-6" />
      <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30" />
    </motion.a>
  );
}
