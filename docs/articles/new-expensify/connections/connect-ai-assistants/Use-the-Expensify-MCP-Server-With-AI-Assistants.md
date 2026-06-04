---
title: Use the Expensify MCP server with AI assistants
description: Learn how to connect MCP-compatible AI assistants like ChatGPT, Claude, and Cursor to your Expensify account to securely search and analyze your Expensify data using natural language.
keywords: [connect AI assistants to Expensify, Expensify MCP server, ChatGPT Expensify integration, Claude Expensify MCP, MCP server setup, AI expense analysis]
internalScope: Audience is members, managers, accountants, and Workspace Admins using MCP-compatible AI clients. Covers connecting AI assistants to Expensify using the MCP server and understanding supported workflows, permissions, and security limitations. Does not cover client-specific MCP configuration steps or non-MCP integrations.
order: 1
---

# Use the Expensify MCP server with AI assistants

The Expensify MCP server lets you connect AI assistants like ChatGPT, Claude, and Cursor directly to your Expensify account. Once connected, you can ask questions about expenses, reports, reimbursements, receipts, trips, chats, tasks, invoices, and spending trends directly from your AI client.

Instead of manually exporting data or building custom reporting workflows, you can ask questions in natural language and get answers directly from your AI assistant.

## What is MCP?

MCP (Model Context Protocol) is an open standard that lets AI assistants securely connect to services like Expensify.

Once connected, your AI assistant can:

 - Search and analyze expenses
 - Summarize reports
 - Identify missing receipts
 - Compare spending trends
 - Surface approval bottlenecks
 - Answer natural language questions about your Expensify data

Expensify’s MCP server exposes Search functionality to compatible AI assistants, allowing them to retrieve and analyze Expensify data on your behalf.

## Who can connect AI assistants using Expensify’s MCP server

Any member with an Expensify account and access to an MCP-compatible AI client can connect to the Expensify MCP server.

Supported AI clients include:

 - Claude
 - ChatGPT
 - Cursor

Other MCP-compatible AI clients may also work with the Expensify MCP server.

## How to connect AI assistants using Expensify’s MCP server

Each AI client has its own MCP configuration flow, but the general setup process is similar.

1. Open your MCP-compatible AI client.
2. Locate the MCP or integrations settings.
3. Add a new MCP server connection.
4. Connect to `https://www.expensify.com/mcp`.
5. Sign in to Expensify when prompted.
6. Review the requested permissions.
7. Approve the OAuth access request.
8. Return to your AI client and test the connection using a natural language query.

Supported setup guides:
 - [Connect ChatGPT to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-ChatGPT-to-Expensify-Using-MCP)
 - [Connect Claude to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-Claude-to-Expensify-Using-MCP)
 - [Connect Cursor to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-Cursor-to-Expensify-Using-MCP)

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

When you authorize the connection, you grant the `mcp:tools` scope. This gives the AI assistant read access to the Expensify data you can already access based on your account and Workspace permissions.

The MCP server provides read-only access to Expensify data through the Search tool. Your AI assistant can search, retrieve, and analyze data, but it cannot create, edit, or delete anything in Expensify.

You can revoke access at any time.

## How to revoke access to Expensify’s MCP server

You can disconnect your AI assistant from Expensify at any time.

To revoke access:

1. Open the AI client you connected to Expensify.
2. Locate the MCP or integrations settings.
3. Remove or disconnect the Expensify MCP server connection.

You may also revoke access directly through Expensify’s OAuth revocation flow if supported by your client configuration.

After revocation, the AI assistant will no longer be able to access your Expensify data through MCP.

## What happens after you connect AI assistants using Expensify’s MCP server

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

Any MCP-compatible AI client may work with Expensify’s MCP server. Official setup guides are available for Claude, ChatGPT and Cursor.

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

No. The Expensify MCP server provides read-only access to your data. It can search, filter, summarize, and analyze information, but it cannot approve reports, edit expenses, reimburse payments, or manage Workspace settings.

## Are the documented prompts the only supported use cases?

No. The documented prompts are representative examples only.

Many similar analytical and search-based workflows may also work depending on the available Expensify data and the capabilities of the connected AI assistant.

## Is my data secure when using Expensify’s MCP server?

Yes. Expensify uses OAuth 2.1 with PKCE and explicit user consent to authorize AI assistant connections. You can revoke access at any time.

## What happens after I connect my AI assistant?

Once connected, your AI assistant can use Expensify’s MCP Search tool to retrieve and analyze your searchable Expensify data in response to natural language prompts.
