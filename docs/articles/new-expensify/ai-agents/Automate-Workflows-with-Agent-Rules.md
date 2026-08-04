---
title: Automate Workflows with Agent Rules
description: Create and manage Agent rules that use AI to automate expense reviews, approvals, routing, and other report actions in your workspace.
keywords: [Agent rules, RuleBot, AI automation, workspace automation, workflow automation, expense approvals, report routing, AI rules]
internalScope: Audience is Workspace Admins. Covers creating, managing, and deleting Agent rules, how RuleBot enforces them, and how to use RuleBot as a workspace approver. Does not cover personal Agents, Agent templates, general approval workflow configuration, or best practices for writing Agent instructions.
contentType: task
---

# Automate Workflows with Agent Rules

Agent rules let Workspace Admins automate expense reviews, routing, approvals, and other workspace actions using natural-language instructions.

You can use one of Expensify's suggested Agent rules as a starting point or create your own custom rules.

When you create your first Agent rule, Expensify automatically creates RuleBot to enforce those rules.

To learn how Agent rules work, how they differ from personal Agents, and how RuleBot uses your instructions, see [Understand How AI Agents Work in Expensify](/articles/new-expensify/ai-agents/Understand-How-AI-Agents-Work-in-Expensify).

---

## Who can use Agent rules

To create an Agent rule: 

 - You must be a Workspace Admin.
 - **Rules** must be enabled for the workspace.

---

## How to create an Agent rule from Expensify's Suggested rules 

You can use a pre-defined **Suggested** Agent rule as a starting point for your own Agent rule. Review and edit the natural-language instructions before saving the rule. 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**
2. Select **Rules**.
3. In the **Agent rules** section, select **Add agent rule**.
4. Select **Suggested**.
5. Choose a rule from the list and select **Next**.
6. On the **Edit** tab, review or edit the natural-language description of the behavior you want.
7. Select **Save**.
   
---

## How to an Agent rule from a custom description 

If none of the Suggested Agent rules match your workflow, you can create your own by writing natural-language instructions.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**
2. Select **Rules**.
3. In the **Agent rules** section, select **Add agent rule**.
4. Select **Edit**.
5. Enter a natural-language description of the behavior you want to enforce.
6. Select **Save**.

For guidance, examples, and prompt-writing best practices, [learn how to write Agent rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## What happens after you create an Agent rule

When you create your first Agent rule, Expensify automatically creates RuleBot and adds it to the workspace as a Workspace Admin.

After RuleBot is created, the **Agent rules** section displays **Agent rules are enforced by** followed by **RuleBot**, indicating which AI Agent enforces your workspace's Agent rules.

RuleBot immediately begins monitoring report activity and evaluating reports against all configured Agent rules.

---

## How to add RuleBot as an approver

After RuleBot is created, you can add it to an approval workflow the same way you would add any other workspace member.

When RuleBot receives a report as an approver, it evaluates the report against the Agent rules configured for the workspace and takes the appropriate action.

To add RuleBot as an approver, see [Add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

## How RuleBot enforces Agent rules

RuleBot is an AI-powered workspace agent that enforces Agent rules. 

RuleBot can operate as a workspace observer that monitors reports and applies Agent rules, and as the designated approver in a workflow. 

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

Depending on the Agent rules you configure, RuleBot can:

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

## How to delete an Agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace name]**
2. Click **Rules**.
3. In the **Agent Rules** section, select the AI rule you want to remove.
4. Click **Delete**.

Deleting an Agent rule stops RuleBot from enforcing that rule on future report activity.

---

# FAQ

## Can Agent rules make mistakes?

Yes. Agent rules are evaluated by an LLM and may occasionally behave unexpectedly.

Review AI-generated actions and instructions carefully. The Agent rules page includes a reminder that AI-generated decisions may not always be correct.

## Do Agent rules apply to existing reports?

No. Agent rules are not retroactively applied to existing **Paid** or **Done** reports. 

## How much report history can RuleBot review?

When evaluating a report, RuleBot can review the 50 most recent report actions, including system messages describing previous actions it has taken on the report.

## Do I need to create or manage RuleBot?

No. RuleBot is created automatically when you add your first Agent rule and is managed by Expensify.

## Can I use an Rulebot as a approval workflow? 

Yes. On Control plans, agents can be used anywhere an approver can be selected, including multi-step approval workflows.

On Collect plans, workspaces support a single approver. An agent can be used as that approver
