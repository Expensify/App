---
title: Automate Workflows with Agent Rules
description: Create and manage agent rules that use AI to automate expense reviews, approvals, routing, and other report actions in your workspace.
keywords: [Agent rules, RuleBot, AI automation, workspace automation, workflow automation, expense approvals, report routing, AI rules, edit agent rule, agent rule history, admins room audit trail, suggested rule, pre-written rule, rule template]
internalScope: Audience is workspace admins. Covers creating, managing, and deleting agent rules, how RuleBot enforces them, how to use RuleBot as a workspace approver, and how to review agent rule changes in the #admins room. Does not cover personal agents, agent templates, general approval workflow configuration, or best practices for writing agent instructions.
contentType: task
order: 3
---

# Automate Workflows with Agent Rules

Agent rules let workspace admins automate expense reviews, routing, approvals, and other workspace actions using natural-language instructions.

You can use one of Expensify's suggested agent rules as a starting point or create your own custom rules.

When you create your first agent rule, Expensify automatically creates RuleBot, an AI-powered workspace agent that evaluates reports and enforces your agent rules.

To learn how agent rules work, how they differ from personal agents, and how RuleBot uses your instructions, see [Understand How Agents Work](/articles/new-expensify/ai-agents/Understand-How-Agents-Work).

---

## Who can use agent rules

To create an agent rule: 

 - You must be a workspace admin.
 - **Rules** must be enabled for the workspace.

---

## How to create an agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Add rule**.
4. Select **Describe agent rule**.
5. Choose a pre-written rule from the **Suggested** list and select **Next**, or select **Edit** to write your own rule.
6. Review or edit the natural-language description of the behavior you want.
7. Select **Create rule**.

For a list of the available suggested rules, see [Use Suggested Agent Rules](/articles/new-expensify/ai-agents/Use-Suggested-Agent-Rules).

---

## How to write agent rules

Agent rules are written in natural language. Describe the behavior you want, and RuleBot will monitor reports and take action when the rule applies.

For guidance, examples, and prompt-writing best practices, see [How to Write Agent Instructions](/articles/new-expensify/ai-agents/How-to-Write-Agent-Instructions).

---

## What happens after an agent rule is created 

When you create your first agent rule, Expensify automatically creates RuleBot and adds it to the workspace as a workspace admin. A confirmation, **RuleBot has been added to your workspace!**, lets you know.

After RuleBot is created, the **Agents** tab lists your saved agent rules and displays **Agent rules are enforced by** followed by **RuleBot**. This indicates which agent enforces all agent rules in the workspace.

RuleBot immediately begins monitoring report activity and evaluating reports against all configured agent rules.

Agent rules apply to future report activity, but not existing Paid or Done reports. 

---

## How to add RuleBot as an approver

After RuleBot is created, you can add it to an approval workflow the same way you would add any other workspace member.

When RuleBot receives a report as an approver, it evaluates the report against the agent rules configured for the workspace and takes the appropriate action.

To add RuleBot as an approver, see [Add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

## How RuleBot enforces agent rules

RuleBot is an AI-powered workspace agent that enforces agent rules. 

RuleBot can operate as a workspace observer that monitors reports and applies agent rules, and as the designated approver in a workflow. 

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

Depending on the agent rules you configure, RuleBot can:

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

## How to edit an agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select the **Agents** tab.
4. Select the agent rule you want to change.
5. Edit the natural-language description of the behavior you want.
6. Select **Save**.

---

## How to delete an agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select the **Agents** tab.
4. Select the agent rule you want to delete.
5. Select **Delete**.
6. Select **Delete** again to confirm.

Deleting an agent rule stops RuleBot from enforcing that rule on future report activity.

---

## How to remove RuleBot from a workspace

RuleBot enforces your agent rules, so while a workspace still has agent rules, RuleBot can't be removed, have its role changed, or be deleted. If you attempt any of these actions while agent rules exist, Expensify blocks the action and shows a message prompting you to delete the agent rules first.

The following actions are blocked while the workspace still has agent rules:

 - Removing RuleBot from the workspace using **Remove from workspace** (from the **Members** list or RuleBot's member details page).
 - Changing RuleBot's role to **Member** or **Auditor**. Promoting RuleBot to **Admin** is still allowed.
 - Deleting the RuleBot agent using **Delete agent** on the **Agents** page.
 - Closing the RuleBot account.

To remove, demote, or delete RuleBot:

1. Delete every agent rule in the workspace by following the steps to [delete an agent rule](#how-to-delete-an-agent-rule) above.
2. Once no agent rules remain, remove RuleBot from the workspace, change its role, or delete the agent as needed.

---

## How to review agent rule changes in the #admins room

Whenever an agent rule is added, updated, or deleted, Expensify records a system message in your workspace's **#admins** room so admins have a visible history of the change.

 - **Added** and **updated** messages show the rule's title and its full prompt.
 - **Deleted** messages show the rule's title.

The **#admins** room's preview in your chat list shows a concise summary, such as that someone added, updated, or deleted an agent rule.

Because the **#admins** room is visible only to workspace admins, this history stays private to your admin team. To review it, open your workspace's **#admins** room and find the relevant system message.

Learn more about the [#admins room](/articles/new-expensify/chat/Expensify-Chat-Rooms-for-Admins).

---

# FAQ

## Can agent rules make mistakes?

Yes. Agent rules are evaluated by an LLM and may occasionally behave unexpectedly.

Review AI-generated actions and instructions carefully. The agent rules page includes a reminder that AI-generated decisions may not always be correct.

## Do agent rules apply to existing reports?

No. Agent rules are not retroactively applied to existing **Paid** or **Done** reports. 

## How much report history can RuleBot review?

When evaluating a report, RuleBot can review the 50 most recent report actions, including system messages describing previous actions it has taken on the report.

## Do I need to create or manage RuleBot?

No. RuleBot is created automatically when you add your first agent rule and is managed by Expensify.

## Why can't I remove RuleBot from the workspace?

RuleBot enforces your agent rules, so it can't be removed, demoted, or deleted while the workspace still has agent rules. Delete every agent rule in the workspace first, and then you can remove RuleBot, change its role, or delete the agent.

## Can I use RuleBot in an approval workflow?

Yes. As a workspace member, RuleBot can be used anywhere an approver can be selected, including multi-step approval workflows.

## Where can I see a history of agent rule changes?

In the workspace's #admins room. Expensify posts a system message there each time an agent rule is added, updated, or deleted.
