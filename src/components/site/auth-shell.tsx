"use client";

import { motion } from "framer-motion";
import { BrandMark } from "@/components/site/navbar";
import { useRouter } from "next/navigation";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      {/* Editorial side */}
      <div className="relative hidden lg:block bg-charcoal text-cream overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 30% 20%, #26282d 0%, #15161a 50%, #0e0f12 100%)",
          }}
        />
        <div
          className="absolute -left-20 top-1/3 h-[40vh] w-[40vh] rounded-full blur-[120px] opacity-30"
          style={{ background: "var(--electric)" }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
          <button onClick={() => router.push("/")} className="text-cream hover:opacity-70 transition-opacity">
            <BrandMark className="text-cream" />
          </button>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[2.6rem] xl:text-[3.4rem] leading-[1.02] max-w-md"
            >
              Objects of quiet luxury, kept for a lifetime.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-sm text-white/55 mt-5 max-w-sm"
            >
              Create an account to track orders, save addresses, and receive the
              Sunday dispatch.
            </motion.p>
          </div>
          <div className="flex items-center gap-6 text-[0.7rem] text-white/40">
            <span>10-year repair promise</span>
            <span>·</span>
            <span>30-day returns</span>
            <span>·</span>
            <span>Made in Lisbon</span>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 py-12 lg:py-0">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8">
            <button onClick={() => router.push("/")}>
              <BrandMark />
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow text-muted-foreground mb-2">{subtitle}</div>
            <h1 className="font-display text-[2rem] sm:text-[2.4rem] leading-[1.02] mb-8">
              {title}
            </h1>
            {children}
            {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
