import { NextResponse } from "next/server";
import { createPublicClient, formatUnits, http } from "viem";
import { baseSepolia } from "viem/chains";

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

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function GET() {
  const raw = process.env.NEXT_PUBLIC_BUYER_WALLET_ADDRESS?.trim();
  const rpc = process.env.BASE_SEPOLIA_RPC_URL?.trim() || "https://sepolia.base.org";

  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) {
    return NextResponse.json({
      usdcFormatted: null as string | null,
      addressShort: null as string | null,
      configured: false,
    });
  }

  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpc),
    });
    const balance = await client.readContract({
      address: USDC_BASE_SEPOLIA,
      abi: erc20BalanceAbi,
      functionName: "balanceOf",
      args: [raw as `0x${string}`],
    });
    const formatted = formatUnits(balance, 6);
    const n = Number.parseFloat(formatted);
    const usdcFormatted = Number.isFinite(n) ? `${n.toFixed(4)} USDC` : `${formatted} USDC`;

    return NextResponse.json({
      usdcFormatted,
      addressShort: shortAddress(raw),
      configured: true,
    });
  } catch {
    return NextResponse.json(
      { usdcFormatted: null, addressShort: shortAddress(raw), configured: true, error: "rpc_failed" },
      { status: 502 },
    );
  }
}
