# Phase 2 - Marketplace Registry

## Goal

Create a machine-readable marketplace of paid specialist agents.

## Tasks

- Add shared registry in `packages/shared`.
- Add core types:
  - `PaidAgent`
  - `TollGateEvent`
  - `PaymentReceipt`
  - `AgentCallRequest`
  - `AgentCallResponse`
- Add helpers:
  - `listAgents()`
  - `getAgentById(id)`
  - `createEvent()`
  - `createReceipt()`
- Mark only `hackathon-research-agent` as real.
- Keep additional agents simulated for UI polish.

## Suggested Initial Registry

- `hackathon-research-agent` (real = true)
- `pitch-agent` (real = false)
- `code-review-agent` (real = false)

## Deliverables

- Shared registry module and shared type package
- Shared imports wired in API/MCP/dashboard

## Checklist

- [ ] Registry exports from `packages/shared`
- [ ] API imports registry
- [ ] MCP server imports registry
- [ ] Dashboard displays registry cards
- [ ] Simulated agents are marked in internal data

## Exit Criteria

All components consume a single source of truth for market data.
