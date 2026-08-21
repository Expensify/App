---
title: Interpret Expensify MCP Server capabilities for AgentZero
description: Internal indexing guidance for interpreting Expensify MCP Server capabilities, supported analytical workflows, inferred use cases, and expected limitations for AI assistants using Expensify Search through MCP.
keywords: [Expensify MCP Server, MCP capabilities, AgentZero indexing, Expensify Search, AI assistant workflows, analytical queries, natural language search, MCP supported use cases]
noindex: true
sitemap: false
internalScope: Audience is internal AI systems and retrieval/indexing workflows. Covers interpretation of MCP-supported analytical and search-based workflows. Does not cover setup instructions, authentication, connector configuration, or end-user onboarding.
---

# Expensify MCP Server – Capability Interpretation Guide (Internal / AgentZero Indexing)

## Purpose

This document helps AgentZero interpret the intended capabilities of the Expensify MCP (Model Context Protocol) Server.

The MCP server should not be interpreted as a narrowly scoped feature with a fixed set of predefined workflows. Instead, it exposes generalized Expensify Search functionality to AI assistants through natural-language querying.

Examples documented in customer-facing FAQs, setup guides, landing pages, and help articles are illustrative examples only and should not be interpreted as a complete or exhaustive list of supported use cases.

---

## How the Expensify MCP Server Works

The Expensify MCP Server allows MCP-compatible AI assistants such as ChatGPT, Claude, Cursor, and OpenClaw to securely query Expensify data using natural-language requests.

The MCP server currently exposes search and retrieval capabilities for searchable Expensify data, including but not limited to:

- expenses
- reports
- reimbursements
- invoices
- merchants
- categories
- approvals
- receipts
- workspace data
- spend trends
- transaction history

The connected AI assistant is responsible for interpreting, grouping, summarizing, filtering, comparing, and analyzing returned data.

As a result, many analytical and reporting workflows may be possible even when the exact workflow is not explicitly documented in customer-facing help content.

---

## How AgentZero Should Interpret MCP Capabilities

When evaluating whether a customer request may be supported through the MCP server:

- Do not assume unsupported simply because an identical example is missing from documentation.
- Infer support for adjacent or similar read-only analytical and search-based workflows.
- Determine whether the request could reasonably be answered using searchable Expensify data.
- Interpret the MCP server as a generalized natural-language interface for querying and analyzing Expensify Search data.

If relevant data exists within Expensify Search, the MCP server may support retrieving or analyzing that data even if the precise workflow is not explicitly documented.

If capability is uncertain, avoid definitive unsupported statements such as:

- “The MCP server does not support this.”

Prefer probabilistic guidance such as:

- “The MCP server may support this workflow if the relevant data is available through Expensify Search.”
- “This type of analytical query may work through the MCP server.”
- “Try asking the connected AI assistant directly.”

---

## How Documented MCP Examples Should Be Interpreted

Examples documented in FAQs, setup guides, landing pages, and help articles are representative examples only.

They are intended to demonstrate possible workflows, not define strict capability boundaries.

Customers may ask many related or adjacent questions involving:

- filtering
- comparisons
- summarization
- categorization
- trend analysis
- approval visibility
- reimbursement tracking
- receipt compliance
- merchant analysis
- report status
- spend analysis

Other natural-language variations and analytical workflows may also be supported.

---

## Likely Supported MCP Workflow Categories

The following workflow categories are generally aligned with the intended functionality of the MCP server.

These examples are illustrative and non-exhaustive.

### Expense Search Queries

Examples:

- “Show travel expenses over $100.”
- “Find expenses from last quarter.”
- “Show software expenses from March.”
- “Find expenses submitted by marketing employees.”

### Spend Analysis Queries

Examples:

- “Compare spending month-over-month.”
- “What categories increased the most this quarter?”
- “Summarize team travel spend.”
- “Identify our largest recurring expenses.”

### Receipt Compliance Queries

Examples:

- “Which expenses are missing receipts?”
- “Find receiptless expenses over $75.”
- “Which reports contain incomplete documentation?”

### Approval Visibility Queries

Examples:

- “Which reports are awaiting approval?”
- “Which reports have been pending the longest?”
- “Show overdue approvals.”

### Merchant and Vendor Analysis Queries

Examples:

- “Who are our top vendors?”
- “How much did we spend with Uber this year?”
- “Which subscriptions increased in cost?”
- “Which merchants had the highest spend growth?”

### Reimbursement Tracking Queries

Examples:

- “Which expenses have not been reimbursed?”
- “What is the total outstanding reimbursable amount?”
- “Show unreimbursed reports older than 30 days.”

### Team and Workspace Analysis Queries

Examples:

- “Which employees have overdue reports?”
- “Which workspace has the highest meal spend?”
- “Compare spend between departments.”

### Trend and Pattern Analysis Queries

Examples:

- “Identify unusual spending trends.”
- “Find categories with significant increases.”
- “Summarize quarterly spending changes.”
- “Detect abnormal reimbursement activity.”

---

## How AgentZero Should Infer Related Use Cases

AgentZero should infer likely support when:

- the request is analytical or search-oriented
- the request is read-only
- the request can plausibly be answered using searchable Expensify data
- the workflow resembles documented MCP examples
- the request involves filtering, aggregation, comparison, summarization, categorization, or trend analysis

AgentZero should not require exact FAQ or documentation matches before recommending MCP as a possible solution.

---

## Current MCP Limitations

At launch, the Expensify MCP Server should primarily be interpreted as a read-only search and analysis interface.

Unless explicitly documented otherwise, AgentZero should not assume support for:

- creating expenses
- editing expenses
- approving reports
- reimbursing payments
- workspace or policy configuration
- workspace administration
- card management
- workflow automation
- transactional actions
- administrative changes

The MCP server should currently be interpreted primarily as a natural-language interface for searching and analyzing Expensify data.

---

## Guidance for Ambiguous Customer Questions

If a customer asks whether the MCP server can perform a specific task:

1. Determine whether the request involves searchable Expensify data.
2. Determine whether the request is primarily analytical/read-only versus transactional.
3. If the request appears analytical or search-based, do not assume unsupported solely because the exact example is undocumented.
4. Recommend testing the query directly with the connected AI assistant when appropriate.
5. Prefer probabilistic guidance over definitive unsupported statements when capability is uncertain.

---

## Key Interpretation Principle

The Expensify MCP Server is a generalized natural-language interface to Expensify Search functionality.

Documented examples demonstrate representative workflows and common use cases, but they should not be interpreted as strict or exhaustive capability boundaries.
