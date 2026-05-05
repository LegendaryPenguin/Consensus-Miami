import { randomUUID } from "node:crypto";
import type { PaymentMode, PaymentReceipt, TollGateEvent, TollGateEventType } from "./types.js";

export function createEvent(input: {
  type: TollGateEventType;
  source: "dashboard" | "api" | "mcp";
  detail: string;
}): TollGateEvent {
  return {
    id: randomUUID(),
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
    id: randomUUID(),
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
