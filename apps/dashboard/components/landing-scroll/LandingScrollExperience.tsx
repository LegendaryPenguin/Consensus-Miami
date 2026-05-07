"use client";

import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { activeStageIndex } from "./beatTimeline";
import { LandingScrollFallback } from "./LandingScrollFallback";
import { LANDING_SCROLL_STAGES } from "./landingScrollStages";
import { LandingScrollScene } from "./LandingScrollScene";
import { LandingScrollProgressRef } from "./scrollContext";

export type LandingLatestTx = { txHash: string; amountUsdc: string };

export default function LandingScrollExperience({ latestTx }: { latestTx?: LandingLatestTx }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const lastStageRef = useRef<number>(-1);
  const [stageIndex, setStageIndex] = useState<0 | 1 | 2 | 3>(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.75,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        const next = activeStageIndex(self.progress);
        if (next !== lastStageRef.current) {
          lastStageRef.current = next;
          setStageIndex(next);
        }
      },
    });

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return <LandingScrollFallback latestTx={latestTx} />;
  }

  const stage = LANDING_SCROLL_STAGES[stageIndex];

  return (
    <LandingScrollProgressRef.Provider value={progressRef}>
      <section ref={sectionRef} className="relative min-h-[400vh] border-y border-hairline/70 bg-gradient-to-b from-canvas via-canvas to-mutedSurface/40">
        <div
          className={`sticky top-0 h-[100dvh] max-h-[100svh] overflow-hidden ${latestTx ? "pb-28" : "pb-16"}`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-[max(5.5rem,12vh)] z-10 mx-auto max-w-4xl px-4 text-center md:px-8">
            <p key={stageIndex} className="text-3xl font-semibold tracking-tight text-ink drop-shadow-sm md:text-5xl">
              {stage.title}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">{stage.subtitle}</p>
            <p className="mt-4 text-xs text-muted">Scroll to advance the story on the card.</p>
          </div>

          <div className="relative h-full w-full pt-10">
            <Canvas
              className="h-full w-full"
              camera={{ position: [0, 0.08, 5.35], fov: 40, near: 0.1, far: 40 }}
              dpr={[1, 1.35]}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            >
              <color attach="background" args={["#f8fafc"]} />
              <Suspense fallback={null}>
                <LandingScrollScene />
              </Suspense>
            </Canvas>
          </div>

          {latestTx ? (
            <div className="pointer-events-auto absolute bottom-20 left-0 right-0 z-10 mx-auto max-w-6xl px-4 text-center text-[11px] text-muted md:px-8">
              Latest on-chain:{" "}
              <span className="font-medium text-ink">
                {latestTx.amountUsdc} USDC ·{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${latestTx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-link hover:underline"
                >
                  {latestTx.txHash.slice(0, 8)}…{latestTx.txHash.slice(-6)}
                </a>
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </LandingScrollProgressRef.Provider>
  );
}
