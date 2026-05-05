# TollGate Bazaar

## 1. What is TollGate Bazaar?

TollGate Bazaar is an x402-powered marketplace gateway where Cursor-style AI agents can discover paid specialist agents and pay per call through MCP tools.

Primary flow:

1. Cursor calls TollGate MCP tool.
2. TollGate resolves a paid specialist from marketplace registry.
3. Paid specialist responds with HTTP 402 payment requirements.
4. TollGate buyer signs payment (mock or x402 testnet).
5. TollGate retries and returns unlocked specialist output + receipt.
6. Dashboard visualizes the full timeline.

## 2. Why x402?

x402 enables native pay-per-request via HTTP 402, removing API-key/subscription friction for autonomous agents and microservice-like specialist tools.

## 3. Why MCP?

MCP gives Cursor a standard tool interface. TollGate exposes the marketplace and payment orchestration as MCP tools so the same flow can be called naturally from agent prompts.

## 4. How Cursor accesses the market

MCP tools:

- `tollgate_list_agents`
- `tollgate_call_paid_agent`
- `tollgate_get_latest_receipt`

Cursor asks for paid help, TollGate handles 402/payment/retry, and returns structured output.

## 5. Architecture

- `apps/dashboard`: Next.js dashboard with timeline, receipt panel, fallback payment buttons.
- `apps/paid-agent-api`: seller/paywall API with `mock` and `x402` modes.
- `apps/mcp-server`: MCP tool server with buyer-side payment flow.
- `packages/shared`: shared registry/types/events/receipt + shared buyer flow module.

## 6. Local quickstart

```bash
pnpm install
pnpm typecheck
pnpm test
```

One-command local app start (dashboard + paid API):

```bash
pnpm dev
```

Start MCP server in another terminal:

```bash
pnpm dev:mcp
```

## 7. Cursor setup

See [docs/cursor-setup.md](docs/cursor-setup.md) for Windows-safe MCP config and checklist.

## 8. Demo script

Most AI agents today can only use free tools or preconfigured API keys.
TollGate Bazaar lets Cursor-style agents buy specialist help on demand.

We expose a marketplace through MCP.
Cursor discovers a paid research agent.
The research agent requires payment with HTTP 402.
Our MCP server pays using x402 testnet (or mock fallback).
The paid result unlocks and returns directly to Cursor.
The dashboard visualizes the full transaction live.

This is the app store/payment gateway for agent-to-agent services.

## 9. Mock mode

Use when demo reliability is priority.

Example env:

```env
PAYMENT_MODE=mock
TOLLGATE_PAYMENT_MODE=mock
```

Expected flow:

- initial request -> `402`
- retry with mock payment header
- unlocked answer + receipt

## 10. x402 testnet mode

Use Base Sepolia testnet only.

Required env (minimum):

```env
PAYMENT_MODE=x402
TOLLGATE_PAYMENT_MODE=x402
X402_NETWORK=eip155:84532
X402_FACILITATOR_URL=https://x402.org/facilitator
SELLER_WALLET_ADDRESS=<real testnet seller address>
BUYER_WALLET_PRIVATE_KEY=<real testnet buyer private key>
```

Validation docs:

- [docs/proofs/phase7-x402-seller.md](docs/proofs/phase7-x402-seller.md)
- [docs/proofs/phase5-mcp-inspector.md](docs/proofs/phase5-mcp-inspector.md)
- [docs/proofs/phase6-cursor-checklist.md](docs/proofs/phase6-cursor-checklist.md)

## 11. Future AWS deployment

Current MVP is local-first by design. Future production work can place:

- paid-agent API behind managed compute
- dashboard on cloud hosting
- MCP gateway in secure runtime with wallet controls
- production observability and durable event storage

## Product differentiation vs MCPay

TollGate Bazaar reuses high-level 402/payment concepts but is independently implemented as an MCP marketplace gateway for specialist agents, not a direct clone of MCPay. See [docs/mcpay-reference-notes.md](docs/mcpay-reference-notes.md).
