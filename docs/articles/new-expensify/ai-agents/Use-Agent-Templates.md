---
title: Use Agent Templates
description: Learn what each built-in agent template does, how it works, and when to use it.
keywords: [agent templates, agents, TipMaster, Translator Tess, Splitter Sam, AI agent, receipt translator, card splitter]
internalScope: Audience is New Expensify members creating AI agents. Covers the built-in agent templates available when creating a new agent and what each one does. Does not cover creating custom agents, editing agent instructions, Agent rules, or RuleBot.
contentType: topic
platform: New Expensify
---

# Use Agent Templates

Agent templates are ready-to-use agents with prewritten instructions for common tasks. Instead of creating an agent from scratch, you can start with a template and customize its instructions at any time.

Expensify includes a growing library of built-in templates, each designed for a specific workflow. This article explains what each template does and when you might want to use it.

To learn how agents work or create your own, see [Create and use agents](/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents).

---

## How agent templates work

Every template is a standard Expensify agent with instructions that are already written for you. Like any agent, it runs from its own Expensify account and is added as a full-access Copilot on your account, allowing it to review expenses and act on your behalf.

Each template monitors your expenses and receipts for specific conditions. When those conditions are met, the agent performs its configured action, such as adding a comment or moving an expense to another report. If an expense doesn't match the template's instructions, the agent takes no action.

After creating a template, you can edit its instructions at any time to customize its behavior.

---

## What TipMaster does

TipMaster reviews restaurant receipts and identifies tips that exceed 20% of the pre-tax subtotal.

When you add a restaurant receipt, TipMaster calculates the tip percentage using the pre-tax subtotal. If the tip is greater than 20%, it adds a comment showing the subtotal, tip amount, and calculated percentage. It ignores receipts that aren't from restaurants and tips that are 20% or less.

TipMaster is useful for maintaining consistent meal spending, identifying accidental over-tipping, or highlighting expenses that may need additional review.

---

## What Translator Tess does

Translator Tess translates receipts that aren't written in English.

When you add a non-English receipt, Translator Tess comments with an English translation of the receipt's key details, including the merchant, date, line items, subtotal, tax, and total. Receipts that are already in English are ignored.

Translator Tess is useful for international travel, reviewing foreign-language receipts, or keeping expense documentation consistent across global teams.

---

## What Splitter Sam does

Splitter Sam organizes company card expenses by moving them to the correct card report.

When a card expense is submitted to the wrong report, Splitter Sam moves it to the report for the card it was charged to, creating that report if necessary. Cash expenses aren't affected.

Splitter Sam is useful if you use multiple company cards and want each card's expenses grouped on its own report for easier reconciliation.

---

## How to create an agent from a template

When you create a new agent, Expensify suggests the available agent templates alongside the option to create a custom agent. Choosing a template automatically creates an agent with prewritten instructions that you can review and customize before saving.

<!-- SCREENSHOT:
Suggestion: The agent template picker showing the available templates.
Location: After this section.
Purpose: Helps members recognize the available templates before creating an agent.
-->

For step-by-step instructions, see [Create and use agents](/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents).

---

## Related articles

- [Create and use agents](/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents)
- [Write agent rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules)
