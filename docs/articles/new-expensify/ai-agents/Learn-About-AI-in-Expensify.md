---
title: Learn About AI in Expensify
description: Learn which AI features are available in Expensify, what SmartScan, Concierge, agents, agent rules, RuleBot, and MCP do, and which option to use.
keywords: [AI in Expensify, Expensify AI, SmartScan, Concierge, agents, agent rules, RuleBot, MCP, AI assistants, AI automation, spend analysis, which AI should I use]
internalScope: Audience is all members and Workspace Admins. Covers the AI features available in Expensify, what each feature does, where it works, how the features work together, and which feature to use for different needs. Does not cover detailed setup steps, writing agent instructions, or detailed capabilities for individual AI features.
retrievalIntent: What AI features does Expensify have, how are they different, and which one should I use?
contentType: topic
order: 1
---

# Learn About AI in Expensify

Expensify uses AI to scan receipts, answer questions, automate expense tasks, enforce workspace rules, and analyze spending.

Some AI features, like SmartScan and Concierge, work automatically or are ready to use without setup. Others, like agents and agent rules, let you create custom automations by describing what you want in plain language. You can also connect outside AI assistants to Expensify through MCP.

This article explains what each AI feature does, how the features work together, and which one to use.

## What AI features are available in Expensify?

| AI feature | What it does | Who uses it | Where it works | How to set it up |
| --- | --- | --- | --- | --- |
| **SmartScan** | Reads receipts and fills in expense details | All members | Every expense you add | No setup needed |
| **Concierge** | Answers questions, takes actions, configures workspaces, and analyzes spend | All members | Your whole account, across all your workspaces | No setup needed |
| **Agents** | Follow your instructions to automate expense tasks | All members | Your account, plus any workspace you add the agent to | [Create an agent](/articles/new-expensify/ai-agents/Create-and-Use-Agents) |
| **Agent rules and RuleBot** | Apply AI-powered rules across a workspace | Workspace Admins | One workspace | [Create an agent rule](/articles/new-expensify/ai-agents/Automate-Workflows-with-Agent-Rules) |
| **AI assistants through MCP** | Let outside AI tools analyze your Expensify data | All members | Outside Expensify, using data you can already see | [Connect an AI assistant](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants) |

You don't need to use every AI feature. The right option depends on whether you want help with a one-time task, personal automation, workspace-wide rules, or analysis outside Expensify.

## How does SmartScan use AI?

SmartScan uses AI to read receipts. When you add a receipt, SmartScan extracts details such as the merchant, date, amount, and itemized line items so you don't have to enter them manually. Workspace Admins can also use SmartScan to identify prohibited expenses on receipts, such as alcohol or gambling.

[Learn how the prohibited expenses rule works](/articles/new-expensify/workspaces/Prohibited-Expense-Rule).

## How does Concierge use AI?

Concierge is the AI assistant built into Expensify. It's available without setup and can:

- Answer questions about Expensify and help troubleshoot problems.
- Create, edit, and categorize expenses, and add them to the right report.
- Create, submit, approve, retract, and export reports when you have permission.
- Update many expenses at once, such as changing every expense on a report to the same category.
- Help Workspace Admins set up and configure a workspace in chat, such as adding members, requiring receipts, or updating the approval workflow.
- Analyze spending, answer questions about your expense data, and proactively share spend insights.
- Connect you with a human when you ask or when Concierge can't help.

Concierge is best for help you need in the moment. You ask Concierge to do something, and it responds or takes the requested action.

[Learn more about Concierge](/articles/new-expensify/concierge-ai/Concierge-Basics).

[Learn what Concierge can do](/articles/new-expensify/concierge-ai/What-Concierge-Can-Do).

[Learn how Concierge Intelligence works](/articles/new-expensify/concierge-ai/Concierge-Intelligence).

[Learn how Concierge analyzes spend](/articles/new-expensify/concierge-ai/How-Concierge-Analyzes-Spend).

## How do agents automate expense tasks?

Agents are AI assistants that you create and configure with natural language. Each agent has its own Expensify account and works as a Copilot on your account, allowing it to act for you.

Unlike Concierge, an agent follows standing instructions. Agents can respond to almost any event, including:

- A card swipe or new card transaction.
- A receipt finishing SmartScan.
- A report being submitted or approved.
- A question someone asks the agent in chat.
- A scheduled time, such as the first of every month.

Agents can also take almost any action. They can create, edit, and code expenses; submit, hold, approve, route, and reject reports; and look up expense data to detect patterns and analyze trends.

For example, you could create an agent that:

- Translates foreign receipts.
- Splits hotel bills into separate expenses.
- Posts a monthly summary of unapproved card spend.

You can also add an agent to a workspace as an approver.

[Learn how to create and use agents](/articles/new-expensify/ai-agents/Create-and-Use-Agents).

[Learn how to use agent templates](/articles/new-expensify/ai-agents/Use-Agent-Templates).

[See every event an agent can respond to](/articles/new-expensify/ai-agents/AI-Agent-Triggers).

[See every action an agent can take](/articles/new-expensify/ai-agents/AI-Agent-Capabilities).

## How do agent rules and RuleBot automate workspace rules?

Agent rules let Workspace Admins describe in plain language how expenses and reports should be handled across a workspace.

RuleBot is the AI agent that enforces those rules. Expensify creates RuleBot automatically when the first agent rule is added and adds it to the workspace as a Workspace Admin.

Agent rules are useful when a workspace requirement needs interpretation or judgment instead of a fixed condition. For example, an agent rule could:

- Reject a receipt that doesn't match its stated purpose.
- Route reports from a particular team to a specific approver.
- Hold an expense until the submitter adds a missing detail.

An agent generally works on behalf of an individual member. RuleBot works on behalf of the workspace by enforcing agent rules.

[Learn more about agents and agent rules](/articles/new-expensify/ai-agents/Understand-How-Agents-Work).

[Learn how to automate workflows with agent rules](/articles/new-expensify/ai-agents/Automate-Workflows-with-Agent-Rules).

[Learn how to use suggested agent rules](/articles/new-expensify/ai-agents/Use-Suggested-Agent-Rules).

## How do AI assistants connect to Expensify through MCP?

The Expensify MCP server lets outside AI tools, such as ChatGPT, Claude, or Cursor, access information from your Expensify account.

Once connected, you can use the AI assistant to search and analyze information such as expenses, reports, and spending trends.

MCP access is read-only. A connected AI assistant can analyze the Expensify data you have permission to see, but it can't create, edit, approve, or delete anything in Expensify.

[Learn how to use the Expensify MCP server with AI assistants](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants).

## How do Expensify AI features work together?

Each AI feature can handle a different part of the expense lifecycle. For example:

1. **SmartScan reads the receipt.** You add a hotel receipt, and SmartScan extracts the merchant, date, amount, and line items.
2. **Concierge organizes the expense.** Concierge categorizes the expense and adds it to the appropriate report.
3. **An agent follows your instructions.** Your agent notices that SmartScan has finished and splits the room charge from meals and parking.
4. **RuleBot applies workspace rules.** When you submit the report, RuleBot checks it against the workspace's agent rules and takes the appropriate action.
5. **The approval workflow continues.** The next approver can be a person, an agent, or RuleBot.
6. **AI helps analyze the results.** Admins can ask Concierge about spending or analyze Expensify data using an AI assistant connected through MCP.

You don't need to configure this entire sequence. SmartScan and Concierge work without setup, while agents and agent rules provide additional automation when needed.

## How do AI features work with standard workspace rules?

Standard workspace rules and AI-powered rules serve different purposes.

| Type | Best for | Example |
| --- | --- | --- |
| **Workspace rule** | A fixed condition that should work the same way every time | Flag expenses over $500 |
| **Agent rule** | A condition that requires reading, interpretation, or judgment | Reject receipts that appear to be personal |
| **Concierge** | Explaining a rule or making a supported one-time change when asked | Explain why an expense was flagged |

If a workspace rule can handle the requirement, use that rule. Use an agent rule when the requirement needs interpretation or judgment.

[Learn more about workspace rules](/articles/new-expensify/workspaces/Workspace-Rules).

## Which Expensify AI feature should I use?

| If you want to... | Use |
| --- | --- |
| Get an answer or have something done once | Concierge |
| Set up or update a workspace by chatting | Concierge |
| Ask questions about your spending | Concierge, or an AI assistant connected through MCP |
| Analyze Expensify data in ChatGPT, Claude, or another supported AI tool | MCP |
| Automate recurring tasks on your own expenses | An agent |
| Have AI participate in a report approval workflow | An agent or agent rules |
| Apply AI-powered rules across a workspace | Agent rules |
| Apply a simple, fixed workspace requirement | A workspace rule |

A useful rule of thumb is to start with Concierge for one-time requests. If the same action needs to happen automatically in the future, consider an agent or agent rule.

## What can each Expensify AI feature access?

AI features can only work within their assigned permissions and purpose.

| AI feature | Access |
| --- | --- |
| **SmartScan** | Receipts you add |
| **Concierge** | Information and actions you already have permission to access |
| **Agents** | The access available through their full-access Copilot relationship with your account |
| **RuleBot** | Workspace Admin access for the workspace where it enforces agent rules |
| **MCP** | Read-only access to Expensify data you already have permission to see |

[Learn how to manage Copilot access](/articles/new-expensify/settings/Manage-Copilot-Access).

## How can I review actions taken by AI?

How you review an AI action depends on the feature:

- **Concierge** confirms changes in the same chat.
- **Agents** perform actions through Copilot. Actions taken on your account appear as yours and are marked **via Copilot**. You can also Copilot into an agent's account to review its activity.
- **RuleBot** posts its actions on the report. Changes to agent rules are recorded in the workspace's **#admins** room.
- **MCP** is read-only, so connected AI assistants can't make changes to audit in Expensify.

# FAQ

## Do I need to set up AI to use it in Expensify?

No. SmartScan and Concierge are available without additional setup. Agents, agent rules, and MCP connections are optional and require setup if you want those capabilities.

## Is Concierge the same as an agent?

No. Concierge is built into Expensify and responds to requests you make in the moment.

An agent is an AI assistant you create and give standing instructions to so it can perform tasks automatically.

## What's the difference between an agent and RuleBot?

An agent works on behalf of a member and follows that member's instructions. RuleBot works on behalf of a workspace and enforces agent rules created by Workspace Admins.

[Learn more about agents and agent rules](/articles/new-expensify/ai-agents/Understand-How-Agents-Work).

## Can I use multiple AI features together?

Yes. The features can handle different parts of the same expense workflow.

For example, SmartScan can read a receipt, an agent can update the resulting expense, and RuleBot can review the report after it's submitted.

## Can Expensify AI make mistakes?

Yes. AI can occasionally behave unexpectedly. Review AI actions and keep agent and agent rule instructions clear and specific.

[Learn how to write agent instructions](/articles/new-expensify/ai-agents/How-to-Write-Agent-Instructions).

## Can I talk to a human instead of Concierge?

Yes. Ask Concierge to "talk to a human" to connect with Expensify's support team.
