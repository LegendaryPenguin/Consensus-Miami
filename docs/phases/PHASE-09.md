# Phase 9 - Optional Dashboard Fallback Payment

## Goal

Add a backup demo path that can run payment/unlock flow without Cursor.

## Why

Ensures judge-safe demo even if MCP/Cursor integration is unstable onsite.

## Tasks

- Add dashboard buttons:
  - `Call Paid Agent`
  - `Pay with x402 Testnet`
- Show 402 response details in UI.
- Execute buyer-side x402 request via local backend route.
- Unlock and display paid result + receipt.
- Reuse same buyer logic as MCP server (shared module).

## Suggested Shared Module

- `packages/shared/buyerClient.ts` (or equivalent shared service package)

## Checklist

- [ ] Dashboard button triggers mock payment flow
- [ ] Dashboard button triggers x402 flow
- [ ] Receipt schema matches MCP receipt schema
- [ ] Works without Cursor
- [ ] Cursor path still works unchanged

## Exit Criteria

Two reliable demo paths exist: primary (Cursor) and backup (Dashboard direct).
