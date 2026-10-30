"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function BrandStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const words =
    "We design objects that ask to be lived with — not collected, not consumed, but kept.".split(
      " "
    );

  return (
    <section
      ref={ref}
      id="story"
      className="relative w-full bg-charcoal text-cream py-24 sm:py-36 px-4 sm:px-6 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
          <motion.img
            src="/brand/atelier.png"
            alt="The LUMEN atelier"
            style={{ y: imgY, scale: 1.12 }}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-5 left-5 glass-dark rounded-full px-3 py-1.5 text-white">
            <span className="eyebrow text-[0.55rem]">The Atelier · Lisbon</span>
          </div>
        </div>

        {/* Text */}
        <motion.div style={{ y: textY }}>
          <div className="eyebrow text-white/40 mb-5">Our Philosophy</div>
          <h2 className="font-display text-[2rem] sm:text-[3rem] leading-[1.05]">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.12 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="inline-block mr-[0.25em]"
              >
                {w}
              </motion.span>
            ))}
          </h2>
          <div className="hairline my-8 max-w-xs" />
          <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed">
            LUMEN began as a quiet rebellion against excess. We make fewer
            things, more carefully — partnering with small ateliers across
            Europe and Japan, choosing materials that age with grace. Every
            object carries a ten-year repair promise. Nothing here is
            disposable.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { n: "12", l: "Ateliers" },
              { n: "10yr", l: "Repair promise" },
              { n: "0", l: "Single-use plastic" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl sm:text-3xl">{s.n}</div>
                <div className="eyebrow text-white/40 text-[0.5rem] mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
