"use client";

const ITEMS = [
  "Free shipping over ₹5,000",
  "10-year repair promise",
  "Shipped from Lisbon",
  "Quiet luxury, always",
  "New arrivals every Sunday",
  "30-day returns",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative w-full bg-charcoal text-cream overflow-hidden py-4 border-y border-white/5">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="text-xs sm:text-sm tracking-wide text-white/70 mx-6">
              {t}
            </span>
            <span className="h-1 w-1 rounded-full bg-electric/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
