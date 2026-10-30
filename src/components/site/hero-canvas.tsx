"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

const TOTAL_FRAMES = 299;
const FRAME_W = 1920;
const FRAME_H = 1080;

function frameSrc(i: number) {
  return `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;
}

// Products "emerging" from the cart as it fills — staggered across the scrub
const EMERGING = [
  { name: "Aurora Pro", cat: "Audio", at: 0.18, side: "left", y: "38%" },
  { name: "Velocity Runner", cat: "Sneakers", at: 0.34, side: "right", y: "32%" },
  { name: "Solace Tote", cat: "Leather", at: 0.5, side: "left", y: "58%" },
  { name: "Halo Orb", cat: "Ambient", at: 0.66, side: "right", y: "56%" },
  { name: "Eclipse Overcoat", cat: "Fashion", at: 0.8, side: "left", y: "26%" },
  { name: "Lumen Vessel", cat: "Light", at: 0.92, side: "right", y: "20%" },
];

export function HeroCartCanvas() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Draw a frame index onto the canvas (object-fit: contain)
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[idx];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
    }
    // contain fit
    const scale = Math.min(
      (canvas.width) / img.naturalWidth,
      (canvas.height) / img.naturalHeight
    );
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);
  };

  // Preload frames — priority order: first, then spread evenly, then fill
  useEffect(() => {
    if (reduced) {
      // reduced motion: just load final frame
      const img = new Image();
      img.onload = () => {
        imagesRef.current[TOTAL_FRAMES - 1] = img;
        setLoaded(TOTAL_FRAMES);
        setReady(true);
        requestAnimationFrame(() => drawFrame(TOTAL_FRAMES - 1));
      };
      img.src = frameSrc(TOTAL_FRAMES - 1);
      return;
    }

    let cancelled = false;
    const order: number[] = [];
    // priority: start, end, then every 12th, then fill remainder
    order.push(0, TOTAL_FRAMES - 1);
    for (let step = 12; step < TOTAL_FRAMES; step += 12) {
      for (let i = step; i < Math.min(step + 12, TOTAL_FRAMES); i += 2) {
        if (!order.includes(i)) order.push(i);
      }
    }
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!order.includes(i)) order.push(i);
    }

    let count = 0;
    const loadOne = (idx: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return resolve();
          imagesRef.current[idx] = img;
          count++;
          setLoaded(count);
          if (idx === 0) drawFrame(0);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(idx);
      });

    (async () => {
      // load first batch (priority) in small parallel chunks
      const batchSize = 6;
      for (let i = 0; i < order.length; i += batchSize) {
        if (cancelled) return;
        const chunk = order.slice(i, i + batchSize);
        await Promise.all(chunk.map(loadOne));
        if (i === 0 && !ready) {
          // reveal as soon as first priority batch is in
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  // Set up ScrollTrigger once ready
  useEffect(() => {
    if (!ready || !sectionRef.current || !pinRef.current) return;
    if (reduced) {
      drawFrame(TOTAL_FRAMES - 1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const apply = () => {
      const p = progressRef.current;
      const idx = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
      );
      drawFrame(idx);
      setProgress(p);
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        apply();
      });
    };

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => "+=" + window.innerHeight * 3,
      pin: pinRef.current,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        onScroll();
      },
      onLeaveBack: () => {
        progressRef.current = 0;
        apply();
      },
    });

    const onResize = () => {
      drawFrame(
        Math.round(progressRef.current * (TOTAL_FRAMES - 1))
      );
    };
    window.addEventListener("resize", onResize);

    // initial draw
    apply();

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ScrollTrigger.refresh();
    };
  }, [ready, reduced]);

  const pct = Math.round((loaded / TOTAL_FRAMES) * 100);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: reduced ? "100vh" : "400vh" }}
      aria-label="Scroll-controlled 3D shopping cart"
    >
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden bg-charcoal left-0 top-0"
      >
        {/* Ambient gradient backdrop */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 20%, #1d1f24 0%, #15161a 45%, #0e0f12 100%)",
          }}
        />
        {/* soft electric glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[55vh] w-[55vh] rounded-full blur-[120px] opacity-30"
          style={{ background: "var(--electric)" }}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "contain" }}
        />

        {/* Emerging product labels */}
        {!reduced && (
          <div className="pointer-events-none absolute inset-0">
            {EMERGING.map((e, i) => {
              const shown = progress >= e.at;
              const local =
                Math.min(1, Math.max(0, (progress - e.at) / 0.12));
              return (
                <div
                  key={e.name}
                  className="absolute"
                  style={{
                    top: e.y,
                    [e.side === "left" ? "left" : "right"]:
                      e.side === "left"
                        ? `clamp(1rem, 8vw, 12rem)`
                        : `clamp(1rem, 8vw, 12rem)`,
                    opacity: shown ? 1 : 0,
                    transform: `translateY(${(1 - local) * 24}px)`,
                    transition:
                      "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div className="glass-dark rounded-full pl-2 pr-3 py-1.5 flex items-center gap-2 text-white">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--electric)" }}
                    />
                    <span className="text-[0.7rem] font-medium tracking-wide">
                      {e.name}
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/50">
                      {e.cat}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hero overlay copy */}
        <div className="absolute inset-x-0 top-0 z-10 pt-24 sm:pt-28 px-6">
          <div className="mx-auto max-w-7xl text-center text-white">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="eyebrow text-white/55"
            >
              LUMEN — Objects of Quiet Luxury
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[2.6rem] sm:text-[4rem] lg:text-[5.5rem] leading-[0.95] mt-3 max-w-4xl mx-auto"
            >
              The cart that fills
              <br />
              <span className="italic font-light text-white/80">
                as you scroll.
              </span>
            </motion.h1>
          </div>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {progress < 0.04 && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 text-white/70"
            >
              <span className="eyebrow">Scroll to fill the cart</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress rail */}
        {!reduced && (
          <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-10 hidden sm:flex flex-col items-center gap-2">
            <span className="eyebrow text-white/40 text-[0.55rem]">
              {String(Math.round(progress * 100)).padStart(3, "0")}
            </span>
            <div className="h-40 w-px bg-white/15 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${progress * 100}%`,
                  background: "var(--electric)",
                }}
              />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {!ready && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-20 grid place-items-center bg-charcoal"
            >
              <div className="text-center text-white px-6">
                <div className="eyebrow text-white/40 mb-4">Preparing the cart</div>
                <div className="w-56 sm:w-72 h-px bg-white/15 mx-auto relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: `${pct}%`,
                      background: "var(--electric)",
                      transition: "width 0.2s linear",
                    }}
                  />
                </div>
                <div className="mt-3 text-[0.7rem] tabular-nums text-white/50">
                  {pct}%
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
