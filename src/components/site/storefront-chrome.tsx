"use client";

import { CatalogProvider } from "@/components/catalog-provider";
import { FloatingNavbar } from "./navbar";
import { ShoppingBagDrawer } from "@/components/shop/shopping-bag";
import { SearchOverlay } from "@/components/shop/search-overlay";

export function StorefrontChrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <CatalogProvider>
      <div className="relative min-h-screen flex flex-col bg-cream">
        <FloatingNavbar />
        <ShoppingBagDrawer />
        <SearchOverlay />
        <main className="flex-1">{children}</main>
        {footer}
      </div>
    </CatalogProvider>
  );
}
