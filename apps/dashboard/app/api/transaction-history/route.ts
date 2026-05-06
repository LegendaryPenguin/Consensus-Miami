import { NextResponse } from "next/server";
import { createPublicClient, formatUnits, http, parseAbiItem } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

function isAddress(value: string | undefined): value is `0x${string}` {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

export async function GET() {
  const rpc = process.env.BASE_SEPOLIA_RPC_URL?.trim() || "https://sepolia.base.org";
  const buyer = process.env.NEXT_PUBLIC_BUYER_WALLET_ADDRESS?.trim();
  const seller = process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS?.trim() ?? process.env.SELLER_WALLET_ADDRESS?.trim();
  const fromBlockRaw = process.env.TX_HISTORY_START_BLOCK?.trim();
  const fromBlock = fromBlockRaw ? BigInt(fromBlockRaw) : undefined;

  if (!isAddress(buyer) || !isAddress(seller)) {
    return NextResponse.json(
      { error: "missing_addresses", hint: "Set NEXT_PUBLIC_BUYER_WALLET_ADDRESS and NEXT_PUBLIC_SELLER_WALLET_ADDRESS" },
      { status: 400 },
    );
  }

  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpc),
    });

    const logs = await client.getLogs({
      address: USDC_BASE_SEPOLIA,
      event: transferEvent,
      args: { from: buyer, to: seller },
      fromBlock,
    });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const block = await client.getBlock({ blockNumber: log.blockNumber });
        return {
          txHash: log.transactionHash,
          blockNumber: log.blockNumber.toString(),
          timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
          amountRaw: log.args.value?.toString() ?? "0",
          amountUsdc: formatUnits(log.args.value ?? 0n, 6),
        };
      }),
    );

    enriched.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return NextResponse.json({ buyer, seller, count: enriched.length, transfers: enriched });
  } catch {
    return NextResponse.json({ error: "history_query_failed" }, { status: 502 });
  }
}
