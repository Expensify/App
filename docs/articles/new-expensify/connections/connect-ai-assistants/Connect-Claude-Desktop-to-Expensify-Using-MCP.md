---
title: Connect Claude Desktop to Expensify using MCP
description: Learn how to connect Claude Desktop to Expensify using the Expensify MCP server.
keywords: [Claude Desktop Expensify MCP, connect Claude to Expensify, Expensify MCP Claude setup]
internalScope: Audience is members using Claude Desktop. Covers connecting Claude Desktop to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
---

# Connect Claude Desktop to Expensify using MCP

You can connect Claude Desktop to Expensify using the Expensify MCP server. Once connected, Claude can search and analyze your Expensify data using natural language.

## Who can connect Claude Desktop to Expensify using MCP

Any member with an Expensify account and access to Claude Desktop can connect Claude to Expensify using MCP.

Requirements:

- Claude Desktop version that supports remote MCP servers
- An active Expensify account
- Internet access for OAuth authentication

## How to connect Claude Desktop to Expensify using MCP

1. Open Claude Desktop.
2. Go to **Settings**.
3. Select the **Developer** tab.
4. Click **Edit Config**.
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

6. Save the configuration file.
7. Restart Claude Desktop.
8. Ask Claude a question that requires Expensify data.
9. Complete the OAuth sign-in and approval flow in your browser.
10. Click **Approve**.

## What happens after you connect Claude Desktop to Expensify using MCP

Once connected, Claude Desktop can use the Expensify MCP Search tool to retrieve and analyze your Expensify data.

Claude can:

- Search expenses and reports
- Summarize spending
- Identify missing receipts
- Analyze spending trends

Claude cannot:

- Approve reports
- Edit expenses
- Reimburse payments
- Manage Workspace settings

# FAQ

## Why can’t Claude Desktop access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Claude still cannot access your data:

- Verify the MCP server URL is correct
- Restart Claude Desktop
- Reconnect the MCP server
- Reauthorize the OAuth connection

## Can Claude Desktop edit expenses or approve reports?

No. The Expensify MCP server provides read-only access to your data.

## How do I revoke Claude Desktop access to Expensify?

Open Claude Desktop, remove the Expensify MCP server connection, and revoke the OAuth authorization if needed.
