---
Title: Learn About AI in Expensify 
Description: Learn which AI features are available in Expensify, what Smartscan, Concierge, agents, agent rules, Rulebot, and MCP do, and which option to use.
Keywords: [AI in Expensify, Expensify AI, Smartscan, Concierge, agents, agent rules, Rulebot, MCP, AI assistants, AI automation, which AI should I use]
Internalscope: Audience is all members and workspace admins. Covers the AI features available in Expensify, what each feature does, how the features work together, and which feature to use for different needs. Does not cover setup steps, writing agent instructions, or detailed capabilities for individual AI features.
Retrievalintent: What AI features does Expensify have, how are they different, and which one should i use?
---

# Learn About AI in Expensify

Expensify uses AI to scan receipts, answer questions, automate expense tasks, enforce workspace rules, and analyze spending.

Some AI features, like Smartscan and Concierge, work automatically or are ready to use without setup. Others, like agents and agent rules, let you create custom automations. You can also connect outside AI assistants to Expensify through MCP.

This article explains what each AI feature does, how the features work together, and which one to use.

## what AI features are available in Expensify?

| AI feature | What it does | Who uses it | Setup required |
| --- | --- | --- | --- |
| **Smartscan** | Reads receipts and fills in expense details | All members | No |
| **Concierge** | Answers questions, performs requested actions, and provides spend insights | All members | No |
| **agents** | Follow your instructions to automate personal expense tasks | All members | Yes |
| **agent rules and Rulebot** | Apply AI-powered rules across a workspace | Workspace admins | Yes |
| **AI assistants through MCP** | Let outside AI tools analyze your Expensify data | All members | Yes |

You don't need to use every AI feature. The right option depends on whether you want help with a one-time task, personal automation, workspace-wide rules, or analysis outside Expensify.

## how does Smartscan use AI?

Smartscan uses AI to read receipts. When you add a receipt, Smartscan extracts details such as the merchant, date, amount, and itemized line items so you don't have to enter them manually. Workspace admins can also use Smartscan to identify prohibited expenses on receipts, such as alcohol or gambling.

[Learn how the prohibited expenses rule works](/articles/new-Expensify/workspaces/prohibited-expense-rule).

## How does Concierge use AI?

Concierge is the AI assistant built into Expensify. It's available without setup and can:

- Answer questions about Expensify and help troubleshoot problems.
- Create or edit expenses and manage reports when you ask.
- Categorize expenses and add them to the appropriate report.
- Answer questions about spending and share spend insights.
- Connect you with a human when you ask or when Concierge can't help.

Concierge is best for help you need in the moment. You ask Concierge to do something, and it responds or takes the requested action.

[Learn more about Concierge](/articles/new-Expensify/Concierge-ai/Concierge-basics).

[Learn what Concierge can do](/articles/new-Expensify/Concierge-ai/what-Concierge-can-do).

## How do agents automate expense tasks?

Agents are personal AI assistants that you create and give instructions to. Each agent has its own Expensify account and works as a copilot on your account, allowing it to act for you.

Unlike Concierge, an agent can follow standing instructions. It can react to events, such as a receipt finishing Smartscan or a report being submitted, and it can run tasks on a schedule.

For example, you could create an agent that:

- Translates foreign receipts.
- Splits hotel bills into separate expenses.
- Performs a recurring expense task on a schedule.

You can also add an agent to a workspace as an approver.

[Learn how to create and use agents](/articles/new-Expensify/ai-agents/create-and-use-agents).

[Learn how to use agent templates](/articles/new-Expensify/ai-agents/use-agent-templates).

## How do agent rules and Rulebot automate workspace rules?

Agent rules let workspace admins describe in plain language how expenses and reports should be handled across a workspace.

Rulebot is the AI that enforces those rules. Expensify creates Rulebot automatically when the first agent rule is added.

Agent rules are useful when a workspace requirement needs interpretation or judgment instead of a fixed condition. For example, an agent rule could:

- Reject a receipt that doesn't match its stated purpose.
- Route reports from a particular team to a specific approver.

An agent generally works on behalf of an individual member. Rulebot works on behalf of the workspace by enforcing agent rules.

Llearn more about agents and agent rules](/articles/new-Expensify/ai-agents/learn-about-agents).

[Learn how to automate workflows with agent rules](/articles/new-Expensify/ai-agents/automate-workflows-with-agent-rules).

## How do AI assistants connect to Expensify through MCP?

The Expensify MCP server lets outside AI tools, such as chatgpt, claude, or cursor, access information from your Expensify account.

Once connected, you can use the AI assistant to search and analyze information such as expenses, reports, and spending trends.

MCP access is read-only. A connected AI assistant can analyze the Expensify data you have permission to see, but it can't create, edit, approve, or delete anything in Expensify.

[Learn how to use the Expensify MCP server with AI assistants](/articles/new-Expensify/connections/connect-ai-assistants/use-the-Expensify-MCP-server-with-ai-assistants).

## How do Expensify AI features work together?

Each AI feature can handle a different part of the expense lifecycle. For example:

1. **Smartscan reads the receipt.** you add a hotel receipt, and Smartscan extracts the merchant, date, amount, and line items.
2. **Concierge organizes the expense.** Concierge categorizes the expense and adds it to the appropriate report.
3. **An agent follows your instructions.** your agent notices that Smartscan has finished and splits the room charge from meals and parking.
4. **Rulebot applies workspace rules.** when you submit the report, Rulebot checks it against the workspace's agent rules and takes the appropriate action.
5. **The approval workflow continues.** the next approver can be a person, an agent, or Rulebot.
6. **AI helps analyze the results.** admins can ask Concierge about spending or analyze Expensify data using an AI assistant connected through MCP.

You don't need to configure this entire sequence. Smartscan and Concierge can work without setup, while agents and agent rules provide additional automation when needed.

## How do AI features work with standard workspace rules?

Standard workspace rules and AI-powered rules serve different purposes.

| Type | Best for | Example |
| --- | --- | --- |
| **Workspace rule** | A fixed condition that should work the same way every time | Flag expenses over $500 |
| **Agent rule** | A condition that requires reading, interpretation, or judgment | Reject receipts that appear to be personal |
| **Concierge** | Explaining a rule or making a supported one-time change when asked | Explain why an expense was flagged |

If a workspace rule can handle the requirement, use that rule. Use an agent rule when the requirement requires interpretation or judgment.

[Learn more about workspace rules](/articles/new-Expensify/workspaces/workspace-rules).

## Which Expensify AI feature should i use?

| If you want to... | Use |
| --- | --- |
| Get an answer or have something done once | Concierge |
| Ask questions about your spending | Concierge or an AI assistant connected through MCP* |
| Analyze Expensify data in chatgpt, claude, or another supported AI tool | MCP |
| Automate recurring tasks on your own expenses | An agent |
| Have AI participate in a report approval workflow | agent rules |
| Apply AI-powered rules across a workspace | agent rules |
| Apply a simple, fixed workspace requirement | A workspace rule |

A useful rule of thumb is to start with Concierge for one-time requests. If the same action needs to happen automatically in the future, consider an agent or agent rule.

## what can each Expensify AI feature access?

AI features can only work within their assigned permissions and purpose.

| AI feature | Access |
| --- | --- |
| **Smartscan** | Receipts you add |
| **Concierge** | Information and actions you already have permission to access |
| **agents** | The access available through their full-access copilot relationship with your account |
| **Rulebot** | Workspace admin access for the workspace where it enforces agent rules |
| **MCP** | Read-only access to Expensify data you already have permission to see |

[Learn how to manage copilot access](/articles/new-Expensify/settings/manage-copilot-access).

## How can I review actions taken by AI?

How you review an AI action depends on the feature:

- **Concierge** confirms changes in the same chat.
- **Agents** perform actions through copilot. Actions taken on your account appear as yours and are marked **via copilot**. You can also copilot into an agent's account to review its activity.
- **Rulebot** posts its actions on the report. Changes to agent rules are recorded in the workspace's **#admins** room.
- **MCP** is read-only, so connected AI assistants can't make changes to audit in Expensify.

# FAQ

## Do I need to set up AI to use it in Expensify?

No. Smartscan and Concierge are available without additional setup. Agents, agent rules, and MCP connections are optional and require setup if you want those capabilities.

## Is Concierge the same as an agent?

No. Concierge is built into Expensify and responds to requests you make in the moment.

An agent is an AI assistant you create and give standing instructions to so it can perform tasks automatically.

## What's the difference between an agent and Rulebot?

An agent works on behalf of a member and follows that member's instructions. Rulebot works on behalf of a workspace and enforces agent rules created by workspace admins.

[Learn more about agents and agent rules](/articles/new-Expensify/ai-agents/learn-about-agents).

## Can I use multiple AI features together?

Yes. The features can handle different parts of the same expense workflow.

For example, Smartscan can read a receipt, an agent can update the resulting expense, and Rulebot can review the report after it's submitted.

## Can Expensify AI make mistakes?

Yes. AI can occasionally behave unexpectedly. Review AI actions and keep agent and agent rule instructions clear and specific.

[Learn how to write agent instructions](/articles/new-Expensify/ai-agents/how-to-write-agent-instructions).

## can i talk to a human instead of Concierge?

Yes. Ask Concierge to "talk to a human" to connect with Expensify's support team.

## who can use Expensify AI features?

Smartscan, Concierge, and MCP are available to all members.

Agents are in beta, so contact Concierge to request access.

Agent rules require a workspace admin role, a workspace on the control plan, and the **rules** feature enabled on the workspace.
