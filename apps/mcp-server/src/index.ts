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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const API_URL = process.env.TOLLGATE_API_URL ?? "http://localhost:4000";
const DEFAULT_PAYMENT_MODE = (process.env.TOLLGATE_PAYMENT_MODE ?? "mock") as PaymentMode;

let latestReceipt: PaymentReceipt | null = null;
let cachedX402Buyer: { client: x402HTTPClient; address: string } | null = null;

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

    const events: TollGateEvent[] = [
      createEvent({ type: "request_received", source: "mcp", detail: "Cursor invoked tollgate_call_paid_agent." }),
      createEvent({ type: "marketplace_lookup", source: "mcp", detail: `Resolved ${agent.name}.` }),
    ];

    const initial = await fetch(agent.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (initial.status !== 402) {
      return {
        content: [{ type: "text", text: `Expected 402, got ${initial.status}` }],
        isError: true,
      };
    }

    events.push(createEvent({ type: "payment_required", source: "api", detail: "Seller returned HTTP 402." }));

    let finalResponse: Response;
    let buyerAddress = "0xMcpBuyer";

    if (mode === "x402") {
      try {
        const buyer = getOrCreateX402Buyer();
        buyerAddress = buyer.address;

        const paymentRequiredHeader =
          initial.headers.get("PAYMENT-REQUIRED") ??
          initial.headers.get("payment-required");
        if (!paymentRequiredHeader) {
          throw new Error("Missing PAYMENT-REQUIRED header in 402 response.");
        }
        const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);

        const paymentPayload = await buyer.client.createPaymentPayload(paymentRequired);
        const paymentHeaders = buyer.client.encodePaymentSignatureHeader(paymentPayload);

        events.push(
          createEvent({
            type: "payment_signed",
            source: "mcp",
            detail: `Signed x402 payment payload with buyer wallet ${buyerAddress}.`,
          }),
        );

        finalResponse = await fetch(agent.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...paymentHeaders,
          },
          body: JSON.stringify({ question }),
        });
      } catch (error) {
        events.push(
          createEvent({
            type: "payment_signed",
            source: "mcp",
            detail: `x402 buyer failed to create/sign payment: ${error instanceof Error ? error.message : String(error)}`,
          }),
        );
        await postEventsToApi(events);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: "x402 buyer payment creation failed.",
                  observed402: true,
                  events,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    } else {
      events.push(createEvent({ type: "payment_signed", source: "mcp", detail: "Attached mock payment header." }));
      finalResponse = await fetch(agent.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Payment": "paid",
        },
        body: JSON.stringify({ question }),
      });
    }

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
        endpoint: agent.endpoint,
        paymentMode: mode,
        network: process.env.X402_NETWORK ?? "eip155:84532",
        priceUsd: agent.priceUsd,
        buyerAddress,
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

function getOrCreateX402Buyer() {
  if (cachedX402Buyer) return cachedX402Buyer;

  const privateKeyRaw = process.env.BUYER_WALLET_PRIVATE_KEY?.trim();
  if (!privateKeyRaw) {
    throw new Error("Missing BUYER_WALLET_PRIVATE_KEY for x402 mode.");
  }

  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const network = (process.env.X402_NETWORK ?? "eip155:84532") as `${string}:${string}`;
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: [network],
  });

  cachedX402Buyer = {
    client: new x402HTTPClient(client),
    address: account.address,
  };

  return cachedX402Buyer;
}

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

const transport = new StdioServerTransport();
await server.connect(transport);
