"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useShop } from "@/lib/store";
import { CatalogProvider, useCatalog } from "@/components/catalog-provider";
import { FloatingNavbar } from "@/components/site/navbar";
import { ShoppingBagDrawer } from "@/components/shop/shopping-bag";
import { SearchOverlay } from "@/components/shop/search-overlay";
import { HeroCartCanvas } from "@/components/site/hero-canvas";
import { Marquee } from "@/components/site/marquee";
import { NewArrivals } from "@/components/site/new-arrivals";
import { ScrollChoreography } from "@/components/ui/scroll-choreography";
import { CategoryShowcase } from "@/components/site/category-showcase";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { BrandStory } from "@/components/site/brand-story";
import { PromoBanner } from "@/components/site/promo-banner";
import { Newsletter } from "@/components/site/newsletter";
import { Footer } from "@/components/site/footer";
import { ProductDiscovery } from "@/components/shop/product-discovery";
import { ProductDetail } from "@/components/shop/product-detail";
import { RecommendationsSection } from "@/components/shop/recommendations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  return (
    <CatalogProvider>
      <Storefront />
    </CatalogProvider>
  );
}

function Storefront() {
  const { view } = useShop();

  // Refresh ScrollTrigger when view changes (hero pins etc.)
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(t);
  }, [view]);

  return (
    <div className="relative min-h-screen flex flex-col bg-cream">
      <FloatingNavbar />
      <ShoppingBagDrawer />
      <SearchOverlay />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name + (view.name === "product" ? view.id : "") + (view.name === "discover" ? (view.category || "all") : "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {view.name === "home" && <HomePage />}
            {view.name === "discover" && (
              <ProductDiscovery initialCategory={view.category} />
            )}
            {view.name === "product" && <ProductDetail id={view.id} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function HomePage() {
  const { getByCollection } = useCatalog();
  const trending = getByCollection("trending");
  const editors = getByCollection("editors");

  return (
    <>
      <HeroCartCanvas />
      <Marquee />
      <NewArrivals />
      <ScrollChoreography />
      <CategoryShowcase />

      {/* Trending carousel */}
      <section className="bg-cream py-24 sm:py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ProductCarousel products={trending} variant="trending" />
        </div>
      </section>

      <BrandStory />

      {/* Editor's picks carousel */}
      <section className="bg-cream py-24 sm:py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ProductCarousel products={editors} variant="editors" />
        </div>
      </section>

      <PromoBanner />
      <Newsletter />
      <Footer />
    </>
  );
}
