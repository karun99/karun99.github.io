---
name: s-ai
description: Multi-agent swarm intelligence: many perspectives on one question, with bias detection built in. MCP server by Sai Karun Nandipati. Use when a task needs multi-agent capabilities.
---

# S-AI

Multi-agent swarm intelligence: many perspectives on one question, with bias detection built in.

S-AI is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is built by the author, not yet published to a registry.

## What it does

- Sends one question to a swarm of agents and returns a multi-perspective, bias-reduced answer (s-ai ask).
- Detects reasoning biases in text: confirmation bias, cherry picking, false equivalence, overgeneralisation, emotional manipulation.
- Generates code from a natural-language spec (zencode).
- Multilingual via Bhashini: translate, text-to-speech, speech-to-text.
- Can notify, post to a webhook, and orchestrate 20+ AI providers from one config.

## Tools it exposes

- **ask** — Ask the swarm: multi-perspective, bias-reduced answer to a question.
- **confirmation_bias / cherry_picking / false_equivalence / overgeneralization / emotional_manipulation** — Bias-detection tools: flag that reasoning flaw in a passage.
- **zencode** — Generate working code from a plain-English description.
- **bhashini_translate / bhashini_tts / bhashini_asr** — Translate, synthesise speech, or transcribe audio.
- **notify / webhook** — Send a notification or POST an event to a URL.

## How to use it

**Install**
```
npm install -g @saikarun/s-ai
```

**Command line**
```
s-ai ask "<question>"          # ask the swarm
s-ai setup                   # pick provider + API key
s-ai serve                   # start the web dashboard
```

**Run the MCP server**
```
s-ai-mcp
```

**Add to an MCP client** (claude_desktop_config.json, .mcp.json, etc.)
```json
{ "mcpServers": { "s-ai": { "command": "npx", "args": ["-y", "@saikarun/s-ai", "mcp"] } } }
```

## Links

- Repository: https://github.com/karun99/s-ai
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive S-AI.
Verify tool availability at run time — pending servers may not be reachable until published.
