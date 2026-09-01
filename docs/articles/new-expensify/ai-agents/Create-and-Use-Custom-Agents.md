---
title: Create and Use Agents
description: Create personal agents in New Expensify, chat with them, and Copilot into their accounts. New agents are automatically added as full-access Copilots on your account so they can act on your behalf.
keywords: [custom agents, agents, new agent, ai agent, agent instructions, agent template, build custom agent, copilot into account, agent copilot permissions, agent edit expenses, agent edit access, new expensify]
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

When you click **New agent**, the **New agent** screen opens. From here you can build an agent from scratch with **Build custom agent**, or, when starter templates are available, choose one from the **Or start with a template:** list. If no templates are available, only the **Build custom agent** option appears.

**To build a custom agent from scratch:**

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Click **Build custom agent**.
5. Review the auto-generated profile image and display name. If needed, you can edit these later.
6. Click **Write custom instructions** and describe what you want the agent to do.
7. Review the note above the **Create agent** button, which explains that the agent will be added as a full-access Copilot of your account so it can act on your behalf.
8. Click **Create agent**.

**To start from a template:**

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Under **Or start with a template:**, find the template you want, then click **Add**.
5. Review the pre-filled instructions and edit them if needed.
6. Review the auto-generated profile image and display name. If needed, you can edit these later.
7. Click **Create agent**.

After you click **Create agent**, you're taken directly to a direct message (DM) with the new agent, where its welcome message appears once it arrives. The new agent also appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** buttons.

![The Agents page in Account settings, showing the New agent button and a list of created agents]({{site.url}}/assets/images/ExpensiHelp-CustomAgents-1.png){:width="100%"}

---

## What happens after you create an agent

After you create an agent:

- You're taken directly to a DM with the agent, where its welcome message appears once it arrives.
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

You can also delete an agent while [Copiloting into its account](#how-to-copilot-into-an-agents-account):

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Security**.
3. Click **Close account**.
4. In the **Delete agent?** confirmation, click **Delete**.

Deleting the agent from the **Security** page also ends the Copilot session and returns you to your own account. This step requires an internet connection.

Deleting an agent can't be undone.

If the agent still has reports awaiting its approval, the deletion fails and an error appears on the agent's row asking you to review those reports first. Approve, reject, or reassign the outstanding reports, then delete the agent again.

---

## How to delete multiple agents at once

You can select several agents from the **Agents** list and delete them together.

**On web:**

1. In the navigation tabs on the left, click **Account** > **Agents**.
2. Select the checkbox next to each agent you want to delete.
3. Click the button that shows the number of agents selected (for example, **2 selected**).
4. Select **Delete agents**.
5. Click **Delete** to confirm.

**On mobile:**

1. In the navigation tabs on the bottom, tap **Account** > **Agents**.
2. Long-press an agent, then tap **Select** to enter selection mode.
3. Select each additional agent you want to delete.
4. Tap the button that shows the number of agents selected (for example, **2 selected**).
5. Select **Delete agents**.
6. Tap **Delete** to confirm.

The selected agents are deleted and you stay on the **Agents** list. Deleting agents can't be undone.

<!-- SCREENSHOT:
Suggestion: The Agents list with row checkboxes selected and the selected-count button open showing the Delete agents option
Location: How to delete multiple agents at once
Purpose: Shows where row selection and the bulk Delete agents action appear
-->

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

## What's the difference between building a custom agent and starting from a template?

**Build custom agent** opens the agent form so you can write your own instructions from scratch. Starting from a template on the **New agent** screen opens the same form with the template's instructions already filled in, which you can review and edit before creating the agent. If no templates are available, only the **Build custom agent** option appears.

## Who can edit or delete an agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Why can't I delete an agent?

If the agent is a workspace approver and has reports awaiting its approval, the deletion fails and an error appears on the agent's row. Review the outstanding reports (approve, reject, or reassign them to another approver), then delete the agent again.

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

Yes. When you create an agent, it's automatically added as a full-access Copilot on your own account, giving it delegated access to your personal context so it can manage your expenses and reports on your behalf. You don't need to add it by hand. You can review or remove this access at any time in the **Copilot: Delegated Access** section under **Account > Security**. [Learn how to manage Copilot access](/articles/new-expensify/settings/Manage-Copilot-Access).

## What can an agent do as a Copilot on my account?

A Copilot agent manages your expenses and reports with the same permissions you have. It can view, create, and edit your expenses, submit and manage your reports, and look up your expense data. Every action it takes is recorded as yours, marked **via Copilot**, so there is a full audit trail. A few account-level actions stay with you as the owner. For example, a Copilot can't add or remove other Copilots.

You don't need to grant the agent any special edit access, and you don't need to add it as an approver for it to manage your own expenses — its full-access Copilot role already covers that. Adding an agent as an approver is only for reviewing reports that other members submit to it through an approval workflow.

Some edit limits apply to everyone, no matter who is editing. Common examples:

- The amount of a company card transaction can't be changed — it comes from the card feed.
- The amount and date of an expense can't be changed once its report is Approved or Reimbursed.
- Editing another member's expenses is only possible when you (the account the agent acts for) have admin or approver authority over that member's report.

These are common examples, not a complete list. Other field-specific rules also apply. For example, you can't edit the amount, currency, or merchant of a per-diem expense. If an agent says it can't make a specific change, it is usually one of these edit locks and not a missing permission on the agent.

## Why does the Security page look different when I Copilot into an agent?

When you Copilot into an agent's account and open **Account > Security**, some options are adjusted because you're managing an agent rather than a real member's account:

- **Device management** and **Merge accounts** are hidden, since they don't apply to an agent.
- **Close account** deletes the agent and ends the Copilot session instead of opening the standard close-account flow.

## Can an agent make mistakes?

Yes. Agents follow natural-language instructions and are powered by AI, so they may occasionally behave unexpectedly. Write clear, specific instructions and review what an agent does.

