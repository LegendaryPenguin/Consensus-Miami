import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "tg_seller_session";

export { COOKIE_NAME };

export function createSellerSessionToken(signingSecret: string): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", signingSecret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySellerSessionToken(token: string | undefined, signingSecret: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", signingSecret).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function getSellerSigningSecret(): string | undefined {
  const s = process.env.SELLER_DEMO_SECRET?.trim();
  return s || undefined;
}

export function getPaidAgentApiBase(): string {
  return (
    process.env.TOLLGATE_PAID_API_URL?.trim() ||
    process.env.TOLLGATE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_TOLLGATE_API_URL?.trim() ||
    "http://localhost:4000"
  );
}
