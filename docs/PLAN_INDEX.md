# TollGate Bazaar - Master Execution Plan

This plan decomposes your full prompt into independent, executable phases so we can run them one by one in chat.

## How To Use This Pack

1. Pick the next phase file in order.
2. Execute only that phase.
3. Validate using the phase checklist.
4. Commit (optional) and continue.

## Principles

- Build locally first. No AWS in MVP.
- Use official CDP/x402 docs as source of truth.
- Do not guess APIs/network/facilitator/package names.
- Keep `mock` mode alive as fallback for reliability.
- Demo-first: working flow beats perfect architecture.

## Phase Order

0. `docs/phases/PHASE-00.md` - Docs + project setup
1. `docs/phases/PHASE-01.md` - Monorepo scaffold
2. `docs/phases/PHASE-02.md` - Marketplace registry
3. `docs/phases/PHASE-03.md` - Beautiful dashboard first
4. `docs/phases/PHASE-04.md` - Paid agent API with simulated 402
5. `docs/phases/PHASE-05.md` - MCP server with mock payment
6. `docs/phases/PHASE-06.md` - Connect to Cursor
7. `docs/phases/PHASE-07.md` - Real x402 seller integration
8. `docs/phases/PHASE-08.md` - Real x402 buyer integration
9. `docs/phases/PHASE-09.md` - Optional dashboard fallback payment
10. `docs/phases/PHASE-10.md` - MCPay reference reuse notes
11. `docs/phases/PHASE-11.md` - Demo polish and final packaging
12. `docs/phases/PHASE-12.md` - Bulletproof one real flow
13. `docs/phases/PHASE-13.md` - Clean product dashboard
14. `docs/phases/PHASE-14.md` - Demo controls and reliability layer
15. `docs/phases/PHASE-15.md` - Final demo script and regression sweep
16. `docs/phases/PHASE-16.md` - Prepare API for public hosting
17. `docs/phases/PHASE-17.md` - Prepare dashboard for public hosting
18. `docs/phases/PHASE-18.md` - Add Connect to Cursor page
19. `docs/phases/PHASE-19.md` - Public-access test from different Cursor project

## Global Deliverables

- TypeScript monorepo with:
  - `apps/dashboard`
  - `apps/paid-agent-api`
  - `apps/mcp-server`
  - `packages/shared`
- Docs for setup, architecture, demo script, and MCP config.
- Cursor MCP tools:
  - `tollgate_list_agents`
  - `tollgate_call_paid_agent`
  - `tollgate_get_latest_receipt`

## Reliability Gate (Always True)

Before/after every phase, this statement must remain true:

1. Cursor calls TollGate.
2. TollGate discovers a paid specialist agent.
3. The specialist agent requires payment.
4. Payment is completed or simulated.
5. The result returns to Cursor.
6. Dashboard shows the whole flow.

## Final Instruction (Keep verbatim)

Optimize for demo reliability.

If real x402 integration gets blocked, preserve mock mode and keep the UI + Cursor MCP flow working. The demo must always be able to show:
1. Cursor calls TollGate.
2. TollGate discovers a paid specialist agent.
3. The specialist agent requires payment.
4. Payment is completed or simulated.
5. The result returns to Cursor.
6. Dashboard shows the whole flow.

Then continue working on real x402 testnet payment as the highest-priority enhancement.
