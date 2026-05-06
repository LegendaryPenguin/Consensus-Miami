import dotenv from "dotenv";
import { z } from "zod";
import {
  createReceipt,
  createEvent,
  getAgentById,
  listAgents,
  type AgentCallResponse,
  type PaymentMode,
  type PaymentReceipt,
  type TollGateEvent,
} from "@tollgate/shared";
import { executePaidAgentFlow } from "@tollgate/shared/buyer-client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

dotenv.config();

const API_URL = process.env.TOLLGATE_API_URL ?? "http://localhost:4000";
const DEFAULT_PAYMENT_MODE = (process.env.TOLLGATE_PAYMENT_MODE ?? "mock") as PaymentMode;

let latestReceipt: PaymentReceipt | null = null;

const server = new McpServer({ name: "tollgate-bazaar", version: "0.1.0" });

server.tool("tollgate_list_agents", "List paid specialist agents in the TollGate marketplace.", {}, async () => {
  const agents = listAgents();
  return {
    content: [{ type: "text", text: JSON.stringify({ agents }, null, 2) }],
    structuredContent: { agents },
  };
});

server.tool(
  "tollgate_call_paid_agent",
  "Call a paid specialist agent and complete 402/payment flow.",
  {
    agentId: z.string(),
    question: z.string(),
    paymentMode: z.enum(["mock", "x402"]).optional(),
  },
  async ({ agentId, question, paymentMode }) => {
    const mode = paymentMode ?? DEFAULT_PAYMENT_MODE;
    const agent = getAgentById(agentId);

    if (!agent) {
      return {
        content: [{ type: "text", text: `Unknown agent: ${agentId}` }],
        isError: true,
      };
    }
    const resolvedEndpoint = resolveAgentEndpoint(agent.endpoint);

    const events: TollGateEvent[] = [
      createEvent({ type: "request_received", source: "mcp", detail: "Cursor invoked tollgate_call_paid_agent." }),
      createEvent({ type: "marketplace_lookup", source: "mcp", detail: `Resolved ${agent.name}.` }),
    ];

    let paidFlow;
    try {
      paidFlow = await executePaidAgentFlow({
        endpoint: resolvedEndpoint,
        question,
        paymentMode: mode,
      });
    } catch (error) {
      events.push(
        createEvent({
          type: "payment_required",
          source: "api",
          detail: `402/payment flow failed early: ${error instanceof Error ? error.message : String(error)}`,
        }),
      );
      await postEventsToApi(events);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "x402 buyer payment creation failed.", events }, null, 2),
          },
        ],
        isError: true,
      };
    }

    events.push(createEvent({ type: "payment_required", source: "api", detail: "Seller returned HTTP 402." }));
    events.push(
      createEvent({
        type: "payment_signed",
        source: "mcp",
        detail:
          mode === "x402"
            ? `Signed x402 payment payload with buyer wallet ${paidFlow.buyerAddress}.`
            : "Attached mock payment header.",
      }),
    );

    const finalResponse = paidFlow.finalResponse;

    if (!finalResponse.ok) {
      await postEventsToApi(events);
      return {
        content: [{ type: "text", text: `Payment retry failed: ${finalResponse.status}` }],
        isError: true,
      };
    }

    const payload = (await finalResponse.json()) as { answer: string; receipt?: PaymentReceipt };
    const receipt =
      payload.receipt ??
      createReceipt({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: resolvedEndpoint,
        paymentMode: mode,
        network: process.env.X402_NETWORK ?? "eip155:84532",
        priceUsd: agent.priceUsd,
        buyerAddress: paidFlow.buyerAddress,
        sellerAddress: process.env.SELLER_WALLET_ADDRESS ?? "0xSeller",
        status: "verified",
      });

    latestReceipt = receipt;

    events.push(
      createEvent({
        type: "payment_verified",
        source: "api",
        detail: mode === "x402" ? "x402 verified by paid-agent-api." : "Payment verified by paid-agent-api.",
      }),
    );
    events.push(createEvent({ type: "access_unlocked", source: "api", detail: "Specialist output unlocked." }));
    events.push(createEvent({ type: "result_returned", source: "mcp", detail: "Returned answer to Cursor." }));

    await postEventsToApi(events);

    const response: AgentCallResponse = {
      answer: payload.answer,
      receipt,
      events,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

server.tool("tollgate_get_latest_receipt", "Return latest TollGate payment receipt.", {}, async () => {
  return {
    content: [{ type: "text", text: JSON.stringify({ receipt: latestReceipt }, null, 2) }],
    structuredContent: { receipt: latestReceipt },
  };
});

async function postEventsToApi(events: TollGateEvent[]) {
  await Promise.all(
    events.map((event) =>
      fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => undefined),
    ),
  );
}

function resolveAgentEndpoint(endpoint: string): string {
  try {
    const path = new URL(endpoint).pathname;
    return new URL(path, API_URL).toString();
  } catch {
    return endpoint;
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);
