import type express from "express";

export function requireSellerDemoAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const expected = process.env.SELLER_DEMO_SECRET?.trim();
  if (!expected) {
    return res.status(503).json({ error: "seller_auth_not_configured", hint: "Set SELLER_DEMO_SECRET on paid-agent-api." });
  }
  const auth = req.header("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (token !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}
