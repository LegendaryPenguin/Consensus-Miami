import { NextResponse } from "next/server";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

function normalizePrivateKey(value: string): `0x${string}` {
  return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
}

function isAddress(value: string | undefined): value is `0x${string}` {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

async function readBalance(client: any, address: `0x${string}`) {
  const raw = await client.readContract({
    address: USDC_BASE_SEPOLIA,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
  return { raw: raw.toString(), formatted: formatUnits(raw, 6) };
}

export async function GET() {
  const rpc = process.env.BASE_SEPOLIA_RPC_URL?.trim() || "https://sepolia.base.org";
  const seller = process.env.SELLER_WALLET_ADDRESS?.trim();
  const buyerKey = process.env.BUYER_WALLET_PRIVATE_KEY?.trim();

  let buyerAddress: `0x${string}` | null = null;
  try {
    if (buyerKey) {
      buyerAddress = privateKeyToAccount(normalizePrivateKey(buyerKey)).address;
    }
  } catch {
    buyerAddress = null;
  }

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpc),
  });

  try {
    const [buyer, sellerBalance] = await Promise.all([
      buyerAddress ? readBalance(client, buyerAddress) : Promise.resolve(null),
      isAddress(seller) ? readBalance(client, seller) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      network: "eip155:84532",
      token: "USDC",
      buyer: buyerAddress
        ? {
            address: buyerAddress,
            balanceRaw: buyer?.raw ?? null,
            balanceFormatted: buyer?.formatted ?? null,
          }
        : { address: null, balanceRaw: null, balanceFormatted: null },
      seller: isAddress(seller)
        ? {
            address: seller,
            balanceRaw: sellerBalance?.raw ?? null,
            balanceFormatted: sellerBalance?.formatted ?? null,
          }
        : { address: null, balanceRaw: null, balanceFormatted: null },
    });
  } catch {
    return NextResponse.json({ error: "wallet_balance_read_failed" }, { status: 502 });
  }
}
