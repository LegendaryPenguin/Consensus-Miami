# Phase 19 - Test Public Access From a Different Cursor Project

## Goal

Prove TollGate Bazaar works from a separate Cursor project and is no longer tied to this repo as the active workspace.

## Target Flow

Different Cursor project
-> local TollGate MCP server
-> hosted TollGate API
-> x402 payment
-> paid agent unlock
-> result returned to Cursor

## Requirements

1. API is hosted (or realistically simulated) with public URL.
2. Local MCP server points to public API URL.
3. Run from a different Cursor project.
4. Add TollGate MCP config in that project.
5. Run demo prompt.
6. Confirm paid call succeeds and receipt returns.
7. Confirm dashboard shows transaction if event logging is enabled.

## Testing Prompt

Use TollGate Bazaar.

List the available paid agents.
Choose the Hackathon Research Agent.
Ask it:
"What is the strongest Coinbase x AWS x402 hackathon project we should build?"

Pay if required using x402 and return:
1. the paid agent answer
2. the payment receipt
3. why x402 was necessary.

## Checklist

- [ ] API is accessible from a public URL
- [ ] Dashboard is accessible from a public URL
- [ ] Cursor in a different project sees TollGate MCP tools
- [ ] `tollgate_list_agents` uses public API
- [ ] `tollgate_call_paid_agent` uses public API
- [ ] x402 payment succeeds
- [ ] Result returns to Cursor
- [ ] Receipt shows `paymentMode=x402`
- [ ] Receipt shows `network=eip155:84532`
- [ ] Buyer testnet USDC decreases by 0.003
- [ ] Buyer private key is never sent to public API/dashboard

## Exit Rule

Do not mark public access complete until:
- API works from public URL
- dashboard works from public URL
- Cursor in a different project can call TollGate through local MCP using the public API
