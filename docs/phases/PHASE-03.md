# Phase 3 - Dashboard First (Mocked Flow)

## Goal

Ship a visually strong, understandable demo before backend payment integration.

## UI Panels

1. Cursor Agent Panel
2. Tool Marketplace
3. Agent Graph (Cursor -> TollGate MCP -> Paid Research Agent)
4. x402 Payment Timeline
5. Receipt Panel
6. Final Result Panel

## Tasks

- Build dashboard with Next.js + Tailwind + Framer Motion.
- Add dark futuristic styling and card glow effects.
- Add payment beam animation between components.
- Use mock events from `packages/shared`.
- Add `Run Simulated Demo` button with sequence:
  - request -> lookup -> 402 -> payment sent -> verified -> unlocked -> returned

## Deliverables

- Animated UI that tells end-to-end story without backend dependencies

## Checklist

- [ ] Dashboard looks impressive without backend
- [ ] `Run Simulated Demo` animates full story
- [ ] Marketplace cards render
- [ ] Timeline order is correct
- [ ] Receipt panel updates
- [ ] Final result panel updates
- [ ] Non-technical judge can follow the story

## Exit Criteria

Demo has high visual confidence even if x402 work is still in progress.
