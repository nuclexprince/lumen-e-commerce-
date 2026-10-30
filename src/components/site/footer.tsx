"use client";

import { BrandMark } from "./navbar";
import { useShop } from "@/lib/store";
import { Instagram, Twitter, Youtube, ArrowUpRight } from "lucide-react";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", view: { name: "discover" as const } },
      { label: "Trending", view: { name: "discover" as const } },
      { label: "Editor's Picks", view: { name: "discover" as const } },
      { label: "Collections", view: { name: "discover" as const } },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Electronics", view: { name: "discover" as const, category: "electronics" } },
      { label: "Fashion", view: { name: "discover" as const, category: "fashion" } },
      { label: "Sneakers", view: { name: "discover" as const, category: "sneakers" } },
      { label: "Accessories", view: { name: "discover" as const, category: "accessories" } },
      { label: "Lifestyle", view: { name: "discover" as const, category: "lifestyle" } },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "About LUMEN", view: { name: "home" as const } },
      { label: "The Atelier", view: { name: "home" as const } },
      { label: "Sustainability", view: { name: "home" as const } },
      { label: "Press", view: { name: "home" as const } },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Shipping", view: { name: "home" as const } },
      { label: "Returns & Repair", view: { name: "home" as const } },
      { label: "Contact", view: { name: "home" as const } },
      { label: "FAQ", view: { name: "home" as const } },
    ],
  },
];

export function Footer() {
  const { navigate } = useShop();
  return (
    <footer className="mt-auto bg-charcoal text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <BrandMark className="text-cream" />
            <p className="text-sm text-white/55 mt-5 max-w-xs leading-relaxed">
              Objects of quiet luxury. Designed for the future, made to be kept.
              Shipped from our atelier in Lisbon.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="h-10 w-10 rounded-full border border-white/15 grid place-items-center hover:bg-white hover:text-charcoal transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLS.map((col) => (
              <div key={col.title}>
                <h4 className="eyebrow text-white/40 text-[0.55rem] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => navigate(l.view)}
                        className="text-sm text-white/70 hover:text-white transition-colors text-left"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline my-10 opacity-40" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.7rem] text-white/40">
          <p>© {new Date().getFullYear()} LUMEN Studio. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/70 transition-colors">
              Privacy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/70 transition-colors">
              Terms
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/70 transition-colors">
              Cookies
            </a>
            <span className="flex items-center gap-1">
              Made in Lisbon
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
