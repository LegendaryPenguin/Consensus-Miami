import { describe, expect, it } from "vitest";
import { createEvent, createReceipt, getAgentById, listAgents } from "./src/index.js";

describe("shared registry", () => {
  it("lists marketplace agents", () => {
    const agents = listAgents();
    expect(agents.length).toBeGreaterThanOrEqual(3);
    expect(agents.some((a) => a.id === "hackathon-research-agent" && a.real)).toBe(true);
  });

  it("returns undefined for unknown ids", () => {
    expect(getAgentById("missing-agent")).toBeUndefined();
  });
});

describe("shared factories", () => {
  it("creates events and receipts with IDs", () => {
    const event = createEvent({ type: "payment_required", source: "api", detail: "test" });
    const receipt = createReceipt({
      agentId: "hackathon-research-agent",
      agentName: "Hackathon Research Agent",
      endpoint: "http://localhost:4000/agents/hackathon-research",
      paymentMode: "mock",
      network: "eip155:84532",
      priceUsd: "0.003",
      buyerAddress: "0xBuyer",
      sellerAddress: "0xSeller",
    });

    expect(event.id).toBeTruthy();
    expect(receipt.id).toBeTruthy();
    expect(receipt.status).toBe("pending");
  });
});
