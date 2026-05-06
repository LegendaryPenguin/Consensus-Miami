import { x402Client, x402HTTPClient } from "@x402/core/client";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import type { PaymentMode } from "./types.js";

type BuyerState = {
  client: x402HTTPClient;
  address: string;
};

type PaidFlowInput = {
  endpoint: string;
  question: string;
  paymentMode: PaymentMode;
  buyerPrivateKey?: string;
  network?: `${string}:${string}`;
};

type PaidFlowResult = {
  initialStatus: number;
  finalStatus: number;
  finalResponse: Response;
  buyerAddress: string;
  paymentRequiredHeader: string;
  settlement?: {
    transaction: string;
    payer?: string;
    amount?: string;
    network?: string;
  };
};

const buyerCache = new Map<string, BuyerState>();

export async function executePaidAgentFlow(input: PaidFlowInput): Promise<PaidFlowResult> {
  const initial = await fetch(input.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: input.question }),
  });

  if (initial.status !== 402) {
    throw new Error(`Expected 402 from paid agent, got ${initial.status}`);
  }

  if (input.paymentMode === "mock") {
    const finalResponse = await fetch(input.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mock-Payment": "paid",
      },
      body: JSON.stringify({ question: input.question }),
    });

    return {
      initialStatus: initial.status,
      finalStatus: finalResponse.status,
      finalResponse,
      buyerAddress: "0xMockBuyer",
      paymentRequiredHeader: getPaymentRequiredHeader(initial),
      settlement: undefined,
    };
  }

  const paymentRequiredHeader = getPaymentRequiredHeader(initial);
  if (!paymentRequiredHeader) {
    throw new Error("Missing PAYMENT-REQUIRED header in 402 response.");
  }

  const buyer = getOrCreateX402Buyer(
    input.buyerPrivateKey ?? process.env.BUYER_WALLET_PRIVATE_KEY,
    input.network ?? ((process.env.X402_NETWORK ?? "eip155:84532") as `${string}:${string}`),
  );

  const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
  const paymentPayload = await buyer.client.createPaymentPayload(paymentRequired);
  const paymentHeaders = buyer.client.encodePaymentSignatureHeader(paymentPayload);

  const finalResponse = await fetch(input.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...paymentHeaders,
    },
    body: JSON.stringify({ question: input.question }),
  });
  const settlement = getPaymentSettlement(finalResponse);

  return {
    initialStatus: initial.status,
    finalStatus: finalResponse.status,
    finalResponse,
    buyerAddress: buyer.address,
    paymentRequiredHeader,
    settlement,
  };
}

function getOrCreateX402Buyer(privateKeyRaw: string | undefined, network: `${string}:${string}`): BuyerState {
  if (!privateKeyRaw) {
    throw new Error("Missing BUYER_WALLET_PRIVATE_KEY for x402 payment flow.");
  }

  const normalizedPrivateKey = privateKeyRaw.startsWith("0x")
    ? privateKeyRaw
    : `0x${privateKeyRaw}`;
  const cacheKey = `${network}:${normalizedPrivateKey.slice(0, 10)}`;
  const cached = buyerCache.get(cacheKey);
  if (cached) return cached;

  const account = privateKeyToAccount(normalizedPrivateKey as `0x${string}`);
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: [network],
  });

  const state: BuyerState = {
    client: new x402HTTPClient(client),
    address: account.address,
  };
  buyerCache.set(cacheKey, state);
  return state;
}

function getPaymentRequiredHeader(response: Response): string {
  return response.headers.get("PAYMENT-REQUIRED") ?? response.headers.get("payment-required") ?? "";
}

function getPaymentSettlement(response: Response): PaidFlowResult["settlement"] {
  const encoded = response.headers.get("PAYMENT-RESPONSE") ?? response.headers.get("X-PAYMENT-RESPONSE");
  if (!encoded) return undefined;
  try {
    const decoded = decodePaymentResponseHeader(encoded);
    return {
      transaction: decoded.transaction,
      payer: decoded.payer,
      amount: decoded.amount,
      network: decoded.network,
    };
  } catch {
    return undefined;
  }
}
