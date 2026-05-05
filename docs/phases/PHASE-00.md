# Phase 0 - Docs + Project Setup

## Goal

Load official CDP/x402 context before writing implementation code.

## Why This Phase Exists

Prevent API drift and guessing. Use Coinbase docs/skills as source of truth.

## Commands

1. `npx skills add https://docs.cdp.coinbase.com`
2. `mkdir -p docs`
3. `curl -L https://docs.cdp.coinbase.com/llms-full.txt -o docs/cdp-llms-full.txt`

## Tasks

- Install CDP skill.
- Download full CDP LLM reference to `docs/cdp-llms-full.txt`.
- Read CDP skill + x402 sections before coding.
- Create `docs/x402-implementation-notes.md` including:
  - buyer flow
  - seller flow
  - testnet network
  - facilitator choice
  - required env vars
  - exact packages to install

## Deliverables

- `docs/cdp-llms-full.txt`
- `docs/x402-implementation-notes.md`

## Checklist

- [ ] `npx skills add https://docs.cdp.coinbase.com` completes
- [ ] `docs/cdp-llms-full.txt` exists
- [ ] Can answer: "What is the x402 buyer flow?"
- [ ] Can answer: "What is the x402 seller/paywall flow?"
- [ ] `docs/x402-implementation-notes.md` exists

## Exit Criteria

The team has an internal, docs-backed x402 implementation reference and can proceed without guessing.
