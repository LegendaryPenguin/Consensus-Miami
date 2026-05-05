# Phase 6 - Connect to Cursor

## Goal

Run the real demo loop from Cursor prompt through TollGate MCP.

## Cursor MCP Config Template

```json
{
  "mcpServers": {
    "tollgate-bazaar": {
      "command": "node",
      "args": ["apps/mcp-server/dist/index.js"],
      "env": {
        "TOLLGATE_API_URL": "http://localhost:4000",
        "TOLLGATE_PAYMENT_MODE": "mock"
      }
    }
  }
}
```

## Demo Prompt

Use TollGate Bazaar.

First list the available paid agents.
Then choose the best agent to answer this question:
"What is the strongest Coinbase x AWS x402 hackathon project we can build quickly?"

Call the paid agent, pay if required, and return the result with the payment receipt.

## Checklist

- [ ] Cursor detects `tollgate-bazaar`
- [ ] Cursor can call `tollgate_list_agents`
- [ ] Cursor can call `tollgate_call_paid_agent`
- [ ] Cursor result includes paid specialist answer
- [ ] Dashboard updates live during call
- [ ] Team can explain flow in under 30 seconds

## Exit Criteria

Primary demo flow works from within Cursor.
