"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useShop } from "@/lib/store";

export function PromoBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useShop();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.15]);

  return (
    <section ref={ref} className="relative w-full px-4 sm:px-6 py-6 bg-cream">
      <div className="relative mx-auto max-w-7xl h-[60vh] sm:h-[78vh] rounded-3xl overflow-hidden ring-1 ring-foreground/5">
        <motion.img
          src="/brand/promo.png"
          alt="LUMEN seasonal campaign"
          style={{ y, scale }}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="eyebrow text-white/60"
          >
            The Winter Edit · Now Live
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.4rem] sm:text-[4.5rem] leading-[0.95] mt-4 max-w-3xl"
          >
            Objects of desire,
            <br />
            <span className="italic font-light">priced for keeping.</span>
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            onClick={() => navigate({ name: "discover" })}
            className="mt-8 group inline-flex items-center gap-2.5 rounded-full bg-white text-charcoal pl-5 pr-4 h-12 hover:gap-4 transition-all"
          >
            <span className="text-sm font-medium">Explore the edit</span>
            <span className="h-7 w-7 rounded-full bg-charcoal text-white grid place-items-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
