# Phase 5 - MCP Server (Mock Payment Mode)

## Goal

Enable end-to-end Cursor tool flow with mock 402 negotiation.

## MCP Tools

1. `tollgate_list_agents`
   - input: none
   - output: registry list
2. `tollgate_call_paid_agent`
   - input:
     - `agentId`
     - `question`
     - `paymentMode: "mock" | "x402"`
   - output:
     - `answer`
     - `receipt`
     - `events`
3. `tollgate_get_latest_receipt`
   - input: none
   - output: latest receipt

## Tool Flow (Mock Mode)

1. Read registry.
2. Resolve selected agent.
3. POST without payment header.
4. Confirm `402`.
5. Retry with `X-Mock-Payment: paid`.
6. Return unlocked result to MCP client.
7. Publish timeline events for dashboard.

## Documentation

- Add `docs/cursor-setup.md` with MCP server configuration instructions.

## Checklist

- [ ] MCP server starts
- [ ] MCP inspector/Cursor sees tools
- [ ] `tollgate_list_agents` returns registry
- [ ] `tollgate_call_paid_agent` triggers 402 then retry
- [ ] Cursor receives final answer
- [ ] Dashboard updates during MCP call

## Exit Criteria

Cursor can invoke TollGate tools and complete mock payment flow.
