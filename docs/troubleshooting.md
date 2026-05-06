# Troubleshooting

## Cursor does not see MCP tools

1. Verify `mcp.json` matches `docs/cursor-setup.md`.
2. Confirm `cwd` points to this repo root.
3. Reload Cursor MCP servers or restart Cursor.
4. Confirm MCP command works manually:
   - `pnpm dev:mcp`

## API is not running

1. Start API:
   - `pnpm dev:api`
2. Check health:
   - `curl.exe -s http://localhost:4000/health`
3. If port conflict, stop the existing process or switch `PORT`.

## Dashboard does not update

1. Confirm API events endpoint is reachable:
   - `curl.exe -s http://localhost:4000/events`
2. Set `NEXT_PUBLIC_TOLLGATE_API_URL` correctly in `.env`.
3. Restart dashboard after env changes.

## x402 payment fails

1. Confirm API uses seller mode:
   - `PAYMENT_MODE=x402`
2. Confirm valid seller wallet:
   - `SELLER_WALLET_ADDRESS=<real Base Sepolia address>`
3. Confirm MCP has buyer key:
   - `BUYER_WALLET_PRIVATE_KEY=<testnet key>`
4. Confirm facilitator + network:
   - `X402_NETWORK=eip155:84532`
   - `X402_FACILITATOR_URL=https://x402.org/facilitator`

## Buyer wallet lacks USDC

1. Fund Base Sepolia USDC to the buyer wallet.
2. Re-run a balance check before demo.

## Buyer wallet lacks Base Sepolia ETH

1. Fund Base Sepolia ETH for gas.
2. Retry x402 paid flow.

## Wrong payment mode

1. API seller mode:
   - `PAYMENT_MODE=mock|x402`
2. MCP default mode:
   - `TOLLGATE_PAYMENT_MODE=mock|x402`
3. Dashboard fallback mode is selected by the clicked control.

## Private key env missing

Symptoms:
- x402 buyer flow errors with missing buyer key.

Fix:
1. Set `BUYER_WALLET_PRIVATE_KEY` in `.env`.
2. Restart MCP/dashboard API routes after env changes.

## Facilitator/network mismatch

1. Keep all components aligned:
   - `X402_NETWORK=eip155:84532`
   - `X402_FACILITATOR_URL=https://x402.org/facilitator`
2. Restart API + MCP after updates.
