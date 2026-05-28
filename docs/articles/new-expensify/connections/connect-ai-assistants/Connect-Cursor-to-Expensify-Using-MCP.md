---
title: Connect Cursor to Expensify using MCP
description: Learn how to connect Cursor to Expensify using the Expensify MCP server.
keywords: [Cursor Expensify MCP, connect Cursor to Expensify, Expensify MCP Cursor setup]
internalScope: Audience is members using Cursor. Covers connecting Cursor to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
---

# Connect Cursor to Expensify using MCP

You can connect Cursor to Expensify using the Expensify MCP server. Once connected, Cursor can search and analyze your Expensify data using natural language.

## Who can connect Cursor to Expensify using MCP

Any member with an Expensify account and access to Cursor can connect Cursor to Expensify using MCP.

Requirements:

- Cursor version 0.46 or later
- An active Expensify account
- Internet access for OAuth authentication

## How to connect Cursor to Expensify using MCP

1. Open Cursor.
2. Open **Cursor Settings**.
3. Go to **Tools & MCPs**.
4. Click **New MCP server**.
5. Add the Expensify MCP server configuration:

```json
{
  "mcpServers": {
    "expensify": {
      "url": "https://www.expensify.com/mcp/"
    }
  }
}
```

6. Click **Save**.
7. Ask Cursor a question that requires Expensify data.
8. Complete the OAuth sign-in and approval flow in your browser.
9. Click **Approve**.

<!-- SCREENSHOT:
Suggestion: Show the Cursor MCP settings screen with the Expensify MCP server configuration.
Location: After the JSON configuration example.
Purpose: Helps members correctly configure Cursor.
-->

## What happens after you connect Cursor to Expensify using MCP

Once connected, Cursor can use the Expensify MCP Search tool to retrieve and analyze your Expensify data.

Cursor can:

- Search expenses and reports
- Summarize spending
- Identify missing receipts
- Analyze spending trends

Cursor cannot:

- Approve reports
- Edit expenses
- Reimburse payments
- Manage Workspace settings

# FAQ

## Why can’t Cursor access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Cursor still cannot access your data:

- Verify the MCP server URL is correct
- Restart Cursor
- Reconnect the MCP server
- Reauthorize the OAuth connection

## Can Cursor edit expenses or approve reports?

No. The Expensify MCP server provides read-only access to your data.

## How do I revoke Cursor access to Expensify?

Open Cursor, remove the Expensify MCP server connection, and revoke the OAuth authorization if needed.
