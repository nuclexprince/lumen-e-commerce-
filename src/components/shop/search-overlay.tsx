"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/store";

const SUGGESTIONS = ["Earbuds", "Sneakers", "Cashmere", "Lamp", "Tote"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, navigate } = useShop();
  const { products } = useCatalog();
  const [q, setQ] = useState("");

  const close = () => {
    setQ("");
    setSearchOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products.slice(0, 4);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [q, products]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70]"
        >
          <div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
            onClick={close}
          />
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 inset-x-0 glass-strong border-b border-foreground/10 px-4 sm:px-6 pt-6 pb-8"
          >
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 rounded-2xl bg-background/60 px-5 h-14 ring-1 ring-foreground/10 focus-within:ring-2 focus-within:ring-electric/40 transition-all">
                <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search objects, categories, materials…"
                  className="flex-1 bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={close}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-foreground/5 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!q && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="eyebrow text-muted-foreground text-[0.55rem] mr-1">
                    Try
                  </span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className="rounded-full border border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground hover:text-background transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <div className="eyebrow text-muted-foreground text-[0.55rem] mb-3">
                  {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Featured"}
                </div>
                <ul className="divide-y divide-foreground/8">
                  {results.map((p, i) => (
                    <motion.li
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <button
                        onClick={() => {
                          navigate({ name: "product", id: p.id });
                          close();
                        }}
                        className="w-full flex items-center gap-4 py-3 text-left hover:bg-foreground/5 rounded-xl px-2 transition-colors group"
                      >
                        <div className="h-14 w-12 shrink-0 rounded-lg overflow-hidden bg-secondary ring-1 ring-foreground/5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-base leading-tight">
                            {p.name}
                          </h4>
                          <p className="text-[0.7rem] text-muted-foreground truncate">
                            {p.categoryName} · {p.shortDescription}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums">
                          {formatINR(p.price)}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </motion.li>
                  ))}
                  {q && results.length === 0 && (
                    <li className="py-10 text-center text-sm text-muted-foreground">
                      No objects matched “{q}”. Try another word.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
