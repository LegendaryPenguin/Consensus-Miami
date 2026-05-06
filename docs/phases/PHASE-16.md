# Phase 16 - Prepare API for Public Hosting

## Goal

Make the paid-agent API deployable as a public service while preserving local demo behavior.

Current local API:
- `http://localhost:4000` or `http://localhost:4011`

Target public API:
- `https://YOUR_PUBLIC_API_URL`

## Scope Rules

- Keep architecture: public API + public dashboard + local MCP.
- Do not require buyer private key on hosted API.
- Do not break mock mode or x402 mode.
- Do not introduce remote MCP.

## Required API Behavior

1. Bind to `process.env.PORT`.
2. Allow CORS from dashboard origin.
3. Expose endpoints:
   - `GET /health`
   - `GET /agents`
   - `POST /agents/hackathon-research`
   - `GET /events` (if dashboard relies on it)
4. Support x402 seller mode and mock mode.
5. Use env-driven config only.
6. When `PUBLIC_API_URL` is set, `/agents` should return public endpoint URLs.
7. Work both locally and when deployed.

## Required Environment (Hosted API)

```env
TOLLGATE_PAYMENT_MODE=x402
PORT=4000
PUBLIC_API_URL=https://YOUR_PUBLIC_API_URL
SELLER_WALLET_ADDRESS=0xYOUR_SELLER_PUBLIC_ADDRESS
PRICE_USD=0.003
X402_NETWORK=eip155:84532
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_VERSION=2
SELLER_AGENT_ID=hackathon-research-agent
SELLER_DISPLAY_NAME=Hackathon Research Agent
DASHBOARD_ORIGIN=https://YOUR_DASHBOARD_URL
```

Important:
- Hosted API does **not** need buyer private key.
- Buyer private key remains in local MCP only.

## Implementation Tasks

- Add/verify CORS config for dashboard origin.
- Add/verify `PORT` handling.
- Add/verify `PUBLIC_API_URL` usage for returned agent endpoints.
- Add `.env.public-api.example`.
- Add `docs/public-api-deploy.md`.
- Ensure health endpoint exists and is documented.
- Add quick deploy notes (Render/Railway/Fly.io).

## Checklist

- [ ] API starts locally using env vars
- [ ] `GET /health` returns 200
- [ ] `GET /agents` returns public-ready entries when `PUBLIC_API_URL` is set
- [ ] Unpaid `POST /agents/hackathon-research` returns 402
- [ ] x402 mode still works locally
- [ ] mock mode still works locally
- [ ] API does not require buyer private key
- [ ] `.env` files are not committed
