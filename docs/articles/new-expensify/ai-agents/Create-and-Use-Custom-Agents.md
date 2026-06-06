---
title: Create and Use Custom Agents
description: Create, configure, and manage AI-powered agents that act as approvers in your workspace approval workflows.
keywords: [custom agents, AI agent, workflow agent, approval agent, agent approver, automated approval, AI approver, workspace approver, custom approver, agent prompt, agent copilot]
internalScope: Audience is Workspace Admins and account owners. Covers how to create, configure, chat with, and delete custom agents, and how to add an agent as an approver in a workspace approval workflow. Does not cover Concierge AI, billing for agent credits, or personal agent usage in DMs.
---

# Create and Use Custom Agents

Custom Agents are AI-powered virtual members of your Expensify account that can act as approvers in your workspace approval workflows. They follow instructions you write to evaluate reports and approve or reject them according to your company's rules. This allows you to automate approval decisions that may be too complex for standard workflow rules.

Each agent has its own Expensify account with a profile, display name, and instructions you control. You can chat with an agent, copilot into its account to review what it's doing, and add it to a workspace as an approver.

---

## Who can use Custom Agents

Custom Agents are currently available through an open beta program. If you'd like to try Custom Agents and provide feedback, contact Concierge to request access.

Anyone with an Expensify account can create a Custom Agent once beta access is enabled on their account.

To add a Custom Agent as an approver on a workspace:

 - You must be a Workspace Admin.
 - **Workflows** must be enabled.
 - The Custom Agent must be a member of the workspace.

---

## How to create a Custom Agent

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Review the auto-generated profile image and display name. If needed, you can edit these later.
5. In the **Write custom instructions** field, enter the prompt, or instructions the agent should follow. 
6. Click **Create agent**.

<!-- Screenshot: Account > Agents | Section: | Feature: New Agent -->

![Agents page showing New Agent button]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-1.png){:width="100%"}

You can also create a Custom Agent from the **Set Approver** page by clicking **Create an agent**. Expensify automatically adds the new agent to the workspace as a member and assigns it as an approver.

After saving, the new agent appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** buttons.

---

## How to write instructions for a Custom Agent

The prompt you share in the **Write custom instructions** field tells the agent what to do with each incoming report or chat message. Clear instructions help the agent approve or reject reports consistently.

Useful things to include in an agent's instructions:

- The agent's role (for example, "You review marketing team travel reports.").
- The conditions under which the agent should **Approve** a report.
- The conditions under which the agent should **Reject** a report and what feedback to leave.
- Any escalation rules — for example, "Approve reports under $500; for anything higher, leave a comment asking the submitter to confirm the business purpose."

Instructions are stored in Markdown, so you can use headings, bullets, and bold text to organize complex guidance.

**Example approval prompt:**

```
# Role

You review Marketing team travel reports.

# Approve when

- The report includes a business purpose.
- Each expense has a receipt.
- The total report amount is under $500.

# Reject when

- A receipt is missing.
- The business purpose is unclear.

When rejecting a report, leave a comment explaining what information is missing.
```
---

## How to chat with a Custom Agent

To open a direct conversation with a Custom Agent:

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent in the list and click **Chat**.

The agent will respond using its current instructions. Use this to test how the agent reacts to different scenarios before adding it to a workflow.

---

## How to Copilot into a Custom Agent account

Each Custom Agent is its own Expensify account with a profile, inbox, chats, and activity history. When you create a Custom Agent, you become its owner and are automatically added as a full-access Copilot.

Use Copilot to see what the agent has done, review its activity, and inspect any actions it has taken on reports.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent in the list and click **Copilot**.

[Learn more about Copilot](/articles/new-expensify/settings/Copilot-Access.md).

---

## How to edit a Custom Agent's instructions

You can edit an agent's profile image, display name, and instructions at any time.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **Edit** on the agent you want to update.
4. Update the profile image, display name, or instructions.
5. Click **Save**.

Updated instructions apply to all future reports and chat messages the agent receives.

---

## How to delete a Custom Agent

Deleting a Custom Agent closes its Expensify account. 

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Account**.
2. Click **Agents**.
3. On the agent you want to remove, click **Delete**.
4. Confirm the deletion.

If the agent is currently set as an approver on any workflow, remove it from those workflows first. [Learn how to edit or delete a workflow](/articles/new-expensify/workspaces/Add-Approvals#edit-or-delete-approval-workflows). 

---

## How to use a Custom Agent as an approver

Before you can select a Custom Agent as an approver, the agent must be a member of the workspace.

If the agent was created from a workflow setup flow, Expensify automatically adds it to the workspace. Otherwise, add the agent as a workspace member first.

[Learn how to add a Custom Agent to a Workspace](/articles/new-expensify/workspaces/Managing-Workspace-Members#invite-members-to-a-workspace).

Once an agent is added to a workspace as a member, you can select it as an approver anywhere you'd choose a person:

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces**.
2. Click your workspace name.
3. Click **Workflows**.
4. Click the workflow you want to edit, or click **Add approval workflow** to create a new one.
5. Click **Approver**.
6. Choose the agent from the list of workspace members.
7. Click **Save**.

The agent will receive each report submitted into the workflow and decide whether to **Approve** or **Reject** it based on its instructions.

For details on configuring approval workflows generally, [learn how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

<!-- Screenshot: Workspaces > Workspace Name > Workflows | Section: Approvals | Feature: Approver -->

![Workspace Workflows page showing Approvals section with a workflow configured]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-2.png){:width="100%"}

## What happens after a Custom Agent reviews a report

 - The agent receives reports assigned to its approval step and evaluates them using its current instructions.
 - When the agent approves a report, the workflow continues to the next approval step.
 - When the agent rejects a report, the submitter receives the agent's feedback and can update and resubmit the report.

Changes you make to the agent's instructions apply to future reports and conversations. You can chat with the agent to test updated instructions before using them in a workflow.

---

# FAQ

## Who can edit or delete a Custom Agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Are Custom Agents billed?

An agent is a member of any workspace it's added to and is billed as a workspace member like any other member. Usage-based billing for agent activity is not yet in effect at this release.

## Can I remove myself as a Copilot from a Custom Agent I created?

No. The owner is permanently added as a full-access Copilot on the agent's account so you always retain access to review and update the agent.

## What happens if my agent approves or rejects a report unexpectedly?

Copilot into the agent's account, open the **AI Prompt** page, and review the current instructions. Adjust the instructions so the agent handles that scenario the way you want, then click **Save**.

## Can a Custom Agent be added to multiple workspaces?

Yes. An agent is a member like any other and can be added to as many workspaces as you'd like, and selected as an approver in each of their workflows.

## Can I use a Custom Agent in multi-step approval workflows?

Yes. On Control plans, Custom Agents can be used anywhere an approver can be selected, including multi-step approval workflows.

On Collect plans, workspaces support a single approver. A Custom Agent can be used as that approver.
