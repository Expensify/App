---
title: Connect Grok to Expensify
description: Connect Grok to Expensify to search, retrieve, and analyze your Expensify data using the Expensify connector.
keywords: [Grok Expensify MCP, Grok AI, xAI, Grok connector, Grok custom connector, connect Grok to Expensify, Expensify MCP Grok setup]
internalScope: Audience is members using Grok. Covers connecting Grok to Expensify using Grok's connectors and MCP. Does not cover other AI clients or general MCP workflows.
order: 5
---

# Connect Grok to Expensify

Connect Grok to Expensify to search and analyze your Expensify data using natural language. Expensify is available as a built-in connector in Grok and uses MCP to securely connect Grok to your Expensify account.

## Who can connect Grok to Expensify

Any member with an Expensify account and a Grok account can connect Grok to Expensify.

## How to connect Grok to Expensify

Follow Grok’s instructions to access available connectors: [Add a built-in connector](https://docs.x.ai/grok/connectors#built-in-connectors)

Find the **Expensify** connector, then follow Grok’s instructions to connect your Expensify account and complete setup.

## What happens after you connect Grok to Expensify

Once connected, Grok can search, retrieve, and analyze your Expensify data.

Grok can:

- Search expenses and reports
- Summarize spending
- Identify missing receipts
- Analyze spending trends

Grok cannot:

- Approve reports
- Edit expenses
- Reimburse payments
- Manage Workspace settings

# FAQ

## Can I connect Grok to Expensify using a custom connector?

Yes. You can manually connect Grok to the Expensify MCP server instead of adding the Expensify connector from Grok.

For instructions, see Grok’s documentation: [Add a custom MCP connector ](https://docs.x.ai/grok/connectors#custom-mcp-connectors)

When prompted for the server URL, enter `https://www.expensify.com/mcp/`, then complete the OAuth sign-in and approval flow.

## How do I remove the Expensify connector from Grok?

To remove the Expensify connector, see Grok’s documentation: [Managing connectors](https://docs.x.ai/grok/connector-management#managing-connectors)

## Why can’t Grok access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Grok still cannot access your data:

- Verify the MCP server URL is correct, if using a custom connector.
- Remove the connector and add it again. 

## Can Grok edit expenses or approve reports?

No. The Expensify connector provides Grok read-only access to your data.
