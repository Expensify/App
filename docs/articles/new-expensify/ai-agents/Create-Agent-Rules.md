---
title: Create Agent Rules
description: Create AI-powered workspace rules using natural-language instructions to automate report reviews, routing, approvals, and other actions.
keywords: [agent rules, RuleBot, AI rules, automated approvals, report routing, workspace automation, approval automation]
internalScope: Audience is Workspace Admins. Covers creating, managing, and understanding Agent Rules and how RuleBot enforces them. Does not cover Custom Agent management, personal AI features, or Concierge AI.
---

# Create Agent Rules 

Agent Rules are AI-powered rules that let Workspace Admins automate report reviews, routing, approvals, and other workspace actions using natural-language instructions.

When you create your first Agent Rule, Expensify automatically creates RuleBot, an AI-powered workspace agent that evaluates reports and enforces your Agent Rules.

---

## Who can use Agent Rules

Agent Rules are currently available through an open beta program. If you'd like to try Agent Rules and provide feedback, contact Concierge to request access.

To create an Agent Rule: 

 - You must be a Workspace Admin.
 - The workspace must have access to the Agent Rules beta.
 - **Rules** must be enabled on the workspace.

---
1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**.
## How to create an Agent Rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**
2. Click **Rules**.
3. In the **Agent Rules** section, click **Add AI Rule**.
5. Enter a natural-language description of the behavior you want.
7. Click **Save**.

---

## How to write Agent Rules

Agent Rules are written in natural language. Describe the behavior you want, and RuleBot will monitor reports and take action when the rule applies.

For guidance, examples, and prompt-writing best practices, [learn how to write Agent Rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## What happens after an Agent Rule is created 

When you create your first Agent Rule, Expensify automatically creates RuleBot and adds it to the workspace as a Workspace Admin. A one-time confirmation appears letting you know RuleBot has been added to your workspace, with a link to view and edit the agent's details under **Account > Agents**.

RuleBot immediately begins monitoring report activity and evaluating reports against all configured Agent Rules.

<!-- SCREENSHOT:
Suggestion: The "RuleBot has been added to your workspace!" confirmation shown after saving the first Agent Rule, including the link to Account > Agents.
Location: Under "What happens after an Agent Rule is created"
Purpose: Show users the one-time confirmation state and where to edit the agent.
-->

Agent Rules apply to future report activity, but not existing Paid or Done reports. 

## How RuleBot enforces Agent Rules

RuleBot is an AI-powered workspace agent that enforces Agent Rules. 

RuleBot can operate as a workspace observer that monitors reports and applies Agent Rules, and as the designated approver in a workflow. 

Whenever report activity occurs, RuleBot evaluates the report using:

 - Workspace details
 - All expenses on the report
 - Recent report activity 

Report activity includes actions such as:

 - Adding an expense
 - Submitting a report
 - Posting a comment
 - Editing report details

---

## What actions RuleBot can perform

Depending on the Agent Rules you configure, RuleBot can:

 - Ask the submitter a question
 - Edit an expense
 - Forward a report
 - Approve a report

For example, RuleBot might:

 - Request additional information from a submitter
 - Automatically adjust expenses
 - Route reports to specific approvers
 - Approve certain reports automatically 
   
---
1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**.
## How to delete an Agent Rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**
2. Click **Rules**.
3. In the **Agent Rules** section, select the AI rule you want to remove.
4. Click **Delete**.

Deleting an Agent Rule stops RuleBot from enforcing that rule on future report activity.

---

# FAQ

## Can Agent Rules make mistakes?

Yes. Agent Rules are evaluated by an LLM and may occasionally behave unexpectedly.

Review AI-generated actions and instructions carefully. The Agent Rules page includes a reminder that AI-generated decisions may not always be correct.

## Do Agent Rules apply to existing reports?

No. Agent Rules are not retroactively applied to existing **Paid** or **Done** reports. 

## How much report history can RuleBot review?

When evaluating a report, RuleBot can review the 50 most recent report actions, including system messages describing previous actions it has taken on the report.

## Do I need to create or manage RuleBot?

No. RuleBot is created automatically when you add your first AI Rule. You can view and edit the agent's details under **Account > Agents**.
