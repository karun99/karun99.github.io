---
name: celebrum
description: A local-first artificial brain for agents: persona model, memory graph, and a truth engine. MCP server by Sai Karun Nandipati. Use when a task needs memory capabilities.
---

# Celebrum

A local-first artificial brain for agents: persona model, memory graph, and a truth engine.

Celebrum is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is published and live.

## What it does

- Stores and recalls long-term memory as a graph of linked 'neurons' with strengths and evidence.
- Keeps a stable persona so an agent behaves consistently across sessions.
- Runs a truth engine that tags claims with evidence and confidence instead of guessing.
- Manages guardrails: propose, approve, and revert behavioural rules with consent tokens and risk tiers.
- Snapshots and validates state so memory changes are auditable (immutable audit log).

## Tools it exposes

- **recall** — Query the memory graph (query, limit, min_strength, tier_filter).
- **remember** — Write a memory: content, tier, and optional links to existing anchor nodes.
- **forget** — Remove or decay a memory node.
- **simulate** — Run a hypothetical against the brain and return the outcome without committing.
- **truth** — Check a claim against stored evidence; returns support/contradiction and confidence.
- **snapshot** — Capture an immutable labelled snapshot of the current brain state.
- **validate** — Validate an output against the persona and guardrails before release.
- **propose_guardrail** — Propose a new behavioural guardrail rule.
- **approve_guardrail** — Approve a pending guardrail (needs a consent token).
- **revert_guardrail** — Roll back an active guardrail.

## How to use it

**Install**
```
pip install celebrum
```

**Command line**
```
celebrum                     # interactive brain CLI
```

**Run the MCP server**
```
celebrum-mcp                # MCP server over stdio
```

**Add to an MCP client** (claude_desktop_config.json, .mcp.json, etc.)
```json
{ "mcpServers": { "celebrum": { "command": "celebrum-mcp" } } }
```

## Links

- Repository: https://github.com/karun99/celebrum
- Glama (MCP registry, live): https://glama.ai/mcp/servers/karun99/celebrum
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive Celebrum.
Verify tool availability at run time — pending servers may not be reachable until published.
