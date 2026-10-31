"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { StorefrontChrome } from "@/components/site/storefront-chrome";
import { Suspense } from "react";

export default function FailurePage() {
  return (
    <StorefrontChrome>
      <Suspense fallback={null}>
        <FailureInner />
      </Suspense>
    </StorefrontChrome>
  );
}

function FailureInner() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason") || "payment_failed";

  return (
    <div className="pt-28 pb-24 min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto mb-6">
          <XCircle className="h-7 w-7" strokeWidth={2.5} />
        </div>

        <div className="eyebrow text-muted-foreground mb-2">Payment Not Completed</div>
        <h1 className="font-display text-[2.4rem] sm:text-[3rem] leading-[0.98]">
          Something went wrong.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
          Your payment could not be completed. No charge has been made. You can try again
          — your bag is still waiting.
        </p>

        <div className="mt-4 inline-block rounded-xl bg-foreground/5 px-4 py-2 text-xs text-muted-foreground">
          Reason: <span className="font-mono">{reason.replace(/_/g, " ")}</span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push("/checkout")}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 h-10 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Continue shopping <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
