---
title: Understand How Agents Work
description: Learn how AI agents work in Expensify, including the differences between personal agents, agent rules, RuleBot, and agent templates.
keywords: [AI agents, Agents, Agent rules, RuleBot, Agent templates, AI automation, personal Agents, workspace automation]
internalScope: Audience is members and workspace admins. Covers how AI agents work in Expensify, the differences between personal agents, agent rules, RuleBot, and agent templates, and when to use each. Does not cover creating agents, creating agent rules, or writing agent instructions.
retrievalIntent: What are AI agents in Expensify, and how are agents, agent rules, RuleBot, and templates different?
contentType: topic
order: 2
---

# Understand How Agents Work

Expensify includes AI-powered agents that can automate tasks on your behalf.

This article covers the two agent features in Expensify:

- Agents, which help manage your own work.
- Agent rules, which automate how expenses and reports are handled in a workspace.

Both use natural-language instructions to determine how they should behave. 

---

## What are agents?

Agents are AI assistants that work on your behalf in Expensify. Each agent is created as its own Expensify account and uses your personal account context together with the instructions you provide to determine what actions to take.

You can create multiple agents with different responsibilities, chat with them, update their instructions, and review their activity.

To learn more about agents, see [Create and Use Agents](/articles/new-expensify/ai-agents/Create-and-Use-Agents).

---

## What are agent rules?

Agent rules let workspace admins automate how AI handles expenses and reports in a workspace.

Instead of creating an agent directly, you create natural-language rules in a workspace that describe how AI should respond to report activity.

These rules can review reports, request additional information, update expenses, route reports, or approve reports when the conditions you define are met.

To learn more about agent rules, see [Automate Workflows with Agent Rules](/articles/new-expensify/ai-agents/Automate-Workflows-with-Agent-Rules).

---

## What is RuleBot?

RuleBot is the AI agent that enforces agent rules.

The first time you create an agent rule in a workspace, Expensify automatically creates RuleBot and adds it to that workspace.

You don't create or manage RuleBot directly. Instead, you create and manage the agent rules that RuleBot follows.

---

## What are agent templates?

Agent templates are prebuilt personal agents with instructions already written for common tasks.

Instead of starting with a blank agent, you can choose a template and customize its instructions before creating the agent.

To learn about the available templates, see [Use Agent Templates](/articles/new-expensify/ai-agents/Use-Agent-Templates).

---

## What are suggested rules?

Suggested rules are pre-written agent rules for common workspace workflows.

Instead of starting with a blank agent rule, you can choose a suggested rule and edit it before saving.

To learn about the available suggested rules, see [Use Suggested Agent Rules](/articles/new-expensify/ai-agents/Use-Suggested-Agent-Rules).

---

## How do agents and agent rules use instructions?

Both personal agents and agent rules use natural-language instructions to determine how they behave.

For personal agents, the instructions describe how your agent should help you manage your work.

For agent rules, the instructions tell RuleBot how to handle expenses and reports in a workspace.

Although they operate in different contexts, the same principles apply: write clear, specific instructions that describe the outcome you want.

[Learn how to write agent instructions](/articles/new-expensify/ai-agents/How-to-Write-Agent-Instructions).

---

## When should I use an agent or an agent rule?

Use an agent when you want AI to help manage your own work.

Use agent rules when you want AI to automate how expenses and reports are handled across a workspace.

Many organizations use both. For example, you might use a personal agent to help manage your own expenses while using agent rules to automate your organization's approval process.

| | **Agents** | **Agent rules** |
| --- | --- | --- |
| **Best for** | Automating your own work | Automating expense and report workflows in a workspace |
| **Who sets it up** | Any member with access to agents | Workspace admins |
| **Where it's managed** | **Account > Agents** | **Workspaces > [workspace name] > Rules** |
| **What you create** | One or more personal agents | One or more agent rules |
| **AI that follows your instructions** | Your agent | RuleBot |
| **Applies to** | Your own account | The entire workspace |

# FAQ

## Do I need to know how to write prompts to use AI agents?

No. Both agents and agent rules use natural-language instructions, so you can describe the behavior you want in plain language. Clear, specific instructions generally produce better results.

## Can I use both agents and agent rules?

Yes. Many organizations use both. Personal agents help manage your own work, while agent rules automate how expenses and reports are handled across a workspace.

## Are there pre-written agent instructions I can use?

Yes. Agent templates are prebuilt personal agents with pre-written instructions for common tasks. Suggested agent rules are pre-written workspace agent rules that you can use as a starting point for common workflows. You can review and customize the instructions before saving.

## Can I customize agent templates and suggested rules?

Yes. Both are intended to be starting points. You can review and edit the instructions before creating the agent or saving the agent rule.
