"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const IMAGES = [
  "/editorial/ed-1.png",
  "/editorial/ed-2.png",
  "/editorial/ed-3.png",
  "/editorial/ed-4.png",
];

interface ChoreImage {
  src: string;
  // initial corner (vw/vh based)
  startX: string;
  startY: string;
  // diagonal travel during stage 2
  diagX: number; // -1..1 fraction of slot
  diagY: number;
  isHero: boolean;
}

const PLACEMENT: ChoreImage[] = [
  { src: IMAGES[0], startX: "12%", startY: "18%", diagX: 1, diagY: 1, isHero: false }, // top-left
  { src: IMAGES[1], startX: "62%", startY: "12%", diagX: -1, diagY: 1, isHero: true },  // top-right (hero)
  { src: IMAGES[2], startX: "16%", startY: "56%", diagX: 1, diagY: -1, isHero: false }, // bottom-left
  { src: IMAGES[3], startX: "60%", startY: "52%", diagX: -1, diagY: -1, isHero: false }, // bottom-right
];

export function ScrollChoreography() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="relative w-full bg-cream"
      style={{ height: "420vh" }}
      aria-label="Editorial choreography"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden grain">
        {/* center marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="h-40 w-40 sm:h-56 sm:w-56 rounded-full border border-foreground/10" />
        </div>

        {/* Stage label */}
        <StageLabel progress={scrollYProgress} />

        {/* headline */}
        <div className="absolute inset-x-0 top-0 z-20 pt-24 sm:pt-28 px-6 text-center pointer-events-none">
          <p className="eyebrow text-muted-foreground">The Collection Edit</p>
          <h2 className="font-display text-[2rem] sm:text-[3.2rem] leading-[1] mt-3 max-w-2xl mx-auto">
            Four objects, <span className="italic font-light">one movement.</span>
          </h2>
        </div>

        {PLACEMENT.map((img, i) => (
          <ChoreImageCard
            key={i}
            image={img}
            index={i}
            progress={scrollYProgress}
          />
        ))}

        {/* Final caption that fades in at the end */}
        <EndCaption progress={scrollYProgress} />
      </div>
    </section>
  );
}

function ChoreImageCard({
  image,
  index,
  progress,
}: {
  image: ChoreImage;
  index: number;
  progress: MotionValue<number>;
}) {
  // Stage boundaries: 0.0-0.22 appear, 0.22-0.5 diagonal, 0.5-0.78 converge, 0.78-1.0 hero expand
  const baseW = image.isHero ? 26 : 24; // % of viewport width
  const baseWSm = image.isHero ? 20 : 18;

  // opacity: appear in stage 1 (0 -> 1 over 0-0.18), fade others during hero expand
  const opacity = useTransform(
    progress,
    [0, 0.12, 0.7, 0.78, 1],
    image.isHero ? [0, 1, 1, 1, 1] : [0, 1, 1, 0, 0]
  );

  // Stage 1: appear at corner (scale up)
  const appearScale = useTransform(progress, [0, 0.18], [0.8, 1]);

  // Stage 2 diagonal move: from corner toward center by diag fraction
  // map progress 0.2->0.5 to translate from 0 to diag*slotDistance
  const slot = 18; // percent travel
  const stage2X = useTransform(
    progress,
    [0.2, 0.5],
    [0, image.diagX * slot]
  );
  const stage2Y = useTransform(
    progress,
    [0.2, 0.5],
    [0, image.diagY * slot]
  );

  // Stage 3 converge to center: 0.5 -> 0.78, move to center
  // compute offset from center at end of stage2 and interpolate to 0
  // center is at 50%, current x pos ~ startX + diagX*slot
  const endStage2X = parseFloat(image.startX) + image.diagX * slot;
  const endStage2Y = parseFloat(image.startY) + image.diagY * slot;
  // final position center (50%) minus half image width
  const convergeCenterX = 50 - baseW / 2;
  const convergeCenterY = 42; // slightly above middle for caption space

  // Combined x: corner -> after diag -> center -> (hero stays center, others fade)
  const x = useTransform(
    progress,
    [0, 0.2, 0.5, 0.78, 1],
    [
      parseFloat(image.startX),
      parseFloat(image.startX),
      endStage2X,
      image.isHero ? convergeCenterX + (image.isHero ? 0 : 0) : convergeCenterX,
      convergeCenterX,
    ]
  );
  const y = useTransform(
    progress,
    [0, 0.2, 0.5, 0.78, 1],
    [
      parseFloat(image.startY),
      parseFloat(image.startY),
      endStage2Y,
      convergeCenterY,
      convergeCenterY,
    ]
  );

  // Stage 4 hero expand: top-right (hero) scales to full screen
  const heroScale = useTransform(
    progress,
    [0.78, 1],
    [1, image.isHero ? 4.4 : 1]
  );
  const heroZ = useTransform(progress, [0.74, 0.8], [10, image.isHero ? 30 : 10]);

  // dim non-hero during hero expand handled by opacity above
  const scale = image.isHero ? heroScale : appearScale;

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: useTransform(x, (v) => `${v}%`),
        top: useTransform(y, (v) => `${v}%`),
        width: `${baseW}%`,
        opacity,
        scale,
        zIndex: heroZ,
        willChange: "transform, opacity",
      }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(20,20,22,0.45)] ring-1 ring-foreground/5"
        style={{ transform: `translateZ(0)` }}
      >
        <img
          src={image.src}
          alt={`Editorial object ${index + 1}`}
          className="h-full w-full object-cover"
          loading="eager"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <span className="font-display text-sm sm:text-base leading-tight">
            {["Aurora", "Nimbus", "Lumen", "Halo"][index]}
          </span>
          <span className="eyebrow text-white/60 text-[0.5rem]">
            {String(index + 1).padStart(2, "0")} / 04
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function StageLabel({ progress }: { progress: MotionValue<number> }) {
  const stages = ["Appear", "Drift", "Converge", "Expand"];
  const active = useTransform(progress, (p) => {
    if (p < 0.2) return 0;
    if (p < 0.5) return 1;
    if (p < 0.78) return 2;
    return 3;
  });
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-20 flex items-center gap-4">
      {stages.map((s, i) => (
        <StagePill key={s} label={s} index={i} active={active} />
      ))}
    </div>
  );
}

function StagePill({
  label,
  index,
  active,
}: {
  label: string;
  index: number;
  active: MotionValue<number>;
}) {
  const opacity = useTransform(active, (a) =>
    Math.round(a) === index ? 1 : 0.3
  );
  const color = useTransform(active, (a) =>
    Math.round(a) === index ? "var(--electric)" : "transparent"
  );
  return (
    <motion.div className="flex items-center gap-2" style={{ opacity }}>
      <motion.span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      <span className="eyebrow text-[0.55rem] text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

function EndCaption({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.85, 0.96], [0, 1]);
  const y = useTransform(progress, [0.85, 1], [20, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-12 z-30 px-6 text-center"
    >
      <p className="font-display text-white text-xl sm:text-3xl max-w-xl mx-auto drop-shadow-lg">
        One object, fully seen.
      </p>
    </motion.div>
  );
}
