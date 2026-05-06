import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const API_URL = process.env.TOLLGATE_API_URL;
const QUESTION =
  process.env.PHASE19_QUESTION ?? "What is the strongest Coinbase x AWS x402 hackathon project we should build?";

if (!API_URL) {
  throw new Error("Missing TOLLGATE_API_URL. Set it to your public API URL.");
}

async function run() {
  const transport = new StdioClientTransport({
    command: "pnpm",
    args: ["--filter", "@tollgate/mcp-server", "exec", "tsx", "src/index.ts"],
    env: {
      ...process.env,
      TOLLGATE_API_URL: API_URL,
      TOLLGATE_PAYMENT_MODE: "x402",
    },
  });

  const client = new Client({ name: "phase19-public-check", version: "1.0.0" });
  await client.connect(transport);

  const listResult = await client.callTool({ name: "tollgate_list_agents", arguments: {} });
  const callResult = await client.callTool({
    name: "tollgate_call_paid_agent",
    arguments: {
      agentId: "hackathon-research-agent",
      question: QUESTION,
      paymentMode: "x402",
    },
  });
  const receiptResult = await client.callTool({ name: "tollgate_get_latest_receipt", arguments: {} });
  await client.close();

  if ((callResult as { isError?: boolean }).isError) {
    throw new Error("Public access paid call failed.");
  }

  const receiptText = (receiptResult as { content?: Array<{ text?: string }> }).content?.[0]?.text ?? "{}";
  const parsed = JSON.parse(receiptText) as { receipt?: { paymentMode?: string; network?: string } };
  if (parsed.receipt?.paymentMode !== "x402") {
    throw new Error(`Expected paymentMode=x402, got ${parsed.receipt?.paymentMode ?? "missing"}`);
  }
  if (parsed.receipt?.network !== "eip155:84532") {
    throw new Error(`Expected network=eip155:84532, got ${parsed.receipt?.network ?? "missing"}`);
  }

  console.log("PHASE19_LIST_OK", Boolean(listResult));
  console.log("PHASE19_CALL_OK", true);
  console.log("PHASE19_RECEIPT_OK", JSON.stringify(parsed.receipt, null, 2));
}

run().catch((error) => {
  console.error(`Phase 19 public-access check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
