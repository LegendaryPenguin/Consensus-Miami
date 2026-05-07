import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, getPaidAgentApiBase, getSellerSigningSecret, verifySellerSessionToken } from "../../../../../lib/sellerSession";

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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const gate = await requireSellerCookie();
  if ("error" in gate) return gate.error;
  const { id } = await ctx.params;
  const base = getPaidAgentApiBase();
  const body = await request.text();
  const res = await fetch(`${base}/seller/agents/${encodeURIComponent(id)}`, {
    method: "PATCH",
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

export async function DELETE(_request: Request, ctx: Ctx) {
  const gate = await requireSellerCookie();
  if ("error" in gate) return gate.error;
  const { id } = await ctx.params;
  const base = getPaidAgentApiBase();
  const res = await fetch(`${base}/seller/agents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${gate.secret}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
