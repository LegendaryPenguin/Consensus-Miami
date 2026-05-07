import { listAgents, type PaidAgent } from "@tollgate/shared";
import { listSellerAgents } from "./sellerStore.js";

function resolvePublicAgentEndpoint(endpoint: string, apiOrigin: string): string {
  try {
    const path = new URL(endpoint).pathname;
    return new URL(path, apiOrigin).toString();
  } catch {
    return endpoint;
  }
}

/** Static registry wins on id collision; seller agents fill gaps. */
export function listMergedAgents(apiOrigin: string): PaidAgent[] {
  const map = new Map<string, PaidAgent>();
  for (const agent of listAgents()) {
    map.set(agent.id, {
      ...agent,
      endpoint: resolvePublicAgentEndpoint(agent.endpoint, apiOrigin),
    });
  }
  for (const s of listSellerAgents()) {
    if (s.status !== "active") continue;
    if (map.has(s.id)) continue;
    map.set(s.id, {
      id: s.id,
      name: s.name,
      description: "Seller-listed agent",
      priceUsd: s.priceUsd,
      endpoint: resolvePublicAgentEndpoint(s.endpoint, apiOrigin),
      real: true,
    });
  }
  return [...map.values()];
}
