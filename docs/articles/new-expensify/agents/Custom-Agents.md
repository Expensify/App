---
title: Custom Agents
description: Create AI-powered agents that act as approvers in your workspace approval workflows.
keywords: [custom agents, AI agent, workflow agent, approval agent, agent approver, automated approval, AI approver, workspace approver, custom approver, agent prompt, agent copilot]
internalScope: Audience is Workspace Admins and account owners. Covers how to create, configure, chat with, and delete custom agents, and how to add an agent as an approver in a workspace approval workflow. Does not cover Concierge AI, billing for agent credits, or personal agent usage in DMs.
---

# Custom Agents

Custom Agents are AI-powered virtual members of your Expensify account that can act as approvers in your workspace approval workflows. They follow instructions you write to evaluate reports and approve or reject them according to your company's rules, which is useful when your approval logic is more complex than what the standard Rules engine supports.

Each agent has its own Expensify account with a profile, display name, and instructions you control. You can chat with an agent, copilot into its account to review what it's doing, and add it to a workspace as an approver.

---

## Who can use Custom Agents

- **Available to:** Anyone with an Expensify account can create personal agents. Adding an agent as an approver requires a workspace with the **Workflows** feature enabled.
- **Plans:** Custom workflows that include agents require the **Control** plan. On **Collect** workspaces, an agent can replace the existing approver in the default workflow.
- **Permissions:** Only the agent's owner can edit its instructions or delete it. The owner is added as a full-access copilot when the agent is created and cannot be removed.

---

## How to create a Custom Agent from your account

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Settings**.
2. Click **Agents**.
3. Click **Create agent**.
4. Review the auto-generated profile image and display name. You can edit these later.
5. Enter the agent's instructions in the prompt field. Describe what the agent should do, when it should approve a report, and when it should reject one.
6. Click **Save**.

<!-- SCREENSHOT:
Suggestion: Settings > Agents page showing the Create agent button and the agents list with one example agent
Location: After the create agent steps
Purpose: Helps users find the entry point for creating an agent
-->

After saving, the new agent appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** buttons.

---

## How to create a Custom Agent from a workspace approval workflow

You can also create an agent directly while configuring an approval workflow:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name.
3. Click **Workflows**.
4. On the workflow card, click the **agent+** button.
5. If you don't already own an agent, the **Create agent** form opens. Fill in the profile, display name, and instructions, then click **Save**.
6. Expensify adds the agent to the workspace as a member and sets it as the first approver.

On a **Control** workspace, the agent is inserted at the beginning of the existing approval chain. On a **Collect** workspace, the agent replaces the current approver. To add a human approver after the agent on Collect, upgrade to the Control plan.

You can also reach this flow from the **Set Approver** page within workflow settings by clicking the **Create an agent** row.

---

## How to write instructions for a Custom Agent

The instructions you save in the prompt field tell the agent what to do with each incoming report or chat message. Clear instructions help the agent approve or reject reports consistently.

Useful things to include in an agent's instructions:

- The agent's role (for example, "You review marketing team travel reports.").
- The conditions under which the agent should **Approve** a report.
- The conditions under which the agent should **Reject** a report and what feedback to leave.
- Any escalation rules — for example, "Approve reports under $500; for anything higher, leave a comment asking the submitter to confirm the business purpose."

Instructions are stored in Markdown, so you can use headings, bullets, and bold text to organize complex guidance.

---

## How to chat with a Custom Agent

To open a direct conversation with an agent:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Settings**.
2. Click **Agents**.
3. Find the agent in the list and click **Chat**.

The agent will respond using its current instructions. Use this to test how the agent reacts to different scenarios before adding it to a live workflow.

---

## How to Copilot into a Custom Agent account

You are automatically added as a full-access copilot on every agent you create. Use Copilot to see what the agent has done, review its activity, and inspect any actions it has taken on reports.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Settings**.
2. Click **Agents**.
3. Find the agent in the list and click **Copilot**.

While copiloting into the agent account, you can review its **Profile**, its current instructions on the **AI Prompt** page, and the chats and reports it has acted on.

[Learn more about Copilot](/articles/new-expensify/settings/Add-or-Act-as-a-Copilot).

---

## How to edit a Custom Agent's instructions

You can edit an agent's profile image, display name, and instructions at any time.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Settings**.
2. Click **Agents**.
3. Click **Edit** on the agent you want to update.
4. Update the profile image, display name, or instructions.
5. Click **Save**.

Updated instructions apply to all future reports and chat messages the agent receives.

---

## How to delete a Custom Agent

Deleting an agent closes its Expensify account. If the agent is currently set as an approver on any workflow, remove it from those workflows first.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Settings**.
2. Click **Agents**.
3. Click **Delete** on the agent you want to remove.
4. Confirm the deletion.

---

## How to use a Custom Agent as an approver

Once an agent is added to a workspace as a member, you can select it as an approver anywhere you'd choose a person:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name.
3. Click **Workflows**.
4. Open the workflow you want to edit, or click **Add approval workflow** to create a new one.
5. Click **Approver**.
6. Choose the agent from the list of workspace members.
7. Click **Save**.

The agent will receive each report submitted into the workflow and decide whether to **Approve** or **Reject** it based on its instructions.

For details on configuring approval workflows generally, see [Learn how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

# FAQ

## Who can edit or delete a Custom Agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Are Custom Agents billed?

An agent is a member of any workspace it's added to and is billed as a workspace member like any other member. Usage-based billing for agent activity is not yet in effect at this release.

## Can I remove myself as a Copilot from a Custom Agent I created?

No. The owner is permanently added as a full-access copilot on the agent's account so you always retain access to review and update the agent.

## What happens if my agent approves or rejects a report unexpectedly?

Copilot into the agent's account, open the **AI Prompt** page, and review the current instructions. Adjust the instructions so the agent handles that scenario the way you want, then click **Save**.

## Can a Custom Agent be added to multiple workspaces?

Yes. An agent is a member like any other and can be added to as many workspaces as you'd like, and selected as an approver in each of their workflows.
