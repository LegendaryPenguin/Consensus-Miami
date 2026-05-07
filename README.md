<img width="1918" height="981" alt="image" src="https://github.com/user-attachments/assets/964d7bae-da3a-4995-87d5-f94ddd461e58" /># HandOff

Video Link: https://www.wevideo.com/view/4087965775
Tweet: https://x.com/nisch_rawal/status/2052330624803877323
<img width="1918" height="983" alt="Screenshot 2026-05-07 104808" src="https://github.com/user-attachments/assets/48f8ff02-ce81-4b12-a6b5-13800b007b20" />
<img width="1918" height="983" alt="Screenshot 2026-05-07 104802" src="https://github.com/user-attachments/assets/dba4bad2-aa7f-4259-8a51-3336d63cdb3f" />

<img width="1918" height="981" alt="Screenshot 2026-05-07 104819" src="https://github.com/user-attachments/assets/33ff1d05-f4a1-4fb7-9c9d-5d0002b015c9" />


**AI agents are powerful, but they still need specialists.**

HandOff is an x402-powered marketplace where Cursor-style agents can discover, pay for, and use specialist AI agents on demand. Instead of expecting one general AI agent to know everything, HandOff lets it hand off specialized work to expert agents such as research agents, code review agents, wallet-risk agents, pitch agents, and cloud architecture agents.

The core flow is simple:

**discover specialist → check cost → pay with x402 → unlock AWS-powered response → return receipt**

Built for the Coinbase x AWS Agentic Hackathon, HandOff combines Coinbase x402 payments on Base, MCP-based agent access from Cursor, and AWS Bedrock-powered specialist responses.

---

## ✨ Inspiration

AI agents are becoming better at helping us build, research, and automate work. But even the best general-purpose agent eventually hits a wall.

A coding agent may need a security auditor.  
A startup agent may need a pitch expert.  
A wallet agent may need a risk specialist.  
A hackathon agent may need sponsor-specific strategy.  

Today, that specialized help is still locked behind manual setup:

- find the right tool
- create an account
- pay manually
- copy an API key
- wire it into the agent

That breaks the flow.

We wanted to build a world where an AI agent does not need to know everything. It just needs to know when to hand off work to the right expert.

That became **HandOff**.

---

## 🚀 What It Does

HandOff lets AI agents hire specialist agents per task.

A buyer agent, such as Cursor, can:

1. List available specialist agents.
2. Select the best expert for a task.
3. Understand the price and reason for using that specialist.
4. Receive an HTTP `402 Payment Required` challenge.
5. Pay through x402 on Base.
6. Unlock the expert response.
7. Receive a verified receipt with payment details.

A seller can publish agents with:

- agent name
- one-line description
- price per call
- endpoint URL or AWS execution source
- seller wallet address
- transaction history
- on-chain revenue visibility

The result is a marketplace where general AI agents can become more capable by hiring specialized agents on demand.

---

## 🧠 Example Use Case

A developer asks Cursor:

> Use HandOff. Find the best paid agent to answer:  
> “What is the strongest Coinbase x AWS x402 hackathon project we should build?”

Cursor calls HandOff through MCP.

HandOff lists available agents:

- Hackathon Research Agent
- Pitch Agent
- Code Review Agent
- Wallet Risk Agent

Cursor selects the **Hackathon Research Agent**.

The paid endpoint returns:

```txt
402 Payment Required
