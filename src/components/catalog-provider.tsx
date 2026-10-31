"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { StoreProduct, StoreCategory } from "@/lib/catalog";

interface CatalogCtx {
  products: StoreProduct[];
  categories: StoreCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  getBySlug: (slug: string) => StoreProduct | undefined;
  getByCollection: (c: string) => StoreProduct[];
  getByCategory: (slug: string) => StoreProduct[];
}

const Ctx = createContext<CatalogCtx | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    // loading is true initially (useState); refreshes keep existing data on screen
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([pData, cData]) => {
        if (!active) return;
        setProducts(pData.products || []);
        setCategories(cData.categories || []);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        setError(e.message || "Failed to load catalog");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tick]);

  const getBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug || p.id === slug),
    [products]
  );
  const getByCollection = useCallback(
    (c: string) => products.filter((p) => p.collection === c),
    [products]
  );
  const getByCategory = useCallback(
    (slug: string) => products.filter((p) => p.category === slug),
    [products]
  );

  return (
    <Ctx.Provider
      value={{
        products,
        categories,
        loading,
        error,
        refresh,
        getBySlug,
        getByCollection,
        getByCategory,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
