# Phase 15 - Final Demo Script and Regression Sweep

## Goal

Finalize the project for judging with clear docs, repeatable startup, and a full regression sweep.

## Required Deliverables

- `docs/final-demo-script.md`
- `docs/demo-checklist.md`
- `docs/troubleshooting.md`
- `docs/demo-prompt.md`
- `README.md` alignment with actual commands

## Tasks

1. Create/update docs package:
   - Final demo script under 3 minutes.
   - Operator checklist for live presentation.
   - Troubleshooting guide with concrete fixes.
   - Stable Cursor prompt doc.
2. Troubleshooting coverage (must include):
   - Cursor does not see MCP tools
   - API is not running
   - Dashboard does not update
   - x402 payment fails
   - Buyer wallet lacks USDC
   - Buyer wallet lacks Base Sepolia ETH
   - Wrong payment mode
   - Private key env missing
   - Facilitator/network mismatch
3. Run final regression suite:
   - `pnpm typecheck`
   - `pnpm build`
   - API health check
   - Mock unpaid 402 test
   - Mock paid unlock test
   - x402 seller 402 test
   - x402 buyer paid unlock test
   - Cursor/MCP paid-agent flow
   - Dashboard real x402 demo
   - Dashboard reset/simulated demo
   - Secret safety checks (no private keys committed)
4. Produce final launch report:
   - What works
   - What is demo-safe
   - What is still risky
   - Exact pre-judge run commands
   - Exact Cursor prompt to use
5. Fresh terminal proof:
   - Verify demo can be started from documented commands only.

## Checklist

- [ ] `docs/final-demo-script.md` exists
- [ ] `docs/demo-checklist.md` exists
- [ ] `docs/troubleshooting.md` exists
- [ ] README matches actual commands
- [ ] Final demo script is under 3 minutes
- [ ] Stable Cursor prompt is documented
- [ ] All regression tests pass
- [ ] Real x402 buyer unlock test passes
- [ ] Dashboard fallback works
- [ ] No private keys are committed
- [ ] Demo can be run from a fresh terminal using documented commands

## Pass Condition

TollGate Bazaar is launch-ready for live judging with a repeatable demo flow and documented recovery paths.
