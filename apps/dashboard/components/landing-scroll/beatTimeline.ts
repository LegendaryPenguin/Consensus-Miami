/**
 * Scroll narrative 0–1 for a single marketplace card evolving through four beats.
 * Values are smooth ramps suitable for opacity / scale / material lerp.
 */

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Beat 1 — card visible, calm (always on; use for float amplitude base). */
export function stageMarketplace(t: number): number {
  return 1 - smoothstep(0.78, 0.95, t);
}

/** Beat 2 — 402 gate + lock on the same card. */
export function stage402(t: number): number {
  const rise = smoothstep(0.12, 0.28, t);
  const fall = 1 - smoothstep(0.38, 0.52, t);
  return rise * fall;
}

/** Beat 3 — buyer / seller + beam above the card. */
export function stagePayment(t: number): number {
  const rise = smoothstep(0.36, 0.52, t);
  const fall = 1 - smoothstep(0.62, 0.76, t);
  return rise * fall;
}

/** Beat 4 — verified receipt treatment on the same card. */
export function stageReceipt(t: number): number {
  return smoothstep(0.58, 0.9, t);
}

/** Discrete stage for debugging or a11y copy (0–3). */
export function activeStageIndex(t: number): 0 | 1 | 2 | 3 {
  if (stageReceipt(t) > 0.55) return 3;
  if (stagePayment(t) > 0.45) return 2;
  if (stage402(t) > 0.45) return 1;
  return 0;
}
