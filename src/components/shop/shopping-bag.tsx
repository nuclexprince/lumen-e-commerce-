"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useShop } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export function ShoppingBagDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cart,
    setQuantity,
    removeFromCart,
    subtotal,
    clearCart,
    cartCount,
    navigate,
  } = useShop();

  const sub = subtotal();
  const shipping = cart.length > 0 ? 0 : 0; // free shipping
  const total = sub + shipping;

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          <div
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 h-full w-full sm:w-[440px] glass-strong border-l border-foreground/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-foreground/10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
                <span className="font-display text-xl">Your Bag</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ({cartCount()})
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-full hover:bg-foreground/5 transition-colors"
                aria-label="Close bag"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="h-16 w-16 rounded-full bg-foreground/5 grid place-items-center mb-4">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" strokeWidth={1.3} />
                  </div>
                  <h3 className="font-display text-xl">Your bag is empty</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    Objects of quiet luxury are waiting. Let's find something
                    worth keeping.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate({ name: "discover" });
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Discover products
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {cart.map((line) => (
                      <motion.li
                        key={line.productId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4"
                      >
                        <div className="h-24 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary ring-1 ring-foreground/5">
                          <img
                            src={line.image}
                            alt={line.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-base leading-tight">
                              {line.name}
                            </h4>
                            <button
                              onClick={() => {
                                removeFromCart(line.productId);
                                toast("Removed from bag", { description: line.name });
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                            {formatINR(line.price)}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-foreground/15">
                              <button
                                onClick={() => setQuantity(line.productId, line.quantity - 1)}
                                className="h-8 w-8 grid place-items-center hover:bg-foreground/5 transition-colors rounded-l-full"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => setQuantity(line.productId, line.quantity + 1)}
                                className="h-8 w-8 grid place-items-center hover:bg-foreground/5 transition-colors rounded-r-full"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium tabular-nums">
                              {formatINR(line.price * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>

                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        clearCart();
                        toast("Bag cleared");
                      }}
                      className="text-[0.7rem] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                    >
                      Clear all
                    </button>
                  )}
                </ul>
              )}
            </div>

            {/* Footer summary */}
            {cart.length > 0 && (
              <div className="border-t border-foreground/10 px-5 sm:px-6 py-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatINR(sub)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-electric">Complimentary</span>
                </div>
                <div className="hairline" />
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-lg tabular-nums">
                    {formatINR(total)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    toast.success("Checkout simulated", {
                      description: "This is a demo store — no payment taken.",
                    });
                  }}
                  className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-1"
                >
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-[0.65rem] text-muted-foreground text-center">
                  Secure, encrypted, 30-day returns.
                </p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
