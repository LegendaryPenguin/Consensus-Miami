"use client";

import { motion } from "framer-motion";
import { FlaskConical, Mic2, Search, Shield } from "lucide-react";

export type MarketplaceCard = {
  id: string;
  name: string;
  description: string;
  priceUsd: string;
  status: "Live" | "Demo";
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
    default:
      return Shield;
  }
};

type MarketplaceGridProps = {
  cards: MarketplaceCard[];
  selectedId: string;
};

export function MarketplaceGrid({ cards, selectedId }: MarketplaceGridProps) {
  return (
    <section className="rounded-2xl border border-border bg-panel/70 p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Agent Marketplace</h2>
      <div className="mt-4 space-y-3">
        {cards.map((agent, index) => {
          const Icon = iconFor(agent.id);
          const active = agent.id === selectedId;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border p-4 transition ${
                active
                  ? "border-accent/35 bg-gradient-to-br from-accent/10 to-surface/90 shadow-glow"
                  : "border-border bg-surface/60 hover:border-slate-500/40"
              }`}
            >
              <div className="flex gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 to-glow/20 text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate font-medium text-slate-100">{agent.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        agent.status === "Live"
                          ? "bg-success/15 text-success"
                          : "bg-slate-700/60 text-slate-300"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{agent.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-300">${agent.priceUsd}</span> / call ·{" "}
                    {agent.id === "hackathon-research-agent" ? "Research · x402 · MCP-ready" : "Demo"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
