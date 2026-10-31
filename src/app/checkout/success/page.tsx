"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Package, ArrowRight, Copy, CheckCheck } from "lucide-react";
import { StorefrontChrome } from "@/components/site/storefront-chrome";
import { formatINR } from "@/lib/format";
import { Suspense } from "react";

export default function SuccessPage() {
  return (
    <StorefrontChrome>
      <Suspense fallback={null}>
        <SuccessInner />
      </Suspense>
    </StorefrontChrome>
  );
}

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .catch(() => {});
  }, [orderNumber]);

  const copyOrder = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="h-16 w-16 rounded-full bg-foreground text-background grid place-items-center mx-auto mb-6"
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </motion.div>

        <div className="eyebrow text-muted-foreground mb-2">Order Confirmed</div>
        <h1 className="font-display text-[2.4rem] sm:text-[3rem] leading-[0.98]">
          Thank you.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
          Your order has been placed and a confirmation has been sent to your email.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Order number</span>
          <span className="text-sm font-medium tabular-nums">{orderNumber}</span>
          <button onClick={copyOrder} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy order number">
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-electric" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass rounded-2xl p-5 text-left"
          >
            <div className="eyebrow text-muted-foreground text-[0.55rem] mb-3">Summary</div>
            <div className="space-y-2 text-sm">
              {order.items?.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between">
                  <span className="truncate">{it.name} × {it.quantity}</span>
                  <span className="tabular-nums">{formatINR(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="hairline my-3" />
            <div className="flex items-center justify-between font-display text-lg">
              <span>Total</span>
              <span className="tabular-nums">{formatINR(order.total)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Payment:</span>
              <span className={order.paymentStatus === "Paid" ? "text-electric" : "text-amber-600"}>
                {order.paymentStatus}
              </span>
              <span className="text-muted-foreground">· Status:</span>
              <span>{order.status}</span>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push("/account")}
            className="rounded-full border border-foreground/15 px-5 h-10 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            View orders
          </button>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Continue shopping <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
