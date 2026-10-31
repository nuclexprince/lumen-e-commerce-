"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

export type View =
  | { name: "home" }
  | { name: "discover"; category?: string }
  | { name: "product"; id: string };

interface CartLine {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

interface ShopState {
  // Navigation
  view: View;
  navigate: (view: View) => void;

  // Cart
  cart: CartLine[];
  addToCart: (product: Product, qty?: number, opts?: { size?: string | null; color?: string | null }) => void;
  removeFromCart: (lineId: string) => void;
  setQuantity: (lineId: string, qty: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // UI drawers
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // derived
  cartCount: () => number;
  subtotal: () => number;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      navigate: (view) => {
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      },

      cart: [],
      addToCart: (product, qty = 1, opts) =>
        set((state) => {
          const size = opts?.size ?? null;
          const color = opts?.color ?? null;
          const lineId = `${product.id}__${size || ""}__${color || ""}`;
          const existing = state.cart.find((l) => l.lineId === lineId);
          if (existing) {
            return {
              cart: state.cart.map((l) =>
                l.lineId === lineId ? { ...l, quantity: l.quantity + qty } : l
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                lineId,
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: qty,
                size,
                color,
              },
            ],
          };
        }),
      removeFromCart: (lineId) =>
        set((state) => ({
          cart: state.cart.filter((l) => l.lineId !== lineId),
        })),
      setQuantity: (lineId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((l) => l.lineId !== lineId)
              : state.cart.map((l) =>
                  l.lineId === lineId ? { ...l, quantity: qty } : l
                ),
        })),
      clearCart: () => set({ cart: [] }),

      wishlist: [],
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      isWishlisted: (productId) => get().wishlist.includes(productId),

      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      cartCount: () =>
        get().cart.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () =>
        get().cart.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    {
      name: "lumen-shop",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
