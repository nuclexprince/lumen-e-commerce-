"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setDone(true);
    toast.success("Welcome to LUMEN", {
      description: "Your first dispatch arrives soon.",
    });
  };

  return (
    <section className="relative w-full bg-cream px-4 sm:px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <div className="eyebrow text-muted-foreground mb-4">
          The Dispatch
        </div>
        <h2 className="font-display text-[2.2rem] sm:text-[3.2rem] leading-[1.05]">
          Quiet news, once a week.
        </h2>
        <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
          New arrivals, atelier stories and the occasional early access — sent
          on Sundays, never noisy.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 mx-auto max-w-md flex items-center gap-2 rounded-full glass p-1.5 pl-5 focus-within:ring-2 focus-within:ring-electric/40 transition-all"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
            aria-label="Email address"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {done ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2} />
                Joined
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </>
            )}
          </motion.button>
        </form>
        <p className="text-[0.7rem] text-muted-foreground/70 mt-3">
          No spam. Unsubscribe in one click.
        </p>
      </div>
    </section>
  );
}
