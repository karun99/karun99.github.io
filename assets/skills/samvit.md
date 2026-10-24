---
name: samvit
description: Local-first personal AI with a shared memory graph, five named profiles, and a 14-check quality gate. MCP server by Sai Karun Nandipati. Use when a task needs local-first capabilities.
---

# Samvit

Local-first personal AI with a shared memory graph, five named profiles, and a 14-check quality gate.

Samvit is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is built by the author, not yet published to a registry.

## What it does

- Answers through a full pipeline (L1 pre-check onward) with trusted knowledge retrieval (RAG).
- Switches between five named profiles (e.g. jarvis, hana) over one shared memory graph.
- Runs a 14-check ULTRON validation gate on candidate responses before returning them.
- Computes a VISION accuracy marker for each response; below threshold it refuses rather than guess.
- Everything stays local — privacy-preserving, no cloud dependency.

## Tools it exposes

- **samvit_ask** — Full request pipeline for one message; optional profile (defaults to active).
- **samvit_profiles** — List the five named profiles.
- **samvit_status** — Report brain status: active profile, memory claim count.
- **samvit_validate** — Run the 14-check ULTRON gate on a candidate response.
- **samvit_vision** — Compute the VISION accuracy marker for a response.
- **samvit_shape** — Push text through the single FM8/ULTRON gate.

## How to use it

**Install**
```
pip install samvit
```

**Command line**
```
samvit
```

**Run the MCP server**
```
samvit-mcp
```

**Add to an MCP client** (claude_desktop_config.json, .mcp.json, etc.)
```json
{ "mcpServers": { "samvit": { "command": "samvit-mcp" } } }
```

## Links

- Repository: https://github.com/karun99/samvit
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive Samvit.
Verify tool availability at run time — pending servers may not be reachable until published.
