import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, createSellerSessionToken, getSellerSigningSecret, verifySellerSessionToken } from "../../../../lib/sellerSession";

export async function GET() {
  const secret = getSellerSigningSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "seller_auth_not_configured" }, { status: 503 });
  }
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const ok = verifySellerSessionToken(token, secret);
  return NextResponse.json({ ok });
}

export async function POST(request: Request) {
  const secret = getSellerSigningSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "seller_auth_not_configured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { secret?: string };
  const provided = typeof body.secret === "string" ? body.secret.trim() : "";
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "invalid_secret" }, { status: 401 });
  }
  const token = createSellerSessionToken(secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
