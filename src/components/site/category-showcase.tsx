"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/products";
import { useShop } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CategoryShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { navigate } = useShop();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yShift = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      id="collections"
      className="relative w-full bg-cream py-24 sm:py-32 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="eyebrow text-muted-foreground mb-3">
              The Categories
            </div>
            <h2 className="font-display text-[2.4rem] sm:text-[3.5rem] leading-[0.98] max-w-xl">
              Five worlds,
              <br />
              <span className="italic font-light text-muted-foreground">
                one philosophy.
              </span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs sm:text-right">
            Every category is curated, not crowded. We keep the range small so
            each object earns its place.
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[260px] gap-4 sm:gap-5 [grid-auto-flow:dense]">
          {categories.map((cat, i) => (
            <CategoryTile
              key={cat.id}
              cat={cat}
              index={i}
              yShift={yShift}
              onClick={() => navigate({ name: "discover", category: cat.id })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({
  cat,
  index,
  yShift,
  onClick,
}: {
  cat: (typeof categories)[number];
  index: number;
  yShift: ReturnType<typeof useTransform>;
  onClick: () => void;
}) {
  const spanClass = {
    tall: "lg:col-span-1 lg:row-span-2",
    wide: "lg:col-span-2 lg:row-span-1",
    regular: "lg:col-span-1 lg:row-span-1",
  }[cat.span];

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl text-left ring-1 ring-foreground/5 bg-charcoal",
        "min-h-[280px] lg:min-h-0",
        spanClass
      )}
    >
      {/* parallax image */}
      <motion.div
        style={{ y: yShift }}
        className="absolute inset-0 -z-0 scale-110"
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
          loading="lazy"
          draggable={false}
        />
      </motion.div>

      {/* gradient veil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
        background: "radial-gradient(80% 60% at 50% 120%, color-mix(in oklab, var(--electric) 30%, transparent), transparent)"
      }} />

      {/* content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7 text-white">
        <div className="flex items-start justify-between">
          <span className="eyebrow text-white/60 text-[0.55rem]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-9 w-9 rounded-full glass-dark grid place-items-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
          </span>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/55 mb-1.5">
            {cat.tagline}
          </p>
          <h3 className="font-display text-2xl sm:text-[1.9rem] leading-none">
            {cat.name}
          </h3>
          <p className="text-[0.8rem] text-white/70 mt-2 max-w-xs leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-500 overflow-hidden">
            {cat.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
