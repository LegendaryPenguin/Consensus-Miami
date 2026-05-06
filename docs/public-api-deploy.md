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

For **IDE-integrated** paid calls from Cursor/Kiro/etc., use MCP on each machine instead: [mcp-cross-ide-rollout.md](./mcp-cross-ide-rollout.md).

## Local preflight before deploy

```bash
pnpm typecheck
pnpm --filter @tollgate/paid-agent-api build
```

## Runtime command

```bash
pnpm --filter @tollgate/paid-agent-api start
```

## Docker (recommended for Render / Fly / any container host)

From the **repository root**:

```bash
docker build -f apps/paid-agent-api/Dockerfile -t tollgate-paid-agent-api .
docker run --rm -p 4000:4000 --env-file .env.public-api.example tollgate-paid-agent-api
```

The image runs `node apps/paid-agent-api/dist/index.js` after building `@tollgate/shared` and `@tollgate/paid-agent-api`.

## Render (Blueprint)

This repo includes [`render.yaml`](../render.yaml) at the monorepo root. In Render, create a **Blueprint** from the repo and set the **secret** environment variables in the Render dashboard (`SELLER_WALLET_ADDRESS`, `PUBLIC_API_URL`, `DASHBOARD_ORIGIN`, `PAYMENT_MODE`, `X402_*`, etc.) per `.env.public-api.example`.

## Railway

1. New service → **Deploy from Dockerfile** (or empty service + Dockerfile path `apps/paid-agent-api/Dockerfile`, context `.`).
2. Set the same env vars as Render (from `.env.public-api.example`).
3. Expose port `4000` (or set `PORT` to match Railway’s assigned port and use `PUBLIC_API_URL` accordingly).

## Fly.io

```bash
fly launch --dockerfile apps/paid-agent-api/Dockerfile --copy-config
```

Then set secrets with `fly secrets set ...` matching `.env.public-api.example`.

## Legacy: install on VM without Docker

- Set repo root, build command `pnpm install && pnpm --filter @tollgate/shared build && pnpm --filter @tollgate/paid-agent-api build`, start command `pnpm --filter @tollgate/paid-agent-api start` from repo root (or `node apps/paid-agent-api/dist/index.js` with cwd `apps/paid-agent-api`).

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
