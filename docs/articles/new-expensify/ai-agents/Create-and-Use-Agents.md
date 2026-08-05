---
title: Create and Use Agents
description: Create, edit, chat with, Copilot into, and delete personal AI Agents that help automate your workflows.
keywords: [Agents, personal agents, custom agent, AI agent, create agent, manage agent, Copilot, delegated access]
internalScope: Audience is members with access to Agents. Covers creating, configuring, managing, chatting with, Copiloting into, and deleting personal Agents. Does not cover Agent rules, RuleBot, agent templates, or best practices for writing agent instructions.
retrievalIntent: How do I create and use a personal Agent?
contentType: task
---

# Create and Use Agents

Agents are AI assistants that help automate your personal workflows in Expensify.

Anyone can create an agent under **Account > Agents**. Each Agent is created as its own Expensify account and is automatically added as a full-access Copilot on your account so it can use your personal context and perform tasks on your behalf.

To learn how Agents work, how they differ from Agent rules, and how AI uses instructions, see [Understand How AI Agents Work in Expensify](/articles/new-expensify/ai-agents/Understand-How-AI-Agents-Work-in-Expensify).

---

## How to create an Agent

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Click **New agent**.
4. Choose **Build custom agent**, or choose one the available templates. 
5. Edit the instructions to describe what you want the agent to do.
6. Review the note above the **Create agent** button, which explains that the agent will be added as a full-access Copilot of your account so it can act on your behalf.
7. Click **Create agent**.

After you click **Create agent**, you're taken directly to a direct message (DM) with the new agent, where its welcome message appears once it arrives. The new agent also appears in your **Agents** list with **Edit**, **Chat**, and **Copilot** options. 

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

You can review or remove an agent's Copilot access at any time. [Learn how to manage Copilot access](/articles/new-expensify/settings/Manage-Copilot-Access).

---

## How to write Agent instructions

Agent instructions are written in natural language and determine how your Agent behaves.

For best practices, examples, and guidance on writing effective instructions, see [How to Write Agent Instructions](docs/articles/new-expensify/ai-agents/How-to-Write-Agent-Instruction).

---

## How to chat with an agent

To open a direct conversation with an agent:

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent you want to message, then click the chat icon on the agent's row.

---

## How to Copilot into an Agent

Each agent is its own Expensify account with a profile, inbox, chats, and activity history. When you create an agent, you become its owner and are automatically added as a full-access Copilot.

Use Copilot to see what the agent has done, review its activity, and inspect any actions it has taken on reports.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Agents**.
3. Find the agent in the list and click **Copilot**.

To learn more about Copilot access, see [Act as a Copilot](/articles/new-expensify/settings/Act-as-a-Copilot).

---

## How to edit an agent

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

If the agent still has reports awaiting its approval, the deletion fails and an error appears on the agent's row asking you to review those reports first. Approve, reject, or reassign the outstanding reports, then delete the agent again.

---

## How to delete multiple agents at once

You can select several agents from the **Agents** list and delete them together.

On web:

1. In the navigation tabs on the left, click **Account** > **Agents**.
2. Select the checkbox next to each agent you want to delete.
3. Click the button that shows the number of agents selected (for example, **2 selected**).
4. Select **Delete agents**.
5. Click **Delete** to confirm.

On mobile:

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

# FAQ

## Who can edit or delete an agent?

Only the agent's owner can edit its instructions or delete it. The owner is the account that created the agent.

## Why can't I delete an agent?

If the agent is a workspace approver and has reports awaiting its approval, the deletion fails and an error appears on the agent's row. Review the outstanding reports (approve, reject, or reassign them to another approver), then delete the agent again.

## Can I use an Agent in a workspace?

Yes. Agents can be added as workspace members and selected anywhere a workspace member can be selected, such as approval workflows. 

## Are agents billed?

An agent is a member of any workspace it's added to and is billed as a workspace member like any other member. Usage-based billing for agent activity is not yet in effect at this release.

## Can I remove myself as a Copilot from an agent I created?

No. The owner is permanently added as a full-access Copilot on the agent's account so you always retain access to review and update the agent.

## Why does the Security page look different when I Copilot into an agent?

When you Copilot into an agent's account and open **Account > Security**, some options are adjusted because you're managing an agent rather than a real member's account:

- **Device management** and **Merge accounts** are hidden, since they don't apply to an agent.
- **Close account** deletes the agent and ends the Copilot session instead of opening the standard close-account flow.

## Can an agent make mistakes?

Yes. Agents follow natural-language instructions and are powered by AI, so they may occasionally behave unexpectedly. Write clear, specific instructions and review what an agent does.

