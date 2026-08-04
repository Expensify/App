---
title: Understand How AI Agents Work in Expensify
description: Learn how AI Agents work in Expensify, including the differences between personal Agents, Agent rules, RuleBot, and Agent templates.
keywords: [AI agents, Agents, Agent rules, RuleBot, Agent templates, AI automation, personal Agents, workspace automation]
internalScope: Audience is members and Workspace Admins. Covers how AI Agents work in Expensify, the differences between personal Agents, Agent rules, RuleBot, and Agent templates, and when to use each. Does not cover creating Agents, creating Agent rules, or writing agent instructions.
retrievalIntent: What are AI Agents in Expensify, and how are Agents, Agent rules, RuleBot, and templates different?
contentType: topic
order: 1
---

# Understand How AI Agents Work in Expensify

Expensify includes AI-powered Agents that can automate tasks on your behalf.

This article covers the two AI Agent features in Expensify:

- Agents, which help manage your own work.
- Agent rules, which automate how expenses and reports are handled in a workspace.

Both use natural-language instructions to determine how they should behave. 

---

## What are Agents?

Agents are AI assistants that work on your behalf in Expensify. Each Agent is created as its own Expensify account and uses your personal account context together with the instructions you provide to determine what actions to take.

You can create multiple Agents with different responsibilities, chat with them, update their instructions, and review their activity.

---

## What are Agent rules?

Agent rules let Workspace Admins automate how AI handles expenses and reports in a workspace.

Instead of creating an Agent directly, you create natural-language rules in a workspace that describe how AI should respond to report activity.

These rules can review reports, request additional information, update expenses, route reports, or approve reports when the conditions you define are met.

---

## What is RuleBot?

RuleBot is the AI Agent that enforces Agent rules.

The first time you create an Agent rule in a workspace, Expensify automatically creates RuleBot and adds it to that workspace.

You don't create or manage RuleBot directly. Instead, you create and manage the Agent rules that RuleBot follows.

---

## What are Agent templates?

Agent templates are prebuilt personal Agents with instructions already written for common tasks.

Instead of starting with a blank Agent, you can choose a template and customize its instructions before creating the Agent.

To learn about the available templates, see [Use Agent Templates](/articles/new-expensify/ai-agents/Use-Agent-Templates).

---

## What are suggested rules? 

Suggested rules are pre-written Agent rules for common workspace workflows.

Instead of starting with a blank Agent rule, you can choose a suggested rule and edit it before saving.

---

## How do Agents and Agent rules use instructions?

Both personal Agents and Agent rules use natural-language instructions to determine how they behave.

For personal Agents, the instructions describe how your Agent should help you manage your work.

For Agent rules, the instructions tell RuleBot how to handle expenses and reports in a workspace.

Although they operate in different contexts, the same principles apply: write clear, specific instructions that describe the outcome you want.

To learn more, see [Write Effective Agent Instructions](/articles/new-expensify/ai-agents/Write-Effective-Agent-Instructions).

---

## When should I use an Agent or an Agent rule?

Use an Agent when you want AI to help manage your own work.

Use Agent rules when you want AI to automate how expenses and reports are handled across a workspace.

Many organizations use both. For example, you might use a personal Agent to help manage your own expenses while using Agent rules to automate your organization's approval process.

| | **Agents** | **Agent rules** |
| --- | --- | --- |
| **Best for** | Automating your own work | Automating expense and report workflows in a workspace |
| **Who sets it up** | Any member with access to Agents | Workspace Admins |
| **Where it's managed** | **Account > Agents** | **Workspace > Rules** |
| **What you create** | One or more personal Agents | One or more Agent rules |
| **AI that follows your instructions** | Your Agent | RuleBot |
| **Applies to** | Your own account | The entire workspace |

---

## Related articles

- [Create and Manage Agents](/articles/new-expensify/ai-agents/Create-and-Manage-Agents)
- [Automate Workflows with Agent Rules](/articles/new-expensify/ai-agents/Automate-Workflows-with-Agent-Rules)
- [Write Effective Agent Instructions](/articles/new-expensify/ai-agents/Write-Effective-Agent-Instructions)
- [Use Agent Templates](/articles/new-expensify/ai-agents/Use-Agent-Templates)
