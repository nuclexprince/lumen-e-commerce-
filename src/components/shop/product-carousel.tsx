"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

type Variant = "trending" | "new" | "editors";

const VARIANT_META: Record<
  Variant,
  { label: string; sub: string; tint: string }
> = {
  trending: {
    label: "Trending Now",
    sub: "What the world is reaching for this week.",
    tint: "var(--electric)",
  },
  new: {
    label: "New Arrivals",
    sub: "Fresh objects, freshly shelved.",
    tint: "var(--charcoal)",
  },
  editors: {
    label: "Editor's Picks",
    sub: "The pieces we'd keep for ourselves.",
    tint: "var(--silver)",
  },
};

export function ProductCarousel({
  products,
  variant = "trending",
  title,
  subtitle,
}: {
  products: Product[];
  variant?: Variant;
  title?: string;
  subtitle?: string;
}) {
  const meta = VARIANT_META[variant];
  const label = title ?? meta.label;
  const sub = subtitle ?? meta.sub;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const scrollByCards = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector("[data-card]") as HTMLElement | null;
      const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    },
    []
  );

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setAtStart(scrollLeft < 8);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 8);

    // compute active (closest to left + 1/3 viewport)
    const cards = Array.from(
      track.querySelectorAll("[data-card]")
    ) as HTMLElement[];
    if (!cards.length) return;
    const target = scrollLeft + clientWidth * 0.35;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const center = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(center - target);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };
    track.addEventListener("scroll", handler, { passive: true });
    onScroll();
    return () => {
      track.removeEventListener("scroll", handler);
      cancelAnimationFrame(raf);
    };
  }, [onScroll]);

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10 px-1">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: meta.tint }}
            />
            <span className="eyebrow text-muted-foreground">{label}</span>
          </div>
          <h2 className="font-display text-[1.9rem] sm:text-[2.6rem] leading-[1] max-w-md">
            {sub}
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="eyebrow text-muted-foreground text-[0.55rem] mr-2 tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
          </span>
          <CarouselArrow dir="prev" disabled={atStart} onClick={() => scrollByCards(-1)} />
          <CarouselArrow dir="next" disabled={atEnd} onClick={() => scrollByCards(1)} />
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="no-scrollbar flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 cursor-grab active:cursor-grabbing"
        style={{ scrollPaddingLeft: "1.5rem", scrollPaddingRight: "1.5rem" }}
      >
        {products.map((p, i) => {
          const isActive = i === active;
          return (
            <motion.div
              key={p.id}
              data-card
              className="snap-start shrink-0 w-[78%] xs:w-[60%] sm:w-[42%] lg:w-[30%] xl:w-[26%]"
              animate={{
                scale: isActive ? 1 : 0.94,
                opacity: isActive ? 1 : 0.55,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            >
              <div
                style={{
                  transform: isActive
                    ? "rotateY(0deg)"
                    : "rotateY(0deg)",
                }}
                className="h-full"
              >
                <ProductCard product={p} index={i} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6 sm:hidden">
        {products.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i === active ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-11 w-11 rounded-full grid place-items-center border border-foreground/15 transition-all",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-foreground hover:text-background hover:border-foreground"
      )}
      aria-label={dir === "prev" ? "Previous" : "Next"}
    >
      {dir === "prev" ? (
        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
      ) : (
        <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
      )}
    </button>
  );
}
