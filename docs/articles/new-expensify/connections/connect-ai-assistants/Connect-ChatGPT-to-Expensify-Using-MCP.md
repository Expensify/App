---
title: Connect ChatGPT to Expensify using MCP
description: Learn how to connect ChatGPT to Expensify using the Expensify MCP server.
keywords: [ChatGPT Expensify MCP, connect ChatGPT to Expensify, Expensify MCP ChatGPT setup]
internalScope: Audience is members using ChatGPT. Covers connecting ChatGPT to Expensify using MCP. Does not cover other AI clients or general MCP workflows.
order: 2
---

# Connect ChatGPT to Expensify using MCP

You can connect ChatGPT to Expensify using the Expensify MCP server. Once connected, ChatGPT can search and analyze your Expensify data using natural language.

Learn more about supported AI clients, permissions, and security in [Use the Expensify MCP server with AI assistants](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants).

---

## Who can connect ChatGPT to Expensify using MCP

Any member with an Expensify account and access to ChatGPT developer mode can connect ChatGPT to Expensify using MCP.

Requirements:

- Access to ChatGPT developer mode
- An active Expensify account
- Internet access for OAuth authentication

---

## How to enable developer mode in ChatGPT

For the latest requirements and instructions, see the [ChatGPT Developer mode documentation](https://developers.openai.com/api/docs/guides/developer-mode).

1. Open ChatGPT.
2. Go to **Settings**.
3. Select **Apps**.
4. Select **Advanced settings**.
5. Turn on **Developer mode**.

---

## How to create the Expensify connector in ChatGPT

1. Open **Settings**.
2. Select **Connectors**.
3. Click **Create**.
4. Enter the following details:

- **Connector name:** Expensify
- **Description:** Search your Expensify expenses, reports, receipts, trips, and tasks.
- **Connector URL:** `https://www.expensify.com/mcp/`

5. Click **Create**.
6. Complete the OAuth sign-in and approval flow in your browser.
7. Click **Approve**.

---

## How to use the Expensify connector in ChatGPT conversations

1. Open a new chat.
2. Click the **+** button near the message composer.
3. Select **More**.
4. Select the Expensify connector.
5. Ask a question about your Expensify data.

---

## What happens after you connect ChatGPT to Expensify using MCP

Once connected, ChatGPT can use the Expensify MCP Search tool to retrieve and analyze your Expensify data.

ChatGPT can:

- Search expenses and reports
- Summarize spending
- Identify missing receipts
- Analyze spending trends

ChatGPT cannot:

- Approve reports
- Edit expenses
- Reimburse payments
- Manage Workspace settings

---

# FAQ

## Why can’t ChatGPT access my Expensify data?

Make sure you completed the OAuth approval flow in your browser.

If ChatGPT still cannot access your data:

- Verify the MCP server URL is correct
- Reconnect the connector
- Reauthorize the OAuth connection

## Can ChatGPT edit expenses or approve reports?

No. The Expensify MCP server provides read-only access to your data.
