---
title: Use the Expensify MCP server with AI assistants
description: Connect an AI assistant to Expensify to securely search and analyze your Expensify data using the Expensify connector or MCP server.
keywords: [connect AI assistants to Expensify, Expensify MCP server, Expensify AI connectors, ChatGPT Expensify integration, Claude Expensify connector, Cursor Expensify MCP, Grok Expensify connector, AI expense analysis]
internalScope: Audience is members using MCP-compatible AI assistants. Covers connecting supported AI assistants to Expensify using built-in connectors or the Expensify MCP server, plus supported workflows, permissions, and security. Does not cover detailed client-specific configuration.
order: 1
---

# Use the Expensify MCP server with AI assistants

Connect an AI assistant to Expensify to search and analyze your Expensify data using natural language. Once connected, you can ask questions about expenses, reports, reimbursements, receipts, trips, chats, tasks, invoices, and spending trends directly from your AI client. 

ChatGPT, Claude, Cursor, and Grok offer built-in ways to connect to Expensify. You can also manually connect other MCP-compatible AI assistants using the Expensify MCP server.

## What is MCP?

MCP (Model Context Protocol) is an open standard that lets AI assistants securely connect to services like Expensify.

Expensify’s MCP server provides compatible AI assistants with Search functionality so they can retrieve and analyze Expensify data on your behalf.

Once connected, your AI assistant can:

 - Search and analyze expenses
 - Summarize reports
 - Identify missing receipts
 - Compare spending trends
 - Surface approval bottlenecks
 - Answer natural language questions about your Expensify data

## Who can connect AI assistants to Expensify

Any member with an Expensify account and access to a supported AI assistant or MCP-compatible AI client can connect to Expensify.

Supported AI clients include:

 - Claude 
 - ChatGPT
 - Cursor
 - Grok
 - Other MCP-compatible AI clients

## How to connect a supported AI assistant to Expensify

If you use ChatGPT, Claude, Cursor, or Grok, follow the setup guide for your AI assistant. These integrations provide a built-in way to connect to Expensify without manually configuring the Expensify MCP server.

- [Connect ChatGPT to Expensify](/articles/new-expensify/connections/connect-ai-assistants/Connect-ChatGPT-to-Expensify-Using-MCP)
- [Connect Claude to Expensify](/articles/new-expensify/connections/connect-ai-assistants/Connect-Claude-to-Expensify-Using-MCP)
- [Connect Cursor to Expensify](/articles/new-expensify/connections/connect-ai-assistants/Connect-Cursor-to-Expensify-Using-MCP)
- [Connect Grok to Expensify](/articles/new-expensify/connections/connect-ai-assistants/Connect-Grok-to-Expensify)

## How to manually connect an AI assistant using Expensify’s MCP server

If your AI assistant supports custom MCP connections, you can manually connect it to the Expensify MCP server.

The exact setup varies by AI client, but the general process is:

1. Open your MCP-compatible AI client.
2. Locate its MCP, connector, or integrations settings.
3. Add a new MCP server or custom connector.
4. Enter `https://www.expensify.com/mcp/` as the server URL.
5. Sign in to Expensify when prompted.
6. Review the requested permissions.
7. Approve the OAuth access request.
8. Return to your AI client and test the connection using a natural language query.

## What you can do with Expensify’s MCP server

You can use natural language to query and analyze your Expensify data through your AI assistant.

Here are a few examples of questions you can ask:

 - What did I spend on travel last month?
 - Show me all expenses over $100 missing receipts.
 - Which reports are waiting for my approval?
 - Summarize team spending by category for Q1.
 - Which merchants are we spending the most with?
 - Find unreimbursed expenses older than 30 days.
 - Compare this month’s software spend to last month.
 - Which employees have overdue reports?

The Expensify MCP server can help analyze:

 - Expenses
 - Reports
 - Reimbursements
 - Invoices
 - Merchants
 - Categories
 - Approvals
 - Receipts
 - Workspace data
 - Spend trends
 - Trips
 - Chats
 - Tasks

The example prompts above are illustrative only and are not a complete list of supported queries.

## How Expensify secures MCP server access

Expensify uses OAuth 2.1 with PKCE to securely authenticate AI assistant connections.

When connecting:

1. Your AI assistant redirects you to Expensify.
2. You sign in using your existing Expensify authentication methods.
3. Expensify shows a consent screen explaining the requested access.
4. You approve or deny the connection.

When you authorize the connection, you grant the `mcp:tools` scope. This gives the AI assistant read access to the Expensify data you can already access based on your account and workspace permissions.

The MCP server provides read-only access to Expensify data through the Search tool. Your AI assistant can search, retrieve, and analyze data, but it cannot create, edit, or delete anything in Expensify.

You can revoke access at any time.

## How to revoke an AI assistant’s access to Expensify

You can disconnect your AI assistant from Expensify at any time.

If you connected Expensify using a built-in connector, follow the instructions for your AI assistant to remove or disconnect the Expensify connector.

If you manually configured the Expensify MCP server:

1. Open the AI client you connected to Expensify.
2. Locate the MCP or integrations settings.
3. Remove or disconnect the Expensify MCP server connection.

You may also revoke access directly through **Device management** in your Expensify account if supported by your AI client. [Learn how to managed logged in devices](/articles/new-expensify/settings/Manage-Logged-in-Devices). 

After revocation, the AI assistant will no longer be able to access your Expensify data through MCP.

## What happens after you connect an AI assistant to Expensify

Once connected, your AI assistant can use Expensify’s MCP Search tool to retrieve and analyze your searchable Expensify data in response to natural language prompts.

Expensify returns the requested data through the MCP Search tool, and your AI assistant handles the analysis and summarization.

The MCP server supports read-only workflows focused on:

 - Querying
 - Filtering
 - Summarization
 - Search
 - Trend analysis

# FAQ

## Which AI assistants work with Expensify’s MCP server?

ChatGPT, Claude, Cursor, and Grok can connect to Expensify using their built-in Expensify integrations.

Other MCP-compatible AI clients may also work with the Expensify MCP server by connecting to `https://www.expensify.com/mcp/`.

## What data can Expensify’s MCP server access?

The MCP server can access data available through Expensify’s Search tool, including:

 - Expenses
 - Reports
 - Reimbursements
 - Invoices
 - Merchants
 - Categories
 - Receipts
 - Approvals

## Can Expensify’s MCP server approve reports or edit expenses?

No. The Expensify MCP server provides read-only access to your data. It can search, filter, summarize, and analyze information, but it cannot approve reports, edit expenses, reimburse payments, or manage workspace settings.

## Are the documented prompts the only supported use cases?

No. The documented prompts are representative examples only.

Many similar analytical and search-based workflows may also work depending on the available Expensify data and the capabilities of the connected AI assistant.

## Is my data secure when using Expensify’s MCP server?

Yes. Expensify uses OAuth 2.1 with PKCE and explicit user consent to authorize AI assistant connections. You can revoke access at any time.
