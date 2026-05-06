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
- [ ] Phase 16 - Public API hosting prep complete
- [ ] Phase 17 - Public dashboard hosting prep complete
- [ ] Phase 18 - Connect to Cursor page complete
- [ ] Phase 19 - Public access verified from different Cursor project

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

## Public-Access Expansion (Phases 16-19)

### Architecture Guardrails

- [ ] Public API + public dashboard + local MCP pattern documented
- [ ] Remote MCP is not introduced in this scope
- [ ] Buyer private key remains local only
- [ ] No buyer private key is exposed to browser code
- [ ] Mock mode remains functional
- [ ] x402 mode remains functional

### Local Regression Must Still Pass

- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Local API health check works
- [ ] Local dashboard works
- [ ] Local MCP flow still works

### Public API Checks

- [ ] `GET https://YOUR_PUBLIC_API_URL/health` returns 200
- [ ] `GET https://YOUR_PUBLIC_API_URL/agents` returns agents
- [ ] unpaid `POST /agents/hackathon-research` returns 402
- [ ] real x402 paid call returns 200 after payment

### Public Dashboard Checks

- [ ] Dashboard loads at public URL
- [ ] Dashboard reads public API env URL
- [ ] Marketplace loads from public API
- [ ] Connect to Cursor page works
- [ ] Copy buttons work
- [ ] No private key appears in client/dashboard source

### External Cursor Checks

- [ ] Different Cursor project can see TollGate MCP tools
- [ ] `tollgate_list_agents` uses public API
- [ ] `tollgate_call_paid_agent` uses public API
- [ ] x402 payment succeeds
- [ ] Cursor receives answer + receipt
- [ ] Receipt shows `paymentMode=x402` and `network=eip155:84532`
- [ ] Buyer testnet USDC decreases by 0.003
