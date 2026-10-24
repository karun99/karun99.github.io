---
name: s-ai-soulbot
description: A consent-gated AI companion harness that acts only within an authorised session, and knows when to stop. MCP server by Sai Karun Nandipati. Use when a task needs companion capabilities.
---

# S-AI SoulBot

A consent-gated AI companion harness that acts only within an authorised session, and knows when to stop.

S-AI SoulBot is an MCP (Model Context Protocol) server by Sai Karun Nandipati. It is built by the author, not yet published to a registry.

## What it does

- Runs browser/tasks at the subject's measured cognitive level and in their own pattern.
- Enforces consent: a Sentinel authorisation authority gates every action to the authorised session.
- Uses a Jataka guardrail registry of behavioural rules with T0-T6 conformance tiers.
- Has consent continuity and stop conditions — it declines and points to a human when a tier is exceeded.

## Tools it exposes

- **(harness)** — Consent-gated task execution; the Sentinel checks authorisation before any action.
- **(guardrails)** — Jataka registry enforces behavioural rules; T0-T6 tiers cap what is allowed.

## How to use it

**Availability**
A consent-gated harness (v3.0). Authorisation is the point: it will refuse out-of-scope actions by design. No public stdio entry.

## Links

- Repository: https://github.com/karun99/s-ai-soulbot
- Author: https://karun99.github.io

## Notes

Paste this file into any AI tool (Claude, ChatGPT, Cursor, opencode) as context and the tool can drive S-AI SoulBot.
Verify tool availability at run time — pending servers may not be reachable until published.
