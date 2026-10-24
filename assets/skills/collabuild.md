---
name: collabuild
description: Turns a research paper into a working prototype through a chain of specialised AI agents. MCP server by Sai Karun Nandipati. Use when a task needs mas capabilities.
---

# Collabuild

Turns a research paper into a working prototype through a chain of specialised AI agents.

Collabuild is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is built by the author, not yet published to a registry.

## What it does

- Ingests a paper (as SRS text or a file) and drives it through requirement analysis, SRS, design, and code.
- Targets an output type: CLI, web app, or an MCP server.
- Coordinates specialised agents rather than one assistant, so each stage is validated.
- Chooses provider/model and writes the generated app to an output directory.

## Tools it exposes

- **collabuild (CLI)** — Run the pipeline end to end.

## How to use it

**Install**
```
pip install collabuild-mas
```

**Command line**
```
collabuild --srs-file paper.md --target web --output ./generated_app
```

**Flags**
```
--srs | --srs-file <path> | --target cli|web|mcp | --output <dir> | --provider <p> | --model <m>
```

## Links

- Repository: https://github.com/karun99/Collabuild
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive Collabuild.
Verify tool availability at run time — pending servers may not be reachable until published.
