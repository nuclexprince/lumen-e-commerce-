"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
  emphasis = false,
}: {
  product: Product;
  index?: number;
  emphasis?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted, navigate } = useShop();
  const wished = isWishlisted(product.id);
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        emphasis && "transition-transform"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate({ name: "product", id: product.id })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate({ name: "product", id: product.id });
          }
        }}
        className="relative block w-full text-left cursor-pointer"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-foreground/5">
          {/* soft glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--electric) 22%, transparent), transparent)",
            }}
          />
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              hover ? "scale-[1.06]" : "scale-100"
            )}
            loading={index < 4 ? "eager" : "lazy"}
            draggable={false}
          />

          {/* badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className="glass-dark rounded-full px-2.5 py-1 text-[0.6rem] font-medium tracking-wide text-white">
                {product.badge}
              </span>
            </div>
          )}

          {/* wishlist */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
              toast(wished ? "Removed from wishlist" : "Saved to wishlist", {
                description: product.name,
              });
            }}
            className={cn(
              "absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full transition-all",
              wished
                ? "bg-foreground text-background"
                : "glass-dark text-white hover:scale-105"
            )}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-4 w-4", wished && "fill-current")}
              strokeWidth={1.8}
            />
          </button>

          {/* add to bag — slides up on hover */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 transition-all duration-500",
              hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
                toast.success("Added to bag", { description: product.name });
              }}
              className="w-full h-10 rounded-full bg-foreground text-background text-[0.78rem] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add to bag
            </button>
          </div>
        </div>
      </div>

      {/* meta */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-muted-foreground text-[0.55rem]">
              {product.categoryName}
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl leading-tight mt-1 truncate">
            {product.name}
          </h3>
          <p className="text-[0.78rem] text-muted-foreground mt-1 line-clamp-1">
            {product.shortDescription}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[0.95rem] font-medium tabular-nums">
            {formatINR(product.price)}
          </div>
          {product.originalPrice && (
            <div className="text-[0.7rem] text-muted-foreground line-through tabular-nums">
              {formatINR(product.originalPrice)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
