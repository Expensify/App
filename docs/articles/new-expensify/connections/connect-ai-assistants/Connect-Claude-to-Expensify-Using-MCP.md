---
title: Connect Claude to Expensify
description: Learn how to connect Claude to Expensify using the Expensify MCP server.
keywords: [Claude Desktop Expensify MCP, Claude AI, Claude Cowork, Claude custom connector, connect Claude to Expensify, Expensify MCP Claude setup]
internalScope: Audience is members using Claude. Covers connecting Claude to Expensify using Claude's Connectors Directory and MCP. Does not cover other AI clients or general MCP workflows.
order: 3
---

# Connect Claude to Expensify

You can connect Claude to Expensify to search and analyze your Expensify data using natural language. 

Expensify is available in Claude’s Connectors Directory. The Expensify connector uses MCP to securely connect Claude to your Expensify account.

## Who can connect Claude to Expensify

Any member with an Expensify account and a Claude account can connect Claude to Expensify.

## How to connect Claude to Expensify

Follow Claude’s instructions to access available connectors: [Use Connectors to Extend Claude's Capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities#h_cd0f53727d).

Find the **Expensify** connector, then follow Claude’s instructions to connect your Expensify account and complete setup.

## What happens after you connect Claude to Expensify

Once connected, Claude can search, retrieve, and analyze your Expensify data.

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

## Can I connect Claude to Expensify using a custom connector?

Yes. You can manually connect Claude to the Expensify MCP server instead of adding Expensify from Claude’s Connectors Directory.

For instructions, see Claude’s documentation: [How to add a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp#h_3d1a65aded).

When prompted for the server URL, enter `https://www.expensify.com/mcp/`, then complete the OAuth sign-in and approval flow.

## Can I connect Claude to Expensify through Claude for Small Business?

Yes. Expensify is included as a connector in Anthropic’s Claude for Small Business plugin, which provides a collection of connectors across a range of popular business tools.

Add the Claude for Small Business plugin, then use the included Expensify connector and follow Claude’s instructions to connect your Expensify account. [Learn more about Claude for Small Business](https://claude.com/solutions/small-business).

## How do I remove the Expensify connector from Claude?

To remove the Expensify connector, see Claude's documentation: [Remove a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp#h_8cf641ac98). 

## Why can’t Claude access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Claude still cannot access your data:

- Verify the MCP server URL is correct, if using a custom connector.
- Remove the connector and add it again. 

## Can Claude edit expenses or approve reports?

No. The Expensify connector provides Claude read-only access to your data.
