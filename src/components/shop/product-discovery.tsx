"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Check, Heart, X } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { ProductCard } from "./product-card";
import { useShop } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Sort = "featured" | "price-asc" | "price-desc" | "newest";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest" },
];

export function ProductDiscovery({ initialCategory }: { initialCategory?: string }) {
  const { products, categories } = useCatalog();
  const [cat, setCat] = useState<string>(
    initialCategory || "all"
  );
  const [sort, setSort] = useState<Sort>("featured");
  const [onlyWish, setOnlyWish] = useState(false);
  const { wishlist } = useShop();

  const filtered = useMemo(() => {
    let list = products.slice();
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (onlyWish) list = list.filter((p) => wishlist.includes(p.id));
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) =>
          (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)
        );
        break;
    }
    return list;
  }, [products, cat, sort, onlyWish, wishlist]);

  return (
    <div className="pt-28 sm:pt-32 pb-24 min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="eyebrow text-muted-foreground mb-3">
            Discover
          </div>
          <h1 className="font-display text-[2.4rem] sm:text-[4rem] leading-[0.98]">
            The full collection.
          </h1>
          <p className="text-sm text-muted-foreground mt-4 max-w-lg">
            {products.length} considered objects across five categories. Filter,
            sort, and find the one worth keeping.
          </p>
        </div>

        {/* Filter bar */}
        <div className="sticky top-20 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-8 glass rounded-none sm:rounded-2xl flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
              active={cat === "all"}
              onClick={() => setCat("all")}
            >
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={cat === c.id}
                onClick={() => setCat(c.id)}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setOnlyWish((v) => !v);
                if (!onlyWish && wishlist.length === 0) {
                  toast("Your wishlist is empty");
                }
              }}
              className={cn(
                "h-9 px-3 rounded-full flex items-center gap-1.5 text-xs border transition-colors",
                onlyWish
                  ? "bg-foreground text-background border-foreground"
                  : "border-foreground/15 hover:bg-foreground/5"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", onlyWish && "fill-current")} />
              Wishlist
            </button>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none h-9 pl-8 pr-8 rounded-full bg-transparent border border-foreground/15 text-xs cursor-pointer hover:bg-foreground/5 transition-colors"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-muted-foreground"
                strokeWidth={1.6}
              />
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} object{filtered.length === 1 ? "" : "s"}
          </span>
          {cat !== "all" && (
            <button
              onClick={() => setCat("all")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Clear filter <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <p className="font-display text-2xl">Nothing here yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try a different filter or clear your wishlist filter.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-3.5 rounded-full text-xs flex items-center gap-1.5 border transition-all",
        active
          ? "bg-foreground text-background border-foreground"
          : "border-foreground/15 hover:bg-foreground/5 text-foreground/80"
      )}
    >
      {active && <Check className="h-3 w-3" strokeWidth={2.5} />}
      {children}
    </button>
  );
}
