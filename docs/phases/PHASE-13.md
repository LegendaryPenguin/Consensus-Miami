# Phase 13 - Clean Product Dashboard

## Goal

Redesign the dashboard into a clear product demo shell with exactly four primary sections.

## Required Story

Cursor Agent buys specialist help from Hackathon Research Agent using x402.

## Tasks

1. Restructure dashboard layout into four sections only:
   - Marketplace
   - Live Transaction Timeline
   - Receipt
   - Final Answer
2. Build marketplace cards:
   - Hackathon Research Agent — `$0.003/call` — Live
   - Pitch Agent — `$0.002/call` — Demo
   - Code Review Agent — `$0.005/call` — Demo
   - Wallet Risk Agent — `$0.004/call` — Demo
   - Only Hackathon Research Agent is live/clickable.
3. Make timeline the visual centerpiece:
   - Include states:
     - Waiting for Cursor request
     - Cursor Agent connected
     - Paid agent selected
     - 402 Payment Required
     - x402 payment submitted
     - Payment verified
     - Access unlocked
     - Result returned to Cursor
4. Ensure receipt panel displays:
   - Buyer, Seller, Price, Network, Payment Mode, Status, Receipt ID, Timestamp
   - Shortened buyer/seller wallet addresses
5. Ensure final answer panel mirrors Cursor answer content.
6. Apply product-level polish:
   - Dark theme, high readability, clear status colors, smooth transitions.
   - Keep text visible during flow:
     - "402 Payment Required"
     - "x402 Payment Verified"
7. Regression guard:
   - Do not change backend payment logic except event shape if required.
   - Confirm Phase 12 real flow still works after UI updates.

## Checklist

- [ ] Dashboard has exactly four main sections
- [ ] Marketplace cards render correctly
- [ ] Hackathon Research Agent is marked Live
- [ ] Other agents are marked Demo or Coming Soon
- [ ] Live Transaction Timeline is the centerpiece
- [ ] Timeline updates from real backend/MCP events
- [ ] Receipt panel displays real x402 receipt
- [ ] Final Answer panel displays the paid-agent answer
- [ ] UI is understandable to a non-technical judge
- [ ] Dashboard still supports simulated/fallback demo if already implemented
- [ ] Phase 12 real flow still works after dashboard changes

## Pass Condition

The dashboard now clearly presents TollGate Bazaar as a paid-agent marketplace for Cursor-style agents.
