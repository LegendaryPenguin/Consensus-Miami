# Public API Deploy Guide

This guide deploys `apps/paid-agent-api` as a public seller-side x402 API.

## Goal

Expose:

- `GET /health`
- `GET /agents`
- `POST /agents/hackathon-research`
- `GET /events`

without storing buyer private keys on the server.

## Required environment

Use values from `.env.public-api.example`:

- `PAYMENT_MODE=x402`
- `PORT=4000`
- `PUBLIC_API_URL=https://YOUR_PUBLIC_API_URL`
- `DASHBOARD_ORIGIN=https://YOUR_DASHBOARD_URL`
- `SELLER_WALLET_ADDRESS=...`
- `PRICE_USD=0.003`
- `X402_NETWORK=eip155:84532`
- `X402_FACILITATOR_URL=https://x402.org/facilitator`
- `X402_VERSION=2`

Do not set `BUYER_WALLET_PRIVATE_KEY` on hosted API.

## Local preflight before deploy

```bash
pnpm typecheck
pnpm --filter @tollgate/paid-agent-api build
```

## Runtime command

```bash
pnpm --filter @tollgate/paid-agent-api start
```

## Render / Railway / Fly.io notes

- **Render**: set root to repo, build command `pnpm install && pnpm --filter @tollgate/paid-agent-api build`, start command above.
- **Railway**: same build/start commands; define all env vars in Railway service settings.
- **Fly.io**: build image from repo, run the same start command, expose `PORT`.

## Post-deploy checks

```bash
curl -s https://YOUR_PUBLIC_API_URL/health
curl -s https://YOUR_PUBLIC_API_URL/agents
curl -i -X POST "https://YOUR_PUBLIC_API_URL/agents/hackathon-research" -H "Content-Type: application/json" --data "{\"question\":\"what should we build?\"}"
```

Expected:

- `/health` returns `200` and `publicApiUrl`.
- `/agents` endpoints point to `https://YOUR_PUBLIC_API_URL/...`.
- unpaid paid-agent call returns `402 Payment Required`.
