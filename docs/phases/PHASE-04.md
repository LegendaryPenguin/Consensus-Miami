# Phase 4 - Paid Agent API (Simulated 402)

## Goal

Implement seller endpoint behavior with a deterministic mock payment gate.

## Required Routes

1. `GET /health`
2. `GET /agents`
3. `POST /agents/hackathon-research`
4. `GET /events`
5. `POST /events`

## Mock Payment Behavior

- Without `X-Mock-Payment: paid`:
  - return `HTTP 402 Payment Required`
  - include metadata:
    - `agentId`
    - `price`
    - `network` (placeholder)
    - `payTo` (placeholder)
    - message
- With `X-Mock-Payment: paid`:
  - return `HTTP 200`
  - include paid specialist answer

## Event Logging Requirements

- `request_received`
- `payment_required`
- `mock_payment_detected`
- `access_unlocked`
- `result_returned`

## Checklist

- [ ] `curl http://localhost:4000/health` returns OK
- [ ] POST without payment header returns 402
- [ ] POST with `X-Mock-Payment: paid` returns 200
- [ ] Events are logged
- [ ] Dashboard can display API events

## Exit Criteria

A working local paywall simulation exists and is observable by dashboard.
