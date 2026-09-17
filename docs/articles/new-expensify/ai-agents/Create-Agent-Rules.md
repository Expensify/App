---
title: Create Agent Rules
description: Create AI-powered workspace rules using natural-language instructions to automate report reviews, routing, approvals, and other actions.
keywords: [agent rules, RuleBot, AI rules, automated approvals, report routing, workspace automation, approval automation, edit agent rule, agent rule history, admins room audit trail, suggested rule, pre-written rule, rule template]
internalScope: Audience is Workspace Admins. Covers creating, managing, and understanding Agent Rules and how RuleBot enforces them. Does not cover Agent management, personal AI features, or Concierge AI.
---

# Create Agent Rules 

Agent rules are AI-powered rules that let Workspace Admins automate report reviews, routing, approvals, and other workspace actions using natural-language instructions.

When you create your first Agent rule, Expensify automatically creates RuleBot, an AI-powered workspace agent that evaluates reports and enforces your Agent rules.

---

## Who can use Agent rules

To create an Agent rule: 

 - You must be a Workspace Admin.
 - **Rules** must be enabled for the workspace.

---

## How to create an Agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**
2. Click **Rules**.
3. In the **Agent rules** section, click **Add agent rule**. The **Suggested** tab opens with a list of recommended rules.
4. Do one of the following:
   - Select a suggested rule, then click **Next** to open it in the **Edit** tab. Use **Find a rule** to search the suggestions.
   - Open the **Edit** tab to write your own rule from scratch.
5. On the **Edit** tab, review or edit the natural-language description of the behavior you want.
6. Click **Save**.

For a list of the available suggested rules, see [Use Suggested Agent Rules](/articles/new-expensify/ai-agents/Use-Suggested-Agent-Rules).

---

## How to write Agent rules

Agent rules are written in natural language. Describe the behavior you want, and RuleBot will monitor reports and take action when the rule applies.

For guidance, examples, and prompt-writing best practices, [learn how to write Agent rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## What happens after an Agent rule is created 

When you create your first Agent rule, Expensify automatically creates RuleBot and adds it to the workspace as a Workspace Admin.

After RuleBot is created, the **Agent rules** section displays **Agent rules are enforced by** followed by **RuleBot**. This indicates which agent enforces all Agent rules in the workspace.

RuleBot immediately begins monitoring report activity and evaluating reports against all configured Agent rules.

Agent rules apply to future report activity, but not existing Paid or Done reports. 

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

## How to edit an Agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace name]**
2. Click **Rules**.
3. In the **Agent rules** section, select the AI rule you want to change.
4. Update the natural-language description of the behavior you want.
5. Click **Save**.

---

## How to delete an Agent rule

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace name]**
2. Click **Rules**.
3. In the **Agent Rules** section, select the AI rule you want to remove.
4. Click **Delete**.

Deleting an Agent rule stops RuleBot from enforcing that rule on future report activity.

---

## How to remove RuleBot from a workspace

RuleBot enforces your Agent rules, so while a workspace still has Agent rules, RuleBot can't be removed, have its role changed, or be deleted. If you attempt any of these actions while Agent rules exist, Expensify blocks the action and shows a message prompting you to delete the Agent rules first.

The following actions are blocked while the workspace still has Agent rules:

 - Removing RuleBot from the workspace using **Remove from workspace** (from the **Members** list or RuleBot's member details page).
 - Changing RuleBot's role to **Member** or **Auditor**. Promoting RuleBot to a **Workspace Admin** is still allowed.
 - Deleting the RuleBot agent using **Delete agent** on the **Agents** page.
 - Closing the RuleBot account.

To remove, demote, or delete RuleBot:

1. Delete every Agent rule in the workspace by following the steps to [delete an Agent rule](#how-to-delete-an-agent-rule) above.
2. Once no Agent rules remain, remove RuleBot from the workspace, change its role, or delete the agent as needed.
## How to review Agent rule changes in the #admins room

Whenever an Agent rule is added, updated, or deleted, Expensify records a system message in your workspace's **#admins** room so admins have a visible history of the change.

 - **Added** and **updated** messages show the rule's title and its full prompt.
 - **Deleted** messages show the rule's title.

The **#admins** room's preview in your chat list shows a concise summary, such as that someone added, updated, or deleted an Agent rule.

Because the **#admins** room is visible only to Workspace Admins, this history stays private to your admin team. To review it, open your workspace's **#admins** room and find the relevant system message.

Learn more about the [#admins room](/articles/new-expensify/chat/Expensify-Chat-Rooms-for-Admins).

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

## Why can't I remove RuleBot from the workspace?

RuleBot enforces your Agent rules, so it can't be removed, demoted, or deleted while the workspace still has Agent rules. Delete every Agent rule in the workspace first, and then you can remove RuleBot, change its role, or delete the agent.

## Where can I see a history of Agent rule changes?

In the workspace's #admins room. Expensify posts a system message there each time an Agent rule is added, updated, or deleted.
