# MCPay Reference Notes

Reference reviewed: https://github.com/microchipgnu/MCPay/tree/cdp-hackathon-submission

## What we reused

- 402-first request pattern: initial unpaid call, then payment-aware retry.
- Tooling mindset: keep MCP-facing integration small and demo-friendly.
- Timeline/event idea: expose machine-readable events so a dashboard can narrate payment flow.
- Registry-driven discovery: use a typed marketplace list for tool/agent selection.

## What we changed

- Product scope: TollGate Bazaar is an MCP marketplace gateway for paid specialist agents, not a generic MCP monetization proxy product.
- Runtime architecture: we use three local apps (`dashboard`, `paid-agent-api`, `mcp-server`) plus shared package, instead of cloning MCPay package layout.
- Seller implementation: explicit dual mode (`mock` and `x402`) in `paid-agent-api` with strict x402 startup guards.
- Buyer implementation: MCP server now owns buyer-side x402 payment-signing logic for per-call tool execution.
- Dashboard behavior: includes a fallback payment route (`/api/fallback`) so demo can run without Cursor as backup path.

## Why TollGate Bazaar is different

- Target user story is agent-to-agent specialist commerce from Cursor via MCP.
- We optimize for hackathon demo reliability with clear phase gates and fallback mode.
- We intentionally preserve mock mode while layering in real testnet x402, instead of forcing one path.
- The marketplace includes one real paid specialist plus simulated listings for presentation polish.

## License and adaptation notes

- No direct bulk code copy from MCPay repository.
- Patterns were adapted conceptually and reimplemented in this codebase.
- Implementation remains independently runnable with local setup and docs in this repo.
