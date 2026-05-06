# TollGate Bazaar - Master Checklist

Use this as the top-level progress tracker. Detailed tasks live in each phase file.

## Phase Completion Tracker

- [ ] Phase 0 - Docs + project setup complete
- [ ] Phase 1 - Monorepo scaffold complete
- [ ] Phase 2 - Marketplace registry complete
- [ ] Phase 3 - Dashboard mock flow complete
- [ ] Phase 4 - Paid agent API mock 402 complete
- [ ] Phase 5 - MCP server mock payment complete
- [ ] Phase 6 - Cursor integration complete
- [ ] Phase 7 - Real x402 seller complete
- [ ] Phase 8 - Real x402 buyer complete
- [ ] Phase 9 - Dashboard fallback payment complete
- [ ] Phase 10 - MCPay reference notes complete
- [ ] Phase 11 - Demo polish complete
- [ ] Phase 12 - One real x402 flow is stable (5/5 runs)
- [ ] Phase 13 - Dashboard product shell complete (4 sections)
- [ ] Phase 14 - Demo controls and reliability layer complete
- [ ] Phase 15 - Final script + regression sweep complete

## MVP Acceptance

### Minimum Acceptable MVP

- [ ] Cursor -> TollGate MCP -> paid agent -> mock 402 -> mock payment retry -> result
- [ ] Dashboard visualizes the flow
- [ ] x402 testnet integration at least partially working or shown via dashboard path

### Ideal MVP

- [ ] Cursor -> TollGate MCP -> paid agent -> real x402 testnet 402 -> payment -> verified -> result
- [ ] Dashboard visualizes transaction live
- [ ] Fallback dashboard payment button path works
- [ ] One real x402 flow passes 5 consecutive runs

## Safety and Security

- [ ] No mainnet keys used
- [ ] No secrets committed
- [ ] `.env.example` present
- [ ] `.env` ignored
- [ ] Testnet-only configuration documented
- [ ] No private keys logged in terminal/app output
