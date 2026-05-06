import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const RUNS = Number(process.env.PHASE12_RUNS ?? "5");
const QUESTION =
  process.env.PHASE12_QUESTION ?? "What is the strongest Coinbase x AWS x402 hackathon project we should build?";
const API_URL = process.env.TOLLGATE_API_URL ?? "http://localhost:4000";
const NETWORK = process.env.X402_NETWORK ?? "eip155:84532";
const FACILITATOR = process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";
const BUYER_KEY = process.env.BUYER_WALLET_PRIVATE_KEY;
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";

if (!BUYER_KEY) {
  throw new Error("Missing BUYER_WALLET_PRIVATE_KEY");
}

function normalizePrivateKey(value: string): `0x${string}` {
  return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function readUsdcBalance(address: `0x${string}`) {
  const client = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
  return client.readContract({
    address: USDC_BASE_SEPOLIA,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
}

async function run() {
  const account = privateKeyToAccount(normalizePrivateKey(BUYER_KEY));
  const before = await readUsdcBalance(account.address);
  console.log(`Starting Phase 12 smoke: ${RUNS} x402 runs`);
  console.log(`Buyer wallet: ${shortAddress(account.address)}`);
  console.log(`USDC before: ${formatUnits(before, 6)}`);

  for (let i = 0; i < RUNS; i += 1) {
    const transport = new StdioClientTransport({
      command: "pnpm",
      args: ["--filter", "@tollgate/mcp-server", "exec", "tsx", "src/index.ts"],
      env: {
        ...process.env,
        TOLLGATE_API_URL: API_URL,
        TOLLGATE_PAYMENT_MODE: "x402",
        X402_NETWORK: NETWORK,
        X402_FACILITATOR_URL: FACILITATOR,
      },
    });
    const client = new Client({ name: "phase12-smoke", version: "1.0.0" });
    await client.connect(transport);
    await client.callTool({ name: "tollgate_list_agents", arguments: {} });
    const result = await client.callTool({
      name: "tollgate_call_paid_agent",
      arguments: {
        agentId: "hackathon-research-agent",
        question: QUESTION,
        paymentMode: "x402",
      },
    });
    await client.close();

    if ((result as { isError?: boolean }).isError) {
      throw new Error(`Run ${i + 1} failed: tollgate_call_paid_agent returned isError=true`);
    }
    console.log(`Run ${i + 1}/${RUNS}: PASS`);
  }

  const after = await readUsdcBalance(account.address);
  const spent = before - after;
  console.log(`USDC after: ${formatUnits(after, 6)}`);
  console.log(`USDC spent total: ${formatUnits(spent, 6)}`);
}

run().catch((error) => {
  console.error(`Phase 12 smoke failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
