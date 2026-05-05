import type { PaymentMode, PaymentReceipt, TollGateEvent, TollGateEventType } from "./types";

function makeId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEvent(input: {
  type: TollGateEventType;
  source: "dashboard" | "api" | "mcp";
  detail: string;
}): TollGateEvent {
  return {
    id: makeId(),
    type: input.type,
    source: input.source,
    detail: input.detail,
    timestamp: new Date().toISOString(),
  };
}

export function createReceipt(input: {
  agentId: string;
  agentName: string;
  endpoint: string;
  paymentMode: PaymentMode;
  network: string;
  priceUsd: string;
  buyerAddress: string;
  sellerAddress: string;
  status?: PaymentReceipt["status"];
}): PaymentReceipt {
  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    status: input.status ?? "pending",
    agentId: input.agentId,
    agentName: input.agentName,
    endpoint: input.endpoint,
    paymentMode: input.paymentMode,
    network: input.network,
    priceUsd: input.priceUsd,
    buyerAddress: input.buyerAddress,
    sellerAddress: input.sellerAddress,
  };
}
