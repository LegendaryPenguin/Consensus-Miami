import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createPublicClient, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createEvent, createReceipt, executePaidAgentFlow, getAgentById } from "@tollgate/shared";

const envCandidates = [
  process.env.TOLLGATE_ENV_FILE,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
].filter(Boolean) as string[];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
    break;
  }
}

type Body = {
  question?: string;
  paymentMode?: "mock" | "x402";
};

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const erc20BalanceAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const paymentMode = body.paymentMode ?? "mock";
  const question = body.question ?? "What is the strongest Coinbase x AWS x402 project?";
  const agent = getAgentById("hackathon-research-agent");
  const apiBaseUrl =
    paymentMode === "mock"
      ? process.env.TOLLGATE_MOCK_API_URL ?? "http://localhost:4000"
      : process.env.TOLLGATE_PAID_API_URL ?? process.env.TOLLGATE_API_URL ?? "http://localhost:4000";

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const events = [
    createEvent({ type: "cursor_request_received", source: "dashboard", detail: "Dashboard fallback invoked paid agent flow." }),
    createEvent({ type: "agent_selected", source: "dashboard", detail: `Resolved ${agent.name}.` }),
    createEvent({ type: "unpaid_request_sent", source: "dashboard", detail: "Sending unpaid request to paid endpoint." }),
  ];
  const buyerAddress = getBuyerAddressFromPrivateKey();
  const shouldCaptureBalance = paymentMode === "x402" && Boolean(process.env.BASE_SEPOLIA_RPC_URL && buyerAddress);
  const buyerUsdcBalanceBefore = shouldCaptureBalance ? await readUsdcBalance(buyerAddress as `0x${string}`) : null;

  try {
    const paid = await executePaidAgentFlow({
      endpoint: resolveAgentEndpoint(agent.endpoint, apiBaseUrl),
      question,
      paymentMode,
    });

    events.push(createEvent({ type: "payment_required_402", source: "api", detail: "Seller returned HTTP 402 Payment Required." }));
    events.push(
      createEvent({
        type: paymentMode === "x402" ? "x402_payment_submitted" : "payment_signed",
        source: "dashboard",
        detail:
          paymentMode === "x402"
            ? `Signed real x402 payment with buyer ${paid.buyerAddress}.`
            : "Attached mock payment header.",
      }),
    );

    if (!paid.finalResponse.ok) {
      return NextResponse.json(
        {
          error: `Payment retry failed with status ${paid.finalStatus}`,
          initialStatus: paid.initialStatus,
          finalStatus: paid.finalStatus,
          events,
        },
        { status: 502 },
      );
    }

    const payload = (await paid.finalResponse.json()) as { answer: string; receipt?: ReturnType<typeof createReceipt> };
    if (paid.settlement?.transaction && shouldCaptureBalance) {
      await waitForTransactionReceipt(paid.settlement.transaction);
    }
    const buyerUsdcBalanceAfter = shouldCaptureBalance ? await readUsdcBalance(buyerAddress as `0x${string}`) : null;
    const receipt =
      payload.receipt ??
      createReceipt({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: resolveAgentEndpoint(agent.endpoint, apiBaseUrl),
        paymentMode,
        network: process.env.X402_NETWORK ?? "eip155:84532",
        priceUsd: agent.priceUsd,
        buyerAddress: paid.buyerAddress,
        sellerAddress: process.env.SELLER_WALLET_ADDRESS ?? "0xSeller",
        status: "verified",
        settlementTxHash: paid.settlement?.transaction,
        settlementPayer: paid.settlement?.payer,
        settlementAmount: paid.settlement?.amount,
        settlementNetwork: paid.settlement?.network,
      });
    if (payload.receipt && paid.settlement?.transaction) {
      receipt.settlementTxHash = paid.settlement.transaction;
      receipt.settlementPayer = paid.settlement.payer;
      receipt.settlementAmount = paid.settlement.amount;
      receipt.settlementNetwork = paid.settlement.network;
    }

    events.push(createEvent({ type: "payment_verified", source: "api", detail: "x402 Payment Verified by paid-agent-api." }));
    events.push(createEvent({ type: "access_unlocked", source: "api", detail: "Specialist output unlocked." }));
    events.push(createEvent({ type: "result_returned", source: "dashboard", detail: "Dashboard received paid answer." }));
    events.push(createEvent({ type: "receipt_created", source: "api", detail: `Receipt created (${receipt.id}).` }));

    return NextResponse.json({
      answer: payload.answer,
      receipt,
      events,
      initialStatus: paid.initialStatus,
      finalStatus: paid.finalStatus,
      paymentRequiredHeaderPresent: Boolean(paid.paymentRequiredHeader),
      buyerUsdcBalanceBefore,
      buyerUsdcBalanceAfter,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        events,
      },
      { status: 500 },
    );
  }
}

function getBuyerAddressFromPrivateKey(): string | null {
  const privateKeyRaw = process.env.BUYER_WALLET_PRIVATE_KEY?.trim();
  if (!privateKeyRaw) return null;
  try {
    const normalized = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
    return privateKeyToAccount(normalized as `0x${string}`).address;
  } catch {
    return null;
  }
}

async function readUsdcBalance(address: `0x${string}`): Promise<string | null> {
  try {
    const rpc = process.env.BASE_SEPOLIA_RPC_URL?.trim();
    if (!rpc) return null;
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpc),
    });
    const balance = await client.readContract({
      address: USDC_BASE_SEPOLIA,
      abi: erc20BalanceAbi,
      functionName: "balanceOf",
      args: [address],
    });
    return formatUnits(balance, 6);
  } catch {
    return null;
  }
}

async function waitForTransactionReceipt(txHash: string): Promise<void> {
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return;
  const rpc = process.env.BASE_SEPOLIA_RPC_URL?.trim();
  if (!rpc) return;
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpc),
  });
  try {
    await client.waitForTransactionReceipt({ hash: txHash as `0x${string}`, timeout: 20_000 });
  } catch {
    // best effort only
  }
}

function resolveAgentEndpoint(endpoint: string, apiBaseUrl: string): string {
  try {
    const path = new URL(endpoint).pathname;
    return new URL(path, apiBaseUrl).toString();
  } catch {
    return endpoint;
  }
}
