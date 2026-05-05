import type { PaidAgent } from "./types.js";

const marketplaceRegistry: PaidAgent[] = [
  {
    id: "hackathon-research-agent",
    name: "Hackathon Research Agent",
    description:
      "Finds sponsor-aligned hackathon ideas and explains the strongest build path.",
    priceUsd: "0.003",
    endpoint: "http://localhost:4000/agents/hackathon-research",
    real: true,
  },
  {
    id: "pitch-agent",
    name: "Pitch Agent",
    description: "Turns rough ideas into judge-ready pitch language.",
    priceUsd: "0.002",
    endpoint: "http://localhost:4000/agents/pitch",
    real: false,
  },
  {
    id: "code-review-agent",
    name: "Code Review Agent",
    description: "Reviews technical architecture and repo quality.",
    priceUsd: "0.005",
    endpoint: "http://localhost:4000/agents/code-review",
    real: false,
  },
];

export function listAgents(): PaidAgent[] {
  return [...marketplaceRegistry];
}

export function getAgentById(id: string): PaidAgent | undefined {
  return marketplaceRegistry.find((agent) => agent.id === id);
}
