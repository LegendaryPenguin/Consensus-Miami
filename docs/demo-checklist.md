# Demo Checklist

## Before judging

- [ ] `pnpm install`
- [ ] `.env` loaded with testnet values only
- [ ] API running in x402 mode (`PAYMENT_MODE=x402`)
- [ ] Dashboard running
- [ ] MCP server configured in Cursor (`docs/cursor-setup.md`)

## Live flow checklist

- [ ] Cursor sees `tollgate-bazaar` tools
- [ ] `tollgate_list_agents` returns marketplace
- [ ] `tollgate_call_paid_agent` returns answer + receipt
- [ ] Timeline shows `402 Payment Required`
- [ ] Timeline shows `x402 Payment Verified`
- [ ] Receipt status is `verified`
- [ ] Buyer USDC decreases by 0.003 for one call

## Fallback safety checklist

- [ ] Reset Demo works
- [ ] Run Simulated Demo works
- [ ] Run Mock Demo works
- [ ] Run Real x402 Demo works
- [ ] Copy Cursor Demo Prompt works
