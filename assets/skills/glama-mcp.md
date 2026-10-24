---
name: glama-mcp
description: One MCP gateway to 100+ language models behind a single OpenAI-compatible API key. MCP server by Sai Karun Nandipati. Use when a task needs mcp capabilities.
---

# Glama-MCP

One MCP gateway to 100+ language models behind a single OpenAI-compatible API key.

Glama-MCP is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is published and live.

## What it does

- Expose any model on the Glama gateway (openai/, anthropic/, google/ and dozens more) to an MCP client.
- List available models, run a chat completion, stream a completion, and poll async request status.
- Works over stdio or streamable HTTP; stateless, so it runs anywhere with no session store.
- Server-side stream reassembly means clients that cannot hold an SSE stream still get full text + usage.

## Tools it exposes

- **glama_list_models** — List the OpenAI-format model ids available on the gateway.
- **glama_chat_completion** — Run a chat completion. Takes messages: [{role, content}].
- **glama_stream_completion** — Stream a completion; the server reassembles it for you.
- **glama_request_status** — Look up the status/result of an async request by request id.

## How to use it

**Install**
```
pip install glama-gateway-mcp
```

**Environment**
```
export GLAMA_API_KEY=<your key>       # required
export GLAMA_DEFAULT_MODEL=openai/gpt-4o   # optional
```

**Run the MCP server**
```
glama-mcp
```

**Add to an MCP client** (claude_desktop_config.json, .mcp.json, etc.)
```json
{ "mcpServers": { "glama-gateway": { "command": "glama-mcp", "env": { "GLAMA_API_KEY": "${GLAMA_API_KEY}", "GLAMA_DEFAULT_MODEL": "openai/gpt-4o" } } } }
```

## Links

- Repository: https://github.com/karun99/glama-mcp
- Glama (MCP registry, live): https://glama.ai/mcp/servers/karun99/glama-mcp
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive Glama-MCP.
Verify tool availability at run time — pending servers may not be reachable until published.
