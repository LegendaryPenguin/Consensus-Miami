# TollGate Bazaar

TollGate Bazaar is a paid-agent marketplace for Cursor-style AI agents.  
Core flow: Cursor -> MCP -> paid agent `402` -> x402 payment -> verified unlock -> receipt + answer.

## Quickstart

```bash
pnpm install
pnpm typecheck
pnpm test
```

Start dashboard + API:

```bash
pnpm dev
```

Start MCP server in another terminal:

```bash
pnpm dev:mcp
```

## Key tools exposed to Cursor

- `tollgate_list_agents`
- `tollgate_call_paid_agent`
- `tollgate_get_latest_receipt`

## Environment (testnet only)

Copy from `.env.example` and set:

```env
PAYMENT_MODE=x402
TOLLGATE_PAYMENT_MODE=x402
TOLLGATE_API_URL=http://localhost:4000
NEXT_PUBLIC_TOLLGATE_API_URL=http://localhost:4000
X402_NETWORK=eip155:84532
X402_FACILITATOR_URL=https://x402.org/facilitator
SELLER_WALLET_ADDRESS=<base-sepolia-seller>
BUYER_WALLET_PRIVATE_KEY=<base-sepolia-buyer-key>
```

Never commit `.env` or private keys.

## Demo commands before judging

```bash
pnpm typecheck
pnpm build
curl.exe -s http://localhost:4000/health
curl.exe -i -X POST "http://localhost:4000/agents/hackathon-research" -H "Content-Type: application/json" --data-binary "@docs/proof-payload.json"
pnpm phase12:smoke
```

## Demo prompt

Use the stable prompt in [docs/demo-prompt.md](docs/demo-prompt.md).

## Documentation

- Cursor setup: [docs/cursor-setup.md](docs/cursor-setup.md)
- Final script: [docs/final-demo-script.md](docs/final-demo-script.md)
- Demo checklist: [docs/demo-checklist.md](docs/demo-checklist.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- x402 seller proof guide: [docs/proofs/phase7-x402-seller.md](docs/proofs/phase7-x402-seller.md)
- MCPay differentiation notes: [docs/mcpay-reference-notes.md](docs/mcpay-reference-notes.md)
