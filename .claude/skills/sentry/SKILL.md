---
name: sentry
description: Analyze Sentry issues, spans, crashes, and performance metrics. Use when user requests check in Sentry, asks about performance metrics and spans or asks about crash rates.
---

# Sentry 

## When to Use This Skill

Use Sentry skill when:
- User requests any data from Sentry
- User asks about performance metrics or span summary
- User want to compare metrics between any date ranges
- User asks about latest production crashes and issues
- User want to investigate profiles or traces from production sessions

## Sentry MCP

The Sentry MCP server is configured in `.mcp.json` and gives Claude Code direct access to Sentry — search issues, inspect events, traces.

## Prerequisites

**Setup** (one-time per engineer): On first use, Claude Code will open a browser OAuth login to Sentry. Sign in and authorize — no manual token setup required.


### Example uses

- "Search Sentry for crashes in the last 24h related to expense creation"
- "Get details on Sentry issue APP-123"
- "Compare P90 of ManualAppStartup durations between last two weeks"