# Public Access Test (Different Cursor Project)

Use this to prove TollGate Bazaar works outside its own repo context.

## Prerequisites

- Hosted API URL (`https://YOUR_PUBLIC_API_URL`) is live.
- Hosted dashboard URL (`https://YOUR_DASHBOARD_URL`) is live.
- Local buyer wallet has Base Sepolia ETH + test USDC.

## Steps

1. Open a different Cursor project (not this repo).
2. Add TollGate MCP config in that project, pointing `TOLLGATE_API_URL` to hosted API.
3. Restart Cursor.
4. Run demo prompt from `docs/demo-prompt.md`.
5. Confirm:
   - `tollgate_list_agents` succeeds
   - `tollgate_call_paid_agent` succeeds
   - receipt has `paymentMode: x402`, `network: eip155:84532`
6. Open hosted dashboard and verify timeline/receipt visibility if event logging is enabled.

## CLI fallback verification

Run from this repo with the public API URL:

```bash
TOLLGATE_API_URL=https://YOUR_PUBLIC_API_URL pnpm phase19:public-check
```

Expected:

- list call passes
- paid call returns success
- receipt validates x402 + Base Sepolia network.

## Security check

- Buyer private key remains only in local MCP env/config.
- Public API and public dashboard never receive or store the buyer private key.
