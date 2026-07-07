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

The Sentry MCP server is configured in `.mcp.json` and gives Claude Code direct access to Sentry.

### Prerequisites

**Setup** (one-time per engineer): On first use, Claude Code will open a browser OAuth login to Sentry. Sign in and authorize — no manual token setup required.

### Available MCP Tools

Use these tools for data analysis:

| Tool | Purpose |
|------|---------|
| `mcp__sentry__find_releases` | Find release versions for scoping queries |
| `mcp__sentry__search_issues` | Search for errors/crashes by query, project, date range |
| `mcp__sentry__search_events` | Query raw events/spans (performance data, durations) |
| `mcp__sentry__search_issue_events` | Get individual events for a known issue ID |
| `mcp__sentry__get_issue_tag_values` | Inspect tag distributions (e.g. device, version) on an issue |
| `mcp__sentry__get_sentry_resource` | Fetch a specific Sentry resource by URL/ID |

**Do not use** `mcp__sentry__analyze_issue_with_seer` — AI analysis is out of scope for this skill.

Always use:
- **org slug**: `expensify`
- **project slug**: `app`

## Example uses

- "Search Sentry for crashes in the last 24h related to expense creation"
- "Get details on Sentry issue APP-123"
- "Compare P90 of ManualAppStartup durations between last two weeks"