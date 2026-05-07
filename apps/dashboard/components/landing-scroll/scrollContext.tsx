"use client";

import { createContext, useContext } from "react";

/** Global scroll progress 0–1 for the landing 3D narrative (updated by GSAP ScrollTrigger). */
export const LandingScrollProgressRef = createContext<React.MutableRefObject<number> | null>(null);

export function useLandingScrollProgress(): React.MutableRefObject<number> {
  const ctx = useContext(LandingScrollProgressRef);
  if (!ctx) {
    throw new Error("useLandingScrollProgress must be used within LandingScrollProgressRef.Provider");
  }
  return ctx;
}
