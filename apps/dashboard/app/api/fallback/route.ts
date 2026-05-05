import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createEvent, createReceipt, getAgentById } from "@tollgate/shared";
import { executePaidAgentFlow } from "@tollgate/shared/buyer-client";

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const paymentMode = body.paymentMode ?? "mock";
  const question = body.question ?? "What is the strongest Coinbase x AWS x402 project?";
  const agent = getAgentById("hackathon-research-agent");

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const events = [
    createEvent({ type: "request_received", source: "dashboard", detail: "Dashboard fallback invoked paid agent flow." }),
    createEvent({ type: "marketplace_lookup", source: "dashboard", detail: `Resolved ${agent.name}.` }),
  ];

  try {
    const paid = await executePaidAgentFlow({
      endpoint: agent.endpoint,
      question,
      paymentMode,
    });

    events.push(createEvent({ type: "payment_required", source: "api", detail: "Seller returned HTTP 402." }));
    events.push(
      createEvent({
        type: "payment_signed",
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
    const receipt =
      payload.receipt ??
      createReceipt({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: agent.endpoint,
        paymentMode,
        network: process.env.X402_NETWORK ?? "eip155:84532",
        priceUsd: agent.priceUsd,
        buyerAddress: paid.buyerAddress,
        sellerAddress: process.env.SELLER_WALLET_ADDRESS ?? "0xSeller",
        status: "verified",
      });

    events.push(createEvent({ type: "payment_verified", source: "api", detail: "Payment verified by paid-agent-api." }));
    events.push(createEvent({ type: "access_unlocked", source: "api", detail: "Specialist output unlocked." }));
    events.push(createEvent({ type: "result_returned", source: "dashboard", detail: "Dashboard received paid answer." }));

    return NextResponse.json({
      answer: payload.answer,
      receipt,
      events,
      initialStatus: paid.initialStatus,
      finalStatus: paid.finalStatus,
      paymentRequiredHeaderPresent: Boolean(paid.paymentRequiredHeader),
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
