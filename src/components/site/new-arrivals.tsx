"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getByCollection } from "@/lib/products";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/store";

export function NewArrivals() {
  const ref = useRef<HTMLDivElement>(null);
  const items = getByCollection("new");
  const { navigate, addToCart } = useShop();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineScale = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);

  return (
    <section
      ref={ref}
      id="new"
      className="relative w-full bg-cream py-24 sm:py-32 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow text-muted-foreground mb-3">
              Just Landed
            </div>
            <h2 className="font-display text-[2.4rem] sm:text-[3.5rem] leading-[0.98] max-w-lg">
              New arrivals,
              <br />
              <span className="italic font-light text-muted-foreground">
                quietly considered.
              </span>
            </h2>
          </div>
          <motion.div
            style={{ scaleX: lineScale }}
            className="hidden sm:block h-px bg-foreground/30 origin-left flex-1 mb-4"
          />
        </div>

        {/* Editorial asymmetric layout */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Big feature */}
          {items.slice(0, 1).map((p, i) => (
            <EditorialCard
              key={p.id}
              product={p}
              className="col-span-12 md:col-span-7 aspect-[5/4] md:aspect-auto"
              big
              index={i}
              onClick={() => navigate({ name: "product", id: p.id })}
              onAdd={() => addToCart(p)}
            />
          ))}
          {/* Two stacked */}
          <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-4 sm:gap-6">
            {items.slice(1, 3).map((p, i) => (
              <EditorialCard
                key={p.id}
                product={p}
                className="aspect-[16/10]"
                index={i + 1}
                onClick={() => navigate({ name: "product", id: p.id })}
                onAdd={() => addToCart(p)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialCard({
  product,
  className,
  big,
  index,
  onClick,
  onAdd,
}: {
  product: ReturnType<typeof getByCollection>[number];
  className?: string;
  big?: boolean;
  index: number;
  onClick: () => void;
  onAdd: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl text-left ring-1 ring-foreground/5 bg-secondary ${className}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        loading="lazy"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between text-white">
        <div className="flex items-center justify-between">
          <span className="glass-dark rounded-full px-2.5 py-1 text-[0.6rem] font-medium tracking-wide">
            New
          </span>
          <ArrowUpRight className="h-5 w-5 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="eyebrow text-white/55 text-[0.55rem] mb-1">
            {product.categoryName}
          </p>
          <h3 className={`font-display leading-none ${big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
            {product.name}
          </h3>
          <p className="text-[0.8rem] text-white/70 mt-2 max-w-xs line-clamp-1">
            {product.shortDescription}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[0.95rem] font-medium tabular-nums">
              {formatINR(product.price)}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="rounded-full bg-white text-charcoal px-3.5 py-1.5 text-[0.7rem] font-medium hover:opacity-90 transition-opacity"
            >
              Add to bag
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
