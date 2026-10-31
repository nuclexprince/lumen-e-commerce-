"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { ProductCarousel } from "./product-carousel";
import { ProductCard } from "./product-card";

type RecType =
  | "related"
  | "frequently-bought"
  | "recently-viewed"
  | "personalized"
  | "trending"
  | "editors";

export function RecommendationsSection({
  productId,
  type,
  title,
  subtitle,
  variant = "editors",
  layout = "carousel",
  limit = 8,
}: {
  productId?: string;
  type: RecType;
  title: string;
  subtitle?: string;
  variant?: "trending" | "new" | "editors";
  layout?: "carousel" | "grid";
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const qs = new URLSearchParams({ type, limit: String(limit) });
    if (productId) qs.set("productId", productId);
    fetch(`/api/recommendations?${qs}`)
      .then((r) => r.json())
      .then((d) => active && setProducts(d.products || []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId, type, limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-cream px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="py-10">
              <div className="h-7 w-56 bg-foreground/5 rounded-full animate-pulse mb-2" />
              <div className="h-4 w-72 bg-foreground/5 rounded-full animate-pulse" />
            </div>
          ) : layout === "carousel" ? (
            <ProductCarousel products={products} variant={variant} title={title} subtitle={subtitle} />
          ) : (
            <>
              <SectionHeader title={title} subtitle={subtitle} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <div className="eyebrow text-muted-foreground mb-2">{title}</div>
        {subtitle && (
          <h2 className="font-display text-[1.6rem] sm:text-[2.2rem] leading-[1] max-w-md">
            {subtitle}
          </h2>
        )}
      </div>
    </div>
  );
}
