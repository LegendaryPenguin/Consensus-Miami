# Phase 12 - Bulletproof One Real Flow

## Goal

Make one complete real demo flow work reliably 5 times in a row:

Cursor -> MCP -> x402 payment -> Hackathon Research Agent -> dashboard receipt.

## Scope Guardrails

- Do not add more agents.
- Do not add AWS.
- Do not change the core architecture.
- Do not break mock mode.
- Do not expose private keys.

## Tasks

1. Add stable demo prompt doc:
   - Create `docs/demo-prompt.md` with the exact production-safe Cursor prompt.
2. Normalize event taxonomy across MCP/API/dashboard:
   - Ensure the following events are emitted in order where applicable:
     - `cursor_request_received`
     - `marketplace_listed`
     - `agent_selected`
     - `unpaid_request_sent`
     - `payment_required_402`
     - `x402_payment_submitted`
     - `payment_verified`
     - `access_unlocked`
     - `result_returned`
     - `receipt_created`
3. Harden the real x402 call path:
   - Ensure agent call always targets runtime API base URL.
   - Ensure `PAYMENT-REQUIRED` parsing is resilient to header casing.
   - Ensure retries surface clear errors and do not silently fail.
4. Verify dashboard integration:
   - Timeline updates during real call.
   - Receipt panel is populated from real call data.
5. Execute reliability run:
   - Run complete real flow 5 consecutive times.
   - If any run fails, fix root cause and restart the 5-run sequence.
6. Validate safety:
   - Confirm private keys are never logged.
   - Confirm no private keys are committed.

## Checklist

- [ ] Stable demo prompt exists in `docs/demo-prompt.md`
- [ ] Cursor detects TollGate MCP tools
- [ ] `tollgate_list_agents` works
- [ ] `tollgate_call_paid_agent` works
- [ ] x402 payment succeeds
- [ ] Result returns to Cursor
- [ ] Dashboard timeline updates during the call
- [ ] Receipt appears in dashboard
- [ ] Buyer balance decreases by 0.003 USDC per call
- [ ] The flow works 5 times in a row
- [ ] Mock mode still works
- [ ] No private keys are logged
- [ ] No private keys are committed

## Pass Condition

The real Cursor/MCP/x402 paid-agent flow is stable and repeatable.
