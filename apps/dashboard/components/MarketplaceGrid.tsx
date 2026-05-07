"use client";

import { FlaskConical, Mic2, Search, Shield, Sparkles } from "lucide-react";

export type MarketplaceCard = {
  id: string;
  name: string;
  description: string;
  priceUsd: string;
  real?: boolean;
};

const iconFor = (id: string) => {
  switch (id) {
    case "hackathon-research-agent":
      return Search;
    case "pitch-agent":
      return Mic2;
    case "code-review-agent":
      return FlaskConical;
    case "wallet-risk-agent":
      return Shield;
    default:
      return Sparkles;
  }
};

/** One short tag for the card (not a debug dump). */
function categoryTag(agent: MarketplaceCard): string {
  if (agent.real === true) return "Live";
  if (agent.id.includes("risk")) return "Risk";
  if (agent.id.includes("pitch")) return "Pitch";
  if (agent.id.includes("code")) return "Code";
  if (agent.id.includes("hackathon")) return "Research";
  return "Agent";
}

type MarketplaceGridProps = {
  cards: MarketplaceCard[];
  selectedId: string;
  onSelect?: (id: string) => void;
  paymentInFlight?: boolean;
};

export function MarketplaceGrid({ cards, selectedId, onSelect, paymentInFlight }: MarketplaceGridProps) {
  return (
    <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Agent marketplace</span>
        <h2 className="text-base font-semibold tracking-tight text-ink">Choose a paid specialist</h2>
        <p className="mt-1 text-xs text-muted">
          Tap an agent card to pay via x402 from your IDE.
        </p>
      </div>
      <div className="mt-4 space-y-2">
        {cards.map((agent) => {
          const Icon = iconFor(agent.id);
          const active = agent.id === selectedId;
          const tag = categoryTag(agent);
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelect?.(agent.id)}
              className={`w-full rounded-panel border p-3.5 text-left transition-all ${
                active
                  ? "border-accent/50 bg-raised shadow-card ring-1 ring-accent/20"
                  : "border-hairline bg-canvas hover:border-hairlineStrong hover:bg-mutedSurface"
              } ${paymentInFlight && active ? "shadow-[0_12px_36px_rgba(37,99,235,0.35)]" : ""}`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-panel border ${
                    active ? "border-accent/30 bg-surface text-accent" : "border-hairline bg-surface text-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-ink">{agent.name}</p>
                    <span className="shrink-0 rounded border border-hairline bg-raised px-1.5 py-0.5 text-[10px] text-muted">
                      {tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">
                    ${agent.priceUsd}
                    <span className="font-normal text-muted"> USDC</span>
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
