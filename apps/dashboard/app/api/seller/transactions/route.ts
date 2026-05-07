import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, getPaidAgentApiBase, getSellerSigningSecret, verifySellerSessionToken } from "../../../../lib/sellerSession";

async function requireSellerCookie() {
  const secret = getSellerSigningSecret();
  if (!secret) return { error: NextResponse.json({ error: "seller_auth_not_configured" }, { status: 503 }) };
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!verifySellerSessionToken(token, secret)) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { secret };
}

export async function GET(request: Request) {
  const gate = await requireSellerCookie();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const base = getPaidAgentApiBase();
  const q = agentId ? `?agentId=${encodeURIComponent(agentId)}` : "";
  const res = await fetch(`${base}/seller/transactions${q}`, {
    headers: { Authorization: `Bearer ${gate.secret}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
