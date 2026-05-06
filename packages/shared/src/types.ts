export type PaymentMode = "mock" | "x402";

export type PaidAgent = {
  id: string;
  name: string;
  description: string;
  priceUsd: string;
  endpoint: string;
  real: boolean;
};

export type TollGateEventType =
  | "cursor_request_received"
  | "marketplace_listed"
  | "agent_selected"
  | "unpaid_request_sent"
  | "payment_required_402"
  | "x402_payment_submitted"
  | "receipt_created"
  | "request_received"
  | "marketplace_lookup"
  | "payment_required"
  | "mock_payment_detected"
  | "payment_signed"
  | "payment_verified"
  | "access_unlocked"
  | "result_returned";

export type TollGateEvent = {
  id: string;
  type: TollGateEventType;
  timestamp: string;
  source: "dashboard" | "api" | "mcp";
  detail: string;
};

export type PaymentReceipt = {
  id: string;
  agentId: string;
  agentName: string;
  endpoint: string;
  status: "pending" | "paid" | "verified";
  network: string;
  priceUsd: string;
  buyerAddress: string;
  sellerAddress: string;
  paymentMode: PaymentMode;
  createdAt: string;
  settlementTxHash?: string;
  settlementPayer?: string;
  settlementAmount?: string;
  settlementNetwork?: string;
};

export type AgentCallRequest = {
  agentId: string;
  question: string;
  paymentMode: PaymentMode;
};

export type AgentCallResponse = {
  answer: string;
  receipt: PaymentReceipt;
  events: TollGateEvent[];
};
