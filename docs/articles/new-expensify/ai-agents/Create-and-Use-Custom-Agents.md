---
title: Create and Use Custom Agents
description: Create personal Custom Agents in New Expensify to handle your workflow, then chat with them, Copilot into them, edit, or delete them.
keywords: [custom agents, agents, new agent, ai agent, agent instructions, copilot into account, new expensify]
internalScope: Audience is individual New Expensify users. Covers creating, configuring, and managing personal Custom Agents from the Agents page in Account settings. Does not cover Agent Rules, RuleBot, or workspace-level automation.
---

# Create and Use Custom Agents

Custom Agents are AI-powered virtual members of your Expensify account that can take actions based on instructions you provide. You write natural-language instructions that tell an agent what to do, and you can chat with an agent or Copilot into its account at any time.

Each Custom Agent has its own Expensify account with a profile, display name, and instructions you control. 

Expensify also supports Agent Rules, which are workspace-level AI automations enforced by RuleBot. [Learn how to Create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules). 

---

## Who can use Agents

Custom Agents are currently available through an open beta program. If you’d like to try Custom Agents and provide feedback, contact Concierge to request access.

If the beta is enabled on your account, you can create a Custom Agent. When the feature is available to you, an **Agents** option appears in your **Account** settings with a **Beta** badge.

If you don't see **Agents** in your **Account** settings, the Beta isn't enabled on your account yet.

---

## How to create a Custom Agent

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Review the auto-generated profile image and display name. If needed, you can edit these later.
5. Click **Write custom instructions** and describe what you want the agent to do.
6. Click **Create agent**.

After saving, the new agent appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** buttons.

![The Agents page in Account settings, showing the New agent button and a list of created agents]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-1.png){:width="100%"}

---

## What happens after you create a Custom Agent

After you create a Custom Agent:

- A new Expensify account is created for the agent.
- You become the agent's owner.
- You're automatically added as a full-access Copilot on the agent's account.
- The agent appears in your **Agents** list, where you can chat with it, edit its instructions, or Copilot into its account.
- The agent can be added to workspaces as a member and selected anywhere a workspace member can be chosen, such as approval workflows.

---

## How to write instructions for a Custom Agent

Agent instructions are written in natural language. Describe the role, responsibilities, and decisions you want the agent to make. Clear, specific instructions generally produce more predictable results than broad or ambiguous instructions.

If you’re unsure how to write instructions, you can chat with the agent and describe the outcome you want. The agent can ask clarifying questions, help draft instructions, and explain how it would behave in a specific situation based on the instructions.

Custom Agent instructions use the same natural-language prompting concepts as Agent Rules. For guidance, examples, and prompt-writing best practices, [learn how to write Agent Rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## How to chat with a Custom Agent

To open a direct conversation with a Custom Agent:

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to message, then click the chat icon on the agent's row.

---

## How to Copilot into a Custom Agent's account

Each Custom Agent is its own Expensify account with a profile, inbox, chats, and activity history. When you create a Custom Agent, you become its owner and are automatically added as a full-access Copilot.

Use Copilot to see what the agent has done, review its activity, and inspect any actions it has taken on reports.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent in the list and click **Copilot**.

[Learn more about Copilot](/articles/new-expensify/settings/Copilot-Access).

---

## How to edit a Custom Agent's instructions

You can edit a Custom Agent's instructions at any time.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to change, then click **Edit**.
4. Click the **Write custom instructions** section.
5. Enter the new instructions you want the agent to follow.
6. Click **Save**.

---

## How to delete a Custom Agent

Deleting a Custom Agent closes its Expensify account.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to remove, then click **Edit**.
4. Click **Delete agent**.
5. Confirm the deletion.

Deleting an agent can't be undone.

---

## How to use a Custom Agent as a workspace approver

Before you can select a Custom Agent as an approver, the agent must be added to the workspace as a member. Once added, the agent can be selected anywhere an approver can be selected.

[Learn how to add a new Workspace member](/articles/new-expensify/workspaces/Managing-Workspace-Members#invite-members-to-a-workspace).

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Workflows**.
3. Open the workflow you want to edit, or click **Add approval workflow** to create a new one.
4. Click **Approver**.
5. Choose the agent from the list of workspace members.
6. Click **Save**.

The agent will receive each report submitted through the workflow and determine whether to approve or reject it based on its instructions.

For details on configuring approval workflows generally, see [Learn how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

# FAQ

## Why can't I see Agents in my Account settings?

Custom Agents are in **Beta** and may not be enabled on your account yet. When the feature is available, an **Agents** option appears in your **Account** settings with a **Beta** badge.

## Who can edit or delete a Custom Agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Does a Custom Agent have its own Expensify account?

Yes. Each Custom Agent is created as a separate Expensify account with its own profile, inbox, chats, and activity history. The account that creates the agent becomes its owner and is automatically added as a full-access Copilot.

## Are Custom Agents billed?

An agent is a member of any workspace it's added to and is billed as a workspace member like any other member. Usage-based billing for agent activity is not yet in effect at this release.

## Can I remove myself as a Copilot from a Custom Agent I created?

No. The owner is permanently added as a full-access Copilot on the agent's account so you always retain access to review and update the agent.

## Can a Custom Agent be added to multiple workspaces?

Yes. An agent is a member like any other and can be added to as many workspaces as you'd like, and selected as an approver in each of their workflows.

## Can I use a Custom Agent in multi-step approval workflows?

Yes. On Control plans, Custom Agents can be used anywhere an approver can be selected, including multi-step approval workflows.

On Collect plans, workspaces support a single approver. A Custom Agent can be used as that approver.

## Can a Custom Agent make mistakes?

Yes. Custom Agents follow natural-language instructions and are powered by AI, so they may occasionally behave unexpectedly. Write clear, specific instructions and review what an agent does.

