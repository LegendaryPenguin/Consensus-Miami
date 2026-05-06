# Phase 14 - Demo Controls and Reliability Layer

## Goal

Add safe demo controls and reliability indicators so live demos can recover quickly from glitches.

## Tasks

1. Add dashboard control actions:
   - Reset Demo
   - Run Simulated Demo
   - Run Mock Demo
   - Run Real x402 Demo
2. Define Reset Demo behavior:
   - Clears active timeline, receipt, and final answer state.
   - Does not delete durable logs unless user explicitly confirms.
3. Implement mode handling:
   - Visible mode indicator for `simulated`, `mock`, `x402`.
4. Add health/status indicators:
   - API status
   - MCP status (if detectable)
   - Dashboard event connection status
   - Payment mode
   - Buyer wallet (shortened)
   - Seller wallet (shortened)
5. Add "Copy Cursor Demo Prompt" button:
   - Source text from `docs/demo-prompt.md`.
6. Security and architecture constraints:
   - Real x402 path must execute server-side.
   - Never expose `BUYER_WALLET_PRIVATE_KEY` in browser code.
7. Regression guard:
   - Keep mock mode working.
   - Keep real Cursor/MCP flow working.
   - Keep dashboard fallback path usable.

## Checklist

- [ ] Reset Demo button works
- [ ] Run Simulated Demo button works
- [ ] Run Mock Demo button works
- [ ] Run Real x402 Demo button works, if backend support exists
- [ ] Real x402 demo does not expose private key client-side
- [ ] Mode indicator is visible
- [ ] API health status is visible
- [ ] Payment mode is visible
- [ ] Buyer/seller wallet addresses are shortened
- [ ] Copy Cursor Demo Prompt button works
- [ ] Cursor/MCP real x402 flow still works
- [ ] Dashboard fallback can be used if Cursor fails

## Pass Condition

The demo is now safe: simulated, mock, and real x402 flows can be shown from the dashboard, while the Cursor demo still works live.
