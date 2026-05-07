/** Four beats aligned with `activeStageIndex` (0–3) in beatTimeline.ts */
export const LANDING_SCROLL_STAGES = [
  {
    title: "Marketplace",
    subtitle: "Your paid specialist card — the entry point in Cursor.",
  },
  {
    title: "402 gate",
    subtitle: "Payment required until x402 settles — a deliberate paywall.",
  },
  {
    title: "x402 payment",
    subtitle: "USDC moves buyer → seller on Base Sepolia.",
  },
  {
    title: "Verified receipt",
    subtitle: "Proof of unlock — amount, network, and explorer link when available.",
  },
] as const;
