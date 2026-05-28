---
title: Connect Claude.ai to Expensify using MCP
description: Learn how to connect Claude.ai to Expensify using the Expensify MCP server.
keywords: [Claude.ai Expensify MCP, connect Claude.ai to Expensify, Expensify MCP Claude.ai setup]
internalScope: Audience is members using Claude.ai. Covers connecting Claude.ai to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
---

# Connect Claude.ai to Expensify using MCP

You can connect Claude.ai to Expensify using the Expensify MCP server. Once connected, Claude.ai can search and analyze your Expensify data using natural language.

Learn more about supported AI clients, permissions, and security in [Use the Expensify MCP server with AI assistants](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants).

---

## Who can connect Claude.ai to Expensify using MCP

Any member with an Expensify account and access to a supported Claude.ai plan can connect Claude.ai to Expensify using MCP.

Requirements:

- Claude.ai Pro, Max, Team, or Enterprise plan
- An active Expensify account
- Internet access for OAuth authentication

---

## How to connect Claude.ai to Expensify using MCP on Pro or Max plans

1. Open Claude.ai.
2. Select **Customize**.
3. Open **Connectors**.
4. Click **+**.
5. Select **Add custom connector**.
6. Enter `https://www.expensify.com/mcp/` as the server URL.
7. Click **Add**.
8. Complete the OAuth sign-in and approval flow in your browser.
9. Click **Approve**.

---

## How to connect Claude.ai to Expensify using MCP on Team or Enterprise plans

Workspace Owners must first add the connector for the organization.

1. Open **Organization settings**.
2. Select **Connectors**.
3. Click **Add**.
4. Hover over **Custom**.
5. Select **Web**.
6. Enter `https://www.expensify.com/mcp/`.
7. Click **Add**.

After the connector is added, each member must connect individually:

1. Open **Customize**.
2. Select **Connectors**.
3. Find the Expensify connector.
4. Click **Connect**.
5. Complete the OAuth sign-in and approval flow in your browser.
6. Click **Approve**.

---

## How to enable the Expensify connector in Claude.ai conversations

1. Open a Claude.ai conversation.
2. Click the **+** button near the message composer.
3. Select **Connectors**.
4. Turn on the Expensify connector.

---

## What happens after you connect Claude.ai to Expensify using MCP

Once connected, Claude.ai can use the Expensify MCP Search tool to retrieve and analyze your Expensify data.

Claude.ai can:

- Search expenses and reports
- Summarize spending
- Identify missing receipts
- Analyze spending trends

Claude.ai cannot:

- Approve reports
- Edit expenses
- Reimburse payments
- Manage Workspace settings

---

# FAQ

## Why can’t Claude.ai access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If Claude.ai still cannot access your data:

- Verify the MCP server URL is correct
- Reconnect the connector
- Reauthorize the OAuth connection

## Can Claude.ai edit expenses or approve reports?

No. The Expensify MCP server provides read-only access to your data.
