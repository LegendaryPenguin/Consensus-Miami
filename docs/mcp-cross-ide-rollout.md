# TollGate MCP: Cursor, Kiro, and other machines

This repo’s MCP server (`apps/mcp-server`) is **stdio-based**. Each developer machine runs it locally; it calls your **hosted** `paid-agent-api` over HTTPS.

## What you deploy publicly

- **Seller API only**: `apps/paid-agent-api` at `https://YOUR_PUBLIC_API_URL` (see [public-api-deploy.md](./public-api-deploy.md)).
- **Do not** put `BUYER_WALLET_PRIVATE_KEY` on the hosted API.

## Per-machine configuration

### Environment variables (MCP process)

| Variable | Example | Notes |
| --- | --- | --- |
| `TOLLGATE_API_URL` | `https://YOUR_PUBLIC_API_URL` | Must be HTTPS in production. |
| `TOLLGATE_PAYMENT_MODE` | `x402` or `mock` | Defaults to `mock` if unset. |
| `BUYER_WALLET_PRIVATE_KEY` | `0x…` | **Local only.** Required for real `x402` buyer signing. |

Optional (buyer tooling also reads these):

- `X402_NETWORK` (default `eip155:84532`)
- `X402_FACILITATOR_URL` (default `https://x402.org/facilitator`)

### Cursor

Configure the MCP server in Cursor settings with the command that runs `pnpm --filter @tollgate/mcp-server dev` (or `start` after build) from this repo, and inject the env vars above.

### Amazon Kiro

Kiro supports MCP. Add a server entry per [Kiro MCP configuration](https://kiro.dev/docs/mcp/configuration) (workspace or user `mcp.json`) that runs the same command as Cursor, with the same environment variables pointing at your **public** API URL.

## Hosted dashboard vs real x402 signing

The public dashboard ([public-dashboard-deploy.md](./public-dashboard-deploy.md)) is safe to expose without buyer keys.

Real `x402` signing from a **hosted** Next.js `/api/fallback` route would require putting a buyer private key on the server, which is **not recommended** for a public site. Prefer:

- **Hosted dashboard**: browse status, marketplace, docs links.
- **IDE MCP (local)**: `tollgate_call_paid_agent` with local `BUYER_WALLET_PRIVATE_KEY`.

## Smoke checklist (any new machine)

1. `curl -s https://YOUR_PUBLIC_API_URL/health` returns `paymentMode` you expect.
2. MCP tool `tollgate_list_agents` returns JSON.
3. `tollgate_call_paid_agent` with `paymentMode: "x402"` returns an answer and receipt when buyer key is set.
