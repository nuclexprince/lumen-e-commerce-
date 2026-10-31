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
import { useCatalog } from "@/components/catalog-provider";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/store";
import { ProductCarousel } from "./product-carousel";
import { RecommendationsSection } from "./recommendations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductDetail({ id }: { id: string }) {
  const { getBySlug, products } = useCatalog();
  const product = getBySlug(id);
  const { addToCart, toggleWishlist, isWishlisted, navigate, setCartOpen } =
    useShop();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

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
  const gallery = product.gallery.length > 1 ? product.gallery : [product.image, product.image, product.image, product.image];
  const currentImg = gallery[activeImg] ?? product.image;
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);
  const relatedList =
    related.length >= 4 ? related : products.filter((p) => p.id !== product.id).slice(0, 6);

  const needsSize = product.sizes.length > 0 && product.sizes[0] !== "One Size";

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
              key={activeImg}
              initial={{ opacity: 0.4, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-secondary ring-1 ring-foreground/5"
            >
              <img
                src={currentImg}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 glass-dark rounded-full px-3 py-1 text-[0.6rem] font-medium text-white">
                  {product.badge}
                </span>
              )}
              {discountPct > 0 && (
                <span className="absolute top-4 right-4 bg-electric text-white rounded-full px-2.5 py-1 text-[0.6rem] font-semibold">
                  −{discountPct}%
                </span>
              )}
            </motion.div>
            {/* thumbnail row */}
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden bg-secondary ring-1 transition-all",
                    i === activeImg
                      ? "ring-foreground/50"
                      : "ring-foreground/5 opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
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
              {product.inStock ? (
                <span className="text-xs text-electric flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric" />
                  In stock · {product.inventory} left
                </span>
              ) : (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  Out of stock
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
              {discountPct > 0 && (
                <span className="text-xs bg-electric/15 text-electric rounded-full px-2 py-0.5 font-medium">
                  Save {discountPct}%
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mt-8">
                <div className="eyebrow text-muted-foreground text-[0.55rem] mb-3">
                  Colour — {product.colors[color]?.name}
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
            )}

            {/* Sizes */}
            {needsSize && (
              <div className="mt-8">
                <div className="eyebrow text-muted-foreground text-[0.55rem] mb-3 flex items-center justify-between">
                  <span>Size {size && <span className="text-foreground">— {size}</span>}</span>
                  <span className="normal-case tracking-normal text-muted-foreground/70">Size guide</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-10 min-w-10 px-3 rounded-full text-xs font-medium border transition-all",
                        s === size
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/15 hover:border-foreground/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  onClick={() => setQty((q) => Math.min(product.inventory, q + 1))}
                  className="h-11 w-11 grid place-items-center hover:bg-foreground/5 transition-colors rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                disabled={!product.inStock}
                onClick={() => {
                  if (needsSize && !size) {
                    toast.error("Please select a size");
                    return;
                  }
                  addToCart(product, qty, { size, color: product.colors[color]?.name });
                  setCartOpen(true);
                  toast.success("Added to bag", { description: `${qty} × ${product.name}` });
                }}
                className="flex-1 h-11 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                {product.inStock ? `Add to bag · ${formatINR(product.price * qty)}` : "Out of stock"}
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist", { description: product.name });
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

            {/* Specifications */}
            <div className="mt-10 pt-8 border-t border-foreground/10">
              <div className="eyebrow text-muted-foreground text-[0.55rem] mb-4">Specifications</div>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="text-right">{product.categoryName}</dd>
                <dt className="text-muted-foreground">Colours</dt>
                <dd className="text-right">{product.colors.map((c) => c.name).join(", ")}</dd>
                <dt className="text-muted-foreground">Sizes</dt>
                <dd className="text-right">{product.sizes.join(", ")}</dd>
                <dt className="text-muted-foreground">Tags</dt>
                <dd className="text-right">{product.tags.slice(0, 4).join(", ")}</dd>
                <dt className="text-muted-foreground">Inventory</dt>
                <dd className="text-right">{product.inventory} units</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-20 sm:mt-28 space-y-20">
          <RecommendationsSection
            productId={product.id}
            type="related"
            title="You may also like"
            subtitle="Related by category and material."
            variant="editors"
          />
          <RecommendationsSection
            productId={product.id}
            type="frequently-bought"
            title="Frequently bought together"
            subtitle="Pairs customers often reach for."
            variant="trending"
          />
          <RecommendationsSection
            productId={product.id}
            type="recently-viewed"
            title="Recently viewed"
            subtitle="Pick up where you left off."
            variant="new"
          />
        </div>

        {/* Related carousel fallback */}
        <div className="mt-24 sm:mt-32">
          <ProductCarousel products={relatedList} variant="editors" />
        </div>
      </div>
    </div>
  );
}
