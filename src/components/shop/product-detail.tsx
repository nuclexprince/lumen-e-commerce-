"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getProduct, products } from "@/lib/products";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/store";
import { ProductCarousel } from "./product-carousel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductDetail({ id }: { id: string }) {
  const product = getProduct(id);
  const { addToCart, toggleWishlist, isWishlisted, navigate, setCartOpen } =
    useShop();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);

  if (!product) {
    return (
      <div className="pt-32 min-h-screen grid place-items-center bg-cream">
        <div className="text-center">
          <p className="font-display text-2xl">Object not found.</p>
          <button
            onClick={() => navigate({ name: "discover" })}
            className="mt-4 text-sm underline underline-offset-4"
          >
            Back to collection
          </button>
        </div>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);
  const relatedList =
    related.length >= 4 ? related : products.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate({ name: "discover" })}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to collection
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-secondary ring-1 ring-foreground/5"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 glass-dark rounded-full px-3 py-1 text-[0.6rem] font-medium text-white">
                  {product.badge}
                </span>
              )}
            </motion.div>
            {/* thumbnail row (same image, angled crops) */}
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden bg-secondary ring-1 transition-all cursor-pointer",
                    i === 0
                      ? "ring-foreground/40"
                      : "ring-foreground/5 opacity-60 hover:opacity-100"
                  )}
                  style={{
                    objectPosition: i === 0 ? "center" : `${i * 25}% center`,
                  }}
                >
                  <img
                    src={product.image}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${i * 30}% center` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <div className="eyebrow text-muted-foreground mb-3">
              {product.categoryName}
            </div>
            <h1 className="font-display text-[2.4rem] sm:text-[3.5rem] leading-[0.98]">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-foreground" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>
              {product.inStock && (
                <span className="text-xs text-electric flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric" />
                  In stock
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="font-display text-3xl tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through tabular-nums">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs bg-electric/15 text-electric rounded-full px-2 py-0.5 font-medium">
                  Save {formatINR(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mt-8">
              <div className="eyebrow text-muted-foreground text-[0.55rem] mb-3">
                Colour — {product.colors[color].name}
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(i)}
                    className={cn(
                      "h-9 w-9 rounded-full ring-1 transition-all",
                      i === color
                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                        : "ring-foreground/15 hover:ring-foreground/40"
                    )}
                    style={{ background: c.hex }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity + actions */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-foreground/15">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 grid place-items-center hover:bg-foreground/5 transition-colors rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-11 w-11 grid place-items-center hover:bg-foreground/5 transition-colors rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, qty);
                  setCartOpen(true);
                  toast.success("Added to bag", { description: `${qty} × ${product.name}` });
                }}
                className="flex-1 h-11 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                Add to bag · {formatINR(product.price * qty)}
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist", {
                    description: product.name,
                  });
                }}
                className={cn(
                  "h-11 w-11 rounded-full grid place-items-center border transition-colors",
                  wished
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/15 hover:bg-foreground/5"
                )}
                aria-label="Toggle wishlist"
              >
                <Heart className={cn("h-4 w-4", wished && "fill-current")} />
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-3 gap-3 mt-10 pt-8 border-t border-foreground/10">
              {[
                { icon: Truck, t: "Free shipping", s: "Over ₹5,000" },
                { icon: RotateCcw, t: "30-day returns", s: "No questions" },
                { icon: ShieldCheck, t: "10-year repair", s: "LUMEN promise" },
              ].map((a) => (
                <div key={a.t} className="text-center sm:text-left">
                  <a.icon className="h-4 w-4 mx-auto sm:mx-0 mb-2 text-muted-foreground" strokeWidth={1.5} />
                  <div className="text-xs font-medium">{a.t}</div>
                  <div className="text-[0.65rem] text-muted-foreground">{a.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="mt-24 sm:mt-32">
          <ProductCarousel products={relatedList} variant="editors" />
        </div>
      </div>
    </div>
  );
}
