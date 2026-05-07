import { NextResponse } from "next/server";
import { getPaidAgentApiBase, getSellerSigningSecret } from "../../../../lib/sellerSession";

async function requireSellerSecret() {
  const secret = getSellerSigningSecret();
  if (!secret) return { error: NextResponse.json({ error: "seller_auth_not_configured" }, { status: 503 }) };
  return { secret };
}

export async function GET() {
  const gate = await requireSellerSecret();
  if ("error" in gate) return gate.error;
  const base = getPaidAgentApiBase();
  const res = await fetch(`${base}/seller/agents`, {
    headers: { Authorization: `Bearer ${gate.secret}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const gate = await requireSellerSecret();
  if ("error" in gate) return gate.error;
  const base = getPaidAgentApiBase();
  const body = await request.text();
  const res = await fetch(`${base}/seller/agents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gate.secret}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
