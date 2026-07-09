---
title: Create and Use Agents
description: Create personal agents in New Expensify, chat with them, and Copilot into their accounts. New agents are automatically added as full-access Copilots on your account so they can act on your behalf.
keywords: [custom agents, agents, new agent, ai agent, agent instructions, copilot into account, new expensify]
internalScope: Audience is individual New Expensify users. Covers creating, configuring, and managing agents from the Agents page in Account settings. Does not cover Agent Rules, RuleBot, or workspace-level automation.
---

# Create and Use Agents

Agents are AI-powered virtual members that can take actions in Expensify based on instructions you provide. You write natural-language instructions that tell an agent what to do, and you can chat with an agent or Copilot into its account at any time.

Every agent has its own Expensify account. You can Copilot into the agent's account to review its activity, update its instructions, and see the actions it has taken.

When you create an agent, it's automatically added as a full-access Copilot on your own account. This gives the agent delegated access to your account so it can use your personal context and manage expenses and reports on your behalf, while continuing to operate from its own account. You can review or remove this access at any time in the **Copilot: Delegated Access** section under **Account > Security**.

Expensify also supports Agent rules, which are workspace-level AI automations enforced by RuleBot. [Learn how to Create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules). 

---

## Who can use Agents

Agents are currently available through an open beta program. If you’d like to try Agents and provide feedback, contact Concierge to request access.

If the beta is enabled on your account, you can create an agent. When the feature is available to you, an **Agents** option appears in your **Account** settings

If you don't see **Agents** in your **Account** settings, the Beta isn't enabled on your account yet.

---

## How to create an Agent

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Review the auto-generated profile image and display name. If needed, you can edit these later.
5. Click **Write custom instructions** and describe what you want the agent to do.
6. Review the note above the **Create agent** button, which explains that the agent will be added as a full copilot of your account so it can act on your behalf.
7. Click **Create agent**.

After saving, the new agent appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** buttons.

![The Agents page in Account settings, showing the New agent button and a list of created agents]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-1.png){:width="100%"}

---

## What happens after you create an agent

After you create an agent:

- A new Expensify account is created for the agent.
- You become the agent's owner.
- You're automatically added as a full-access Copilot on the agent's account.
- The agent is automatically added as a full-access Copilot on your own account, so it can use your personal context and act on your behalf.
- The agent appears in your **Agents** list, where you can chat with it, edit its instructions, or Copilot into its account.
- The agent can be added to workspaces as a member and selected anywhere a workspace member can be chosen, such as approval workflows.

The agent follows the instructions you provide and operates from its own Expensify account. Because it's also a Copilot on your account, it can use your personal context and take actions on your behalf. You can review or remove the agent's Copilot access at any time in the **Copilot: Delegated Access** section under **Account > Security**. [Learn how to manage Copilot access](/articles/new-expensify/settings/Manage-Copilot-Access).

---

## How to write instructions for an agent

Agent instructions are written in natural language. Describe the role, responsibilities, and decisions you want the agent to make. Clear, specific instructions generally produce more predictable results than broad or ambiguous instructions.

If you’re unsure how to write instructions, you can chat with the agent and describe the outcome you want. The agent can ask clarifying questions, help draft instructions, and explain how it would behave in a specific situation based on the instructions.

Agent instructions use the same natural-language prompting concepts as Agent rules. For guidance, examples, and prompt-writing best practices, [learn how to write agent rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## How to chat with an agent

To open a direct conversation with an agent:

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to message, then click the chat icon on the agent's row.

---

## How to Copilot into an agent's account

Each agent is its own Expensify account with a profile, inbox, chats, and activity history. When you create an agent, you become its owner and are automatically added as a full-access Copilot.

Use Copilot to see what the agent has done, review its activity, and inspect any actions it has taken on reports.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent in the list and click **Copilot**.

[Learn more about Copilot](/articles/new-expensify/settings/Act-as-a-Copilot).

---

## How to edit an agent's instructions

You can edit an agent's instructions at any time.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to change, then click **Edit**.
4. Click the **Write custom instructions** section.
5. Enter the new instructions you want the agent to follow.
6. Click **Save**.

---

## How to delete an agent

Deleting an agent closes its Expensify account.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to remove, then click **Edit**.
4. Click **Delete agent**.
5. Confirm the deletion.

Deleting an agent can't be undone.

---

## How to use an agent as a workspace approver

Before you can select an agent as an approver, the agent must be added to the workspace as a member. Once added, the agent can be selected anywhere an approver can be selected.

[Learn how to add a new Workspace member](/articles/new-expensify/workspaces/Managing-Workspace-Members#invite-members-to-a-workspace).

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Workflows**.
3. Open the workflow you want to edit, or click **Add approval workflow** to create a new one.
4. Click **Approver**.
5. Choose the agent from the list of workspace members.
6. Click **Save**.

The agent will receive each report submitted through the workflow and determine whether to approve or reject it based on its instructions.

For details on configuring approval workflows generally, see [Learn how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

![Add a Custom Agent as a workspace approver]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-2.png){:width="100%"}

---

# FAQ

## Why can't I see Agents in my Account settings?

Agents are in **Beta** and may not be enabled on your account yet. When the feature is available, an **Agents** option appears in your **Account** settings with a **Beta** badge.

## Who can edit or delete an agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Does an agent have its own Expensify account?

Yes. Each agent is created as a separate Expensify account with its own profile, inbox, chats, and activity history. The account that creates the agent becomes its owner and is automatically added as a full-access Copilot.

## Are agents billed?

An agent is a member of any workspace it's added to and is billed as a workspace member like any other member. Usage-based billing for agent activity is not yet in effect at this release.

## Can I remove myself as a Copilot from an agent I created?

No. The owner is permanently added as a full-access Copilot on the agent's account so you always retain access to review and update the agent.

## Can an agent be added to multiple workspaces?

Yes. An agent is a member like any other and can be added to as many workspaces as you'd like, and selected as an approver in each of their workflows.

## Can I use an agent in multi-step approval workflows?

Yes. On Control plans, agents can be used anywhere an approver can be selected, including multi-step approval workflows.

On Collect plans, workspaces support a single approver. An agent can be used as that approver.

## Is an agent added as a Copilot on my own account?

Yes. When you create an agent, it's automatically added as a full-access Copilot on your own account, giving it delegated access to your personal context so it can manage your expenses and reports on your behalf. You can review or remove this access at any time in the **Copilot: Delegated Access** section under **Account > Security**. [Learn how to manage Copilot access](/articles/new-expensify/settings/Manage-Copilot-Access).

## Can an agent make mistakes?

Yes. Agents follow natural-language instructions and are powered by AI, so they may occasionally behave unexpectedly. Write clear, specific instructions and review what an agent does.

