---
title: Connect Claude to Expensify using MCP
description: Learn how to connect Claude to Expensify using the Expensify MCP server.
keywords: [Claude Desktop Expensify MCP, Claude AI, Claude custom connector, connect Claude to Expensify, Expensify MCP Claude setup]
internalScope: Audience is members using Claude. Covers connecting Claude to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
order: 3
---

# Connect Claude to Expensify using MCP

You can connect Claude to Expensify using the Expensify MCP server. Once connected, Claude can search and analyze your Expensify data using natural language.

## Who can connect Claude to Expensify using MCP

Any member with an Expensify account and access to Claude can connect Claude to Expensify using MCP.

Requirements:

- A Claude account
- An active Expensify account
- Internet access for OAuth authentication

Claude Free plans support one custom connector.

## How to connect Claude to Expensify using a custom connector

Claude supports connecting to remote MCP servers through custom connectors.

For instructions on how to add a custom connector, see Claude's documentation: [How to add a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp#h_3d1a65aded).

1. Open Claude and add a custom connector.
2. Enter `https://www.expensify.com/mcp/` as the server URL.
3. Complete the OAuth sign-in and approval flow in your browser.
4. Click **Approve**.

## What happens after you connect Claude to Expensify using MCP

Once connected, Claude can use the Expensify MCP Search tool to retrieve and analyze your Expensify data.

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

## How do I make the Expensify connector available across my organization?

Yes. Owners in Claude can make the Expensify connector available to their organization. For instructions see Claude's documentation: [How to add a custom connector to your organization](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp#:~:text=For%20Team%20and%20Enterprise%20plans).

## How do I remove the Expensify connector from Claude?

To remove the Expensify connector, see Claude's documentation: [Remove a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp#h_8cf641ac98).

## Why can’t Claude access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Claude still cannot access your data:

- Verify the MCP server URL is correct
- Restart connector.
- Reauthorize the OAuth connection

## Can Claude edit expenses or approve reports?

No. The Expensify MCP server provides read-only access to your data.
