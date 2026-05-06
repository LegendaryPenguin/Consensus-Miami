# Public Dashboard Deploy Guide (Vercel)

Deploy `apps/dashboard` as a public frontend that points to your hosted TollGate API.

## Required environment

Set these in Vercel project settings:

```env
NEXT_PUBLIC_TOLLGATE_API_URL=https://YOUR_PUBLIC_API_URL
NEXT_PUBLIC_PAYMENT_MODE=x402
TOLLGATE_PAID_API_URL=https://YOUR_PUBLIC_API_URL
TOLLGATE_MOCK_API_URL=http://localhost:4000
NEXT_PUBLIC_BUYER_WALLET_ADDRESS=0xYourBaseSepoliaBuyerAddress
NEXT_PUBLIC_SELLER_WALLET_ADDRESS=0xYourBaseSepoliaSellerAddress
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

Notes:

- `NEXT_PUBLIC_TOLLGATE_API_URL` is safe to expose (public endpoint).
- Never set buyer private keys in dashboard env.
- Transaction History now reads on-chain USDC `Transfer` logs for `buyer -> seller` and shows timestamp + tx hash.
- Optional: set `TX_HISTORY_START_BLOCK` to limit scan range and speed up history queries.

## Deploy steps

1. Import this repo into Vercel.
2. Set the Vercel project **Root Directory** to `apps/dashboard` (so `apps/dashboard/vercel.json` is picked up).
3. Add the env vars above (see also optional balance vars below).
4. Deploy.

This repo ships [`apps/dashboard/vercel.json`](../apps/dashboard/vercel.json) so Vercel installs from the monorepo root and builds `@tollgate/shared` before the dashboard.

### Optional: USDC balance proof fields on `/api/fallback`

If you want `buyerUsdcBalanceBefore` / `buyerUsdcBalanceAfter` populated for hosted x402 calls, set **server-only**:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BUYER_WALLET_PRIVATE_KEY=0x…
```

**Security note:** putting `BUYER_WALLET_PRIVATE_KEY` on Vercel enables custodial signing from `/api/fallback`. For a public dashboard, prefer **MCP on each machine** with a local buyer key instead (see [mcp-cross-ide-rollout.md](./mcp-cross-ide-rollout.md)).

## Post-deploy checks

1. Open `https://YOUR_DASHBOARD_URL`.
2. Confirm "Public API URL" indicator matches your hosted API.
3. Confirm marketplace cards load from API (`GET /agents`).
4. Confirm health indicator reflects API status.
5. Run mock and x402 fallback buttons and verify receipt/timeline updates.
