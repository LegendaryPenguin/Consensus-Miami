# TollGate Bazaar Build Plan Pack

This repository contains a phase-by-phase execution plan and an implemented MVP through Phases 1-7.

Start here:

- `docs/PLAN_INDEX.md` - master roadmap and execution order
- `docs/phases/PHASE-00.md` ... `docs/phases/PHASE-11.md` - detailed phase plans
- `docs/checklists/MASTER_CHECKLIST.md` - consolidated checklist across all phases

Quickstart:

1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm dev:api`
5. `pnpm dev:mcp`
6. `pnpm dev:dashboard`

Execution model:

1. Complete one phase at a time.
2. Run that phase's checklist before moving to the next.
3. Keep mock mode working at all times.
4. Prioritize demo reliability over complexity.
