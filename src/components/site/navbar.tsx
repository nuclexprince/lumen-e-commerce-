"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useShop } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", view: { name: "home" as const } },
  { label: "Collections", view: { name: "discover" as const } },
  { label: "Discover", view: { name: "discover" as const } },
  { label: "About", view: { name: "home" as const }, hash: "story" },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="1.1" opacity="0.25" />
        <circle cx="13" cy="13" r="5.5" fill="currentColor" />
        <circle cx="13" cy="13" r="9.2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      </svg>
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        LUMEN
      </span>
    </div>
  );
}

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view, navigate, cartCount, wishlist, setCartOpen, setSearchOpen } =
    useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = cartCount();
  const wishCount = wishlist.length;

  const go = (link: (typeof NAV_LINKS)[number]) => {
    setMobileOpen(false);
    if (link.hash) {
      if (view.name !== "home") {
        navigate(link.view);
        setTimeout(() => {
          document
            .getElementById(link.hash!)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        document
          .getElementById(link.hash!)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link.view);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="fixed top-0 inset-x-0 z-50 px-3 sm:px-5 pt-3 sm:pt-4"
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-6 h-14 sm:h-16 transition-all duration-500",
            scrolled ? "glass-strong shadow-[0_8px_40px_-12px_rgba(20,20,22,0.18)]" : "glass"
          )}
        >
          <button
            onClick={() => go(NAV_LINKS[0])}
            className="text-foreground hover:opacity-70 transition-opacity"
            aria-label="LUMEN home"
          >
            <BrandMark />
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = view.name === link.view.name && !link.hash;
              return (
                <button
                  key={link.label}
                  onClick={() => go(link)}
                  className={cn(
                    "relative px-4 py-2 text-[0.8rem] tracking-wide transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-4 right-4 -bottom-0.5 h-px bg-foreground/60"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
            </IconButton>

            <IconButton
              label="Wishlist"
              onClick={() => navigate({ name: "discover" })}
              badge={wishCount}
            >
              <Heart className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
            </IconButton>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-foreground text-background pl-3 pr-3.5 sm:pr-4 h-9 sm:h-10 hover:opacity-90 transition-opacity"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="h-[1rem] w-[1rem]" strokeWidth={1.8} />
              <span className="text-[0.7rem] font-medium tabular-nums">
                {count > 0 ? String(count).padStart(2, "0") : "Bag"}
              </span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-electric text-white text-[0.6rem] font-semibold flex items-center justify-center ring-2 ring-background">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden ml-0.5 h-9 w-9 grid place-items-center rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-[1.05rem] w-[1.05rem]" />
              ) : (
                <Menu className="h-[1.05rem] w-[1.05rem]" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-background/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-20 inset-x-3 glass-strong rounded-2xl p-3 shadow-xl"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => go(link)}
                  className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-foreground/5 transition-colors font-display text-xl"
                >
                  {link.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconButton({
  children,
  label,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-full hover:bg-foreground/5 transition-colors text-foreground"
    >
      {children}
      {badge ? (
        <span className="absolute top-1 right-1 h-3.5 min-w-3.5 px-1 rounded-full bg-electric text-white text-[0.55rem] font-semibold flex items-center justify-center ring-2 ring-background">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
