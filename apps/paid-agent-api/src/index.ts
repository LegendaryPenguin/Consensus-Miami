import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import cors from "cors";
import { z } from "zod";
import { privateKeyToAccount } from "viem/accounts";
import { createReceipt, getAgentById, type TollGateEventType } from "@tollgate/shared";
import { appendEvent, bootstrapLookupEvent, clearEvents, listEvents } from "./events.js";
import { listMergedAgents } from "./mergeAgents.js";
import { requireSellerDemoAuth } from "./sellerAuth.js";
import * as sellerStore from "./sellerStore.js";
import { appendTransaction, transactionSummary } from "./transactionsStore.js";
import { getHackathonAnswerFromBedrock } from "./bedrock.js";

dotenv.config();

function paramId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const PAYMENT_MODE = (process.env.PAYMENT_MODE ?? process.env.TOLLGATE_PAYMENT_MODE ?? "mock") as "mock" | "x402";
const NETWORK = process.env.X402_NETWORK ?? "eip155:84532";
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";
const PUBLIC_API_URL = process.env.PUBLIC_API_URL?.trim() ?? "";
const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN?.trim() ?? "";
const RAW_SELLER = process.env.SELLER_WALLET_ADDRESS?.trim() ?? "";
const PLACEHOLDER_SELLERS = new Set([
  "",
  "0xSellerWalletPlaceholder",
  "0xYourTestnetSellerWallet",
  "0xYourTestSellerWallet",
  "0xYourRealBaseSepoliaSellerAddress",
]);
const SELLER_WALLET_ADDRESS =
  PAYMENT_MODE === "x402"
    ? RAW_SELLER
    : RAW_SELLER || "0xSellerWalletPlaceholder";
const PRICE_USD = process.env.PRICE_USD ?? "0.003";
const BUYER_ADDRESS = deriveBuyerAddress(process.env.BUYER_WALLET_PRIVATE_KEY);
const API_ORIGIN = PUBLIC_API_URL || `http://localhost:${PORT}`;
const FALLBACK_HACKATHON_ANSWER =
  "Strongest project: Agent Commerce Command Center using x402 pay-per-call specialist agents, with Coinbase payment rails and AWS-hosted orchestration.";

const corsOrigins = [DASHBOARD_ORIGIN, process.env.NEXT_PUBLIC_TOLLGATE_API_URL?.trim() ?? "", "*"].filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.includes("*") ? true : corsOrigins,
  }),
);

if (PAYMENT_MODE === "x402") {
  if (!RAW_SELLER || PLACEHOLDER_SELLERS.has(RAW_SELLER)) {
    console.error(
      "[paid-agent-api] PAYMENT_MODE=x402 requires a real testnet SELLER_WALLET_ADDRESS (not a placeholder). Set SELLER_WALLET_ADDRESS in .env and restart.",
    );
    process.exit(1);
  }
}

const reqSchema = z.object({
  question: z.string().min(3),
});

type X402RouteConfig = Record<
  string,
  {
    accepts: Array<{
      scheme: "exact";
      network: `${string}:${string}`;
      payTo: string;
      price: string;
    }>;
    description: string;
    mimeType: string;
  }
>;

async function buildPaymentGuard(sellerAgents: sellerStore.SellerAgentRecord[]) {
  if (PAYMENT_MODE !== "x402") {
    return ((_req: Request, _res: Response, next: NextFunction) => next()) as RequestHandler;
  }

  const [{ paymentMiddleware }, { x402ResourceServer, HTTPFacilitatorClient }, { ExactEvmScheme }] = await Promise.all([
    import("@x402/express"),
    import("@x402/core/server"),
    import("@x402/evm/exact/server"),
  ]);

  const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  const resourceServer = new x402ResourceServer(facilitatorClient).register(NETWORK as `${string}:${string}`, new ExactEvmScheme());

  const routes: X402RouteConfig = {
    "POST /agents/hackathon-research": {
      accepts: [
        {
          scheme: "exact",
          network: NETWORK as `${string}:${string}`,
          payTo: SELLER_WALLET_ADDRESS,
          price: `$${PRICE_USD}`,
        },
      ],
      description: "Paid specialist hackathon research answer.",
      mimeType: "application/json",
    },
  };

  for (const a of sellerAgents) {
    if (a.status !== "active") continue;
    if (a.id === "hackathon-research-agent") continue;
    const key = `POST /agents/${a.id}`;
    routes[key] = {
      accepts: [
        {
          scheme: "exact",
          network: NETWORK as `${string}:${string}`,
          payTo: a.sellerWalletAddress,
          price: `$${a.priceUsd}`,
        },
      ],
      description: `Paid specialist: ${a.name}`,
      mimeType: "application/json",
    };
  }

  const middleware = paymentMiddleware(routes, resourceServer);

  return middleware as RequestHandler;
}

bootstrapLookupEvent();

app.get("/health", (_req, res) => {
  res.json({ ok: true, paymentMode: PAYMENT_MODE, facilitator: FACILITATOR_URL, publicApiUrl: API_ORIGIN });
});

app.get("/agents", (_req, res) => {
  const agents = listMergedAgents(API_ORIGIN);
  res.json({ agents });
});

app.get("/events", (_req, res) => {
  res.json({ events: listEvents() });
});

app.post("/demo/reset", (req, res) => {
  const confirmed = req.query.confirm === "1" || req.body?.confirm === true;
  if (!confirmed) {
    return res.status(400).json({ ok: false, error: "Reset requires confirm=1 or { confirm: true }" });
  }
  clearEvents();
  bootstrapLookupEvent();
  appendEvent("result_returned", "Demo state reset requested.");
  return res.json({ ok: true, events: listEvents() });
});

app.post("/events", (req, res) => {
  const detail = typeof req.body?.detail === "string" ? req.body.detail : "External event received";
  const type = typeof req.body?.type === "string" ? (req.body.type as TollGateEventType) : "request_received";
  const source = req.body?.source === "mcp" ? "mcp" : req.body?.source === "dashboard" ? "dashboard" : "api";
  const event = appendEvent(type, detail, source);
  res.status(201).json({ event });
});

const sellerCreateSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  name: z.string().min(1),
  priceUsd: z.string().min(1),
  sellerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/i),
});

const sellerPatchSchema = z.object({
  name: z.string().min(1).optional(),
  priceUsd: z.string().min(1).optional(),
  endpoint: z.string().min(1).optional(),
  sellerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/i).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

app.get("/seller/agents", requireSellerDemoAuth, (_req, res) => {
  res.json({ agents: sellerStore.listSellerAgents() });
});

app.post("/seller/agents", requireSellerDemoAuth, (req, res) => {
  const parsed = sellerCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
  }
  try {
    const agent = sellerStore.createSellerAgent(parsed.data, API_ORIGIN);
    return res.status(201).json({ agent });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "agent_id_exists") return res.status(409).json({ error: msg });
    if (msg === "reserved_id" || msg === "invalid_agent_id") return res.status(400).json({ error: msg });
    throw e;
  }
});

app.patch("/seller/agents/:id", requireSellerDemoAuth, (req, res) => {
  const parsed = sellerPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
  }
  const agent = sellerStore.patchSellerAgent(paramId(req.params.id), parsed.data);
  if (!agent) return res.status(404).json({ error: "not_found" });
  return res.json({ agent });
});

app.delete("/seller/agents/:id", requireSellerDemoAuth, (req, res) => {
  const ok = sellerStore.deleteSellerAgent(paramId(req.params.id));
  if (!ok) return res.status(404).json({ error: "not_found" });
  return res.json({ ok: true });
});

app.get("/seller/transactions", requireSellerDemoAuth, (req, res) => {
  const agentId = typeof req.query.agentId === "string" ? req.query.agentId : undefined;
  const summary = transactionSummary(agentId ? { agentId } : undefined);
  return res.json(summary);
});

const sellerAgentsBoot = sellerStore.listSellerAgents();
const paymentGuard = await buildPaymentGuard(sellerAgentsBoot);

app.post("/agents/hackathon-research", paymentGuard, async (req, res) => {
  appendEvent("unpaid_request_sent", "Paid agent request received.");

  const parsed = reqSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const agent = getAgentById("hackathon-research-agent");
  if (!agent) {
    return res.status(404).json({ error: "Agent not found." });
  }

  if (PAYMENT_MODE === "mock") {
    const mockPaidHeader = req.header("X-Mock-Payment");

    if (mockPaidHeader !== "paid") {
      appendEvent("payment_required_402", "Mock mode returned 402 payment requirement.");
      return res.status(402).json({
        agentId: agent.id,
        price: PRICE_USD,
        network: NETWORK,
        payTo: SELLER_WALLET_ADDRESS,
        message: "Payment required to access this specialist agent.",
      });
    }

    appendEvent("mock_payment_detected", "Detected X-Mock-Payment: paid header.");
  } else {
    appendEvent("payment_verified", "x402 middleware validated payment and reached handler.");
  }

  appendEvent("access_unlocked", "Paid resource unlocked.");

  const receipt = createReceipt({
    agentId: agent.id,
    agentName: agent.name,
    endpoint: agent.endpoint,
    paymentMode: PAYMENT_MODE,
    network: NETWORK,
    priceUsd: PRICE_USD,
    buyerAddress: PAYMENT_MODE === "mock" ? "0xMockBuyer" : BUYER_ADDRESS,
    sellerAddress: SELLER_WALLET_ADDRESS,
    status: "verified",
  });

  appendEvent("result_returned", "Returned paid specialist answer.");
  appendEvent("receipt_created", "Payment receipt created for paid call.");
  appendTransaction({
    agentId: agent.id,
    agentName: agent.name,
    buyerAddress: PAYMENT_MODE === "mock" ? "0xMockBuyer" : BUYER_ADDRESS,
    sellerAddress: SELLER_WALLET_ADDRESS,
    amountUsd: PRICE_USD,
    network: NETWORK,
    paymentMode: PAYMENT_MODE,
    status: "verified",
    endpoint: agent.endpoint,
    txHash: receipt.settlementTxHash,
  });
  const answer = (await getHackathonAnswerFromBedrock(parsed.data.question)) ?? FALLBACK_HACKATHON_ANSWER;
  return res.json({ answer, receipt });
});

app.post("/agents/:agentId", paymentGuard, (req, res) => {
  const agentId = paramId(req.params.agentId);
  if (agentId === "hackathon-research-agent") {
    return res.status(404).json({ error: "Not found." });
  }

  const seller = sellerStore.getSellerAgentById(agentId);
  if (!seller || seller.status !== "active") {
    return res.status(404).json({ error: "Agent not found." });
  }

  appendEvent("unpaid_request_sent", `Paid agent request received (${seller.name}).`);

  const parsed = reqSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  if (PAYMENT_MODE === "mock") {
    const mockPaidHeader = req.header("X-Mock-Payment");
    if (mockPaidHeader !== "paid") {
      appendEvent("payment_required_402", "Mock mode returned 402 payment requirement.");
      return res.status(402).json({
        agentId: seller.id,
        price: seller.priceUsd,
        network: NETWORK,
        payTo: seller.sellerWalletAddress,
        message: "Payment required to access this specialist agent.",
      });
    }
    appendEvent("mock_payment_detected", "Detected X-Mock-Payment: paid header.");
  } else {
    appendEvent("payment_verified", "x402 middleware validated payment and reached handler.");
  }

  appendEvent("access_unlocked", "Paid resource unlocked.");

  const receipt = createReceipt({
    agentId: seller.id,
    agentName: seller.name,
    endpoint: seller.endpoint,
    paymentMode: PAYMENT_MODE,
    network: NETWORK,
    priceUsd: seller.priceUsd,
    buyerAddress: PAYMENT_MODE === "mock" ? "0xMockBuyer" : BUYER_ADDRESS,
    sellerAddress: seller.sellerWalletAddress,
    status: "verified",
  });

  appendEvent("result_returned", "Returned paid specialist answer.");
  appendEvent("receipt_created", "Payment receipt created for paid call.");
  appendTransaction({
    agentId: seller.id,
    agentName: seller.name,
    buyerAddress: PAYMENT_MODE === "mock" ? "0xMockBuyer" : BUYER_ADDRESS,
    sellerAddress: seller.sellerWalletAddress,
    amountUsd: seller.priceUsd,
    network: NETWORK,
    paymentMode: PAYMENT_MODE,
    status: "verified",
    endpoint: seller.endpoint,
    txHash: receipt.settlementTxHash,
  });

  return res.json({
    answer: `Paid response from ${seller.name}. Configure your specialist logic on the seller side (MVP placeholder).`,
    receipt,
  });
});

app.listen(PORT, () => {
  console.log(`Paid agent API listening on ${API_ORIGIN} (mode=${PAYMENT_MODE})`);
});

function deriveBuyerAddress(privateKeyRaw: string | undefined): string {
  if (!privateKeyRaw) return "0xBuyerWalletMissing";
  try {
    const normalized = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
    return privateKeyToAccount(normalized as `0x${string}`).address;
  } catch {
    return "0xBuyerWalletInvalid";
  }
}
