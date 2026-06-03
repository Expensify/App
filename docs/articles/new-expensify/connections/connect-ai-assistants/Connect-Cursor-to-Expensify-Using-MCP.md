---
title: Connect Cursor to Expensify using MCP
description: Learn how to connect Cursor to Expensify using the Expensify MCP server.
keywords: [Cursor Expensify MCP, connect Cursor to Expensify, Expensify MCP Cursor setup]
internalScope: Audience is members using Cursor. Covers connecting Cursor to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
order: 4
---

# Connect Cursor to Expensify using MCP

You can connect Cursor to Expensify using the Expensify MCP server. Once connected, Cursor can search and analyze your Expensify data using natural language.

Learn more about supported AI clients, permissions, and security in [Use the Expensify MCP server with AI assistants](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants).

---

## Who can connect Cursor to Expensify using MCP

Any member with an Expensify account and access to Cursor can connect Cursor to Expensify using MCP.

Requirements:

- Cursor version 0.46 or later
- An active Expensify account
- Internet access for OAuth authentication

---

## How to connect Cursor to Expensify using MCP

You can install the Expensify MCP server in Cursor with one click: [Install the Expensify MCP server in Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=expensify&config=eyJ1cmwiOiJodHRwczovL3d3dy5leHBlbnNpZnkuY29tL21jcCIsInR5cGUiOiJodHRwIn0%3D)

Or you can configure the MCP server manually:

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

---

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

---

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

