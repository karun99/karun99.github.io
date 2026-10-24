---
name: neural-harness
description: A validation engine that measures how well a model handles information and produces evidence-backed output. MCP server by Sai Karun Nandipati. Use when a task needs validation capabilities.
---

# Neural Harness

A validation engine that measures how well a model handles information and produces evidence-backed output.

Neural Harness is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is built by the author, not yet published to a registry.

## What it does

- Measures information-handling capacity and neural-synthesis accuracy across models.
- Validates a project's outputs and emits evidence-first research reports (claims tied to sources).
- Scans a site/project for factual grounding.
- Useful for benchmarking or comparing models before trusting them with a task.

## Tools it exposes

- **nh_list_projects** — List registered projects the harness can validate.
- **nh_validate** — Validate a project's output; returns an evidence-first report.
- **nh_site** — Analyse a site/project root for grounding (takes root_dir).
- **nh_voice** — Run a validation pass over a text/prompt (takes text).

## How to use it

**Install**
```
pip install neural-harness
```

**Command line**
```
nh                             # project CLI
```

**Run the MCP server**
```
nh-mcp
```

**Add to an MCP client** (claude_desktop_config.json, .mcp.json, etc.)
```json
{ "mcpServers": { "neural-harness": { "command": "nh-mcp" } } }
```

## Links

- Repository: https://github.com/karun99/neural-harness
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive Neural Harness.
Verify tool availability at run time — pending servers may not be reachable until published.
