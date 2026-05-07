// Direct x402 paid call to TollGate hackathon-research-agent
// Saves output and receipt to ./results/ folder

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ENDPOINT = "http://localhost:4000/agents/hackathon-research";
const QUESTION = "Give me one Coinbase x AWS x402 hackathon project and a 48-hour execution plan.";
const PRIVATE_KEY = "0xd9211bcc4d47aacbcfe678c79b17e0720cdc19d58b636e55bee0f011290f5645";
const NETWORK = "eip155:84532";
const RESULTS_DIR = join(process.cwd(), "results");

async function main() {
  // Ensure results directory exists
  mkdirSync(RESULTS_DIR, { recursive: true });

  // Step 1: List agents
  console.log("=== STEP 1: LIST AGENTS ===");
  const agentsResp = await fetch("http://localhost:4000/agents");
  const agentsData = await agentsResp.json();

  const target = agentsData.agents.find(a => a.id === "hackathon-research-agent");
  if (!target) {
    console.error("hackathon-research-agent NOT FOUND");
    process.exit(1);
  }
  console.log("✓ hackathon-research-agent confirmed present\n");

  // Step 2: Send unpaid request to get 402
  console.log("=== STEP 2: INITIAL REQUEST (expect 402) ===");
  const initial = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: QUESTION }),
  });
  console.log(`Status: ${initial.status}`);

  if (initial.status !== 402) {
    console.error(`Expected 402, got ${initial.status}`);
    process.exit(1);
  }

  const paymentRequiredHeader = initial.headers.get("PAYMENT-REQUIRED") || initial.headers.get("payment-required");

  // Step 3: Sign x402 payment and retry
  console.log("\n=== STEP 3: SIGN x402 PAYMENT & RETRY ===");

  const { x402Client, x402HTTPClient } = await import("@x402/core/client");
  const { decodePaymentRequiredHeader } = await import("@x402/core/http");
  const { registerExactEvmScheme } = await import("@x402/evm/exact/client");
  const { privateKeyToAccount } = await import("viem/accounts");

  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log(`Buyer address: ${account.address}`);

  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: [NETWORK],
  });

  const httpClient = new x402HTTPClient(client);
  const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
  const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
  console.log("Payment signed, sending paid request...\n");

  const finalResponse = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...paymentHeaders,
    },
    body: JSON.stringify({ question: QUESTION }),
  });

  console.log(`=== STEP 4: FINAL RESPONSE (Status: ${finalResponse.status}) ===`);

  // Check for settlement header
  const paymentResponseHeader = finalResponse.headers.get("PAYMENT-RESPONSE") || finalResponse.headers.get("X-PAYMENT-RESPONSE");
  let settlement = null;
  if (paymentResponseHeader) {
    try {
      const { decodePaymentResponseHeader } = await import("@x402/core/http");
      settlement = decodePaymentResponseHeader(paymentResponseHeader);
    } catch (e) {
      settlement = { raw: paymentResponseHeader };
    }
  }

  const payload = await finalResponse.json();

  // Build receipt object
  const receipt = {
    ...payload.receipt,
    settlement,
    paymentProof: {
      buyerAddress: account.address,
      sellerAddress: paymentRequired?.accepts?.[0]?.payTo || payload.receipt?.sellerAddress,
      paymentMode: "x402",
      network: NETWORK,
      settlementTxHash: settlement?.transaction || payload.receipt?.settlementTxHash || "N/A",
      realPaidCall: true,
      mockCall: false,
    },
  };

  // Save files
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = join(RESULTS_DIR, `output-${timestamp}.md`);
  const receiptFile = join(RESULTS_DIR, `receipt-${timestamp}.json`);

  writeFileSync(outputFile, `# TollGate Paid Agent Response\n\n**Question:** ${QUESTION}\n\n**Timestamp:** ${payload.receipt?.createdAt || new Date().toISOString()}\n\n---\n\n${payload.answer}\n`);
  writeFileSync(receiptFile, JSON.stringify(receipt, null, 2));

  console.log(`\n✓ Output saved to: ${outputFile}`);
  console.log(`✓ Receipt saved to: ${receiptFile}`);
  console.log("\n=== RECEIPT ===");
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
