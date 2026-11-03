---
title: Create and Manage Company Agents
description: Create AI agents that belong to your workspace or domain instead of to you, choose their workspace role, and manage them alongside other workspace admins.
keywords: [company agents, workspace agents, company-owned agents, domain agents, shared agents, agent owner, agent role, workspace admin, domain admin, create company agent, manage company agent, Owner column, new expensify]
internalScope: Audience is workspace admins and domain admins. Covers creating company agents from a workspace, choosing their workspace role, who owns and manages them, and how they differ from personal agents. Does not cover personal agents, agent rules, RuleBot, what each agent template does, or best practices for writing agent instructions.
retrievalIntent: How do I create an agent that my company owns instead of me?
contentType: task
order: 5
---

# Create and Manage Company Agents

Company agents are AI agents that belong to your workspace or domain instead of to you. Use them for shared work, like reviewing reports for the whole team, so the agent keeps working even if the person who created it leaves.

A company agent works like a personal agent. It has its own Expensify account, follows the natural-language instructions you write, and can be chatted with, edited, and Copiloted into. The difference is who owns it and who can manage it. To learn about personal agents, see [Create and Use Agents](/articles/new-expensify/ai-agents/Create-and-Use-Agents).

---

## Who can create company agents

Workspace admins can create company agents on Collect and Control workspaces.

**Agents** appears in the workspace menu after **Members** with a **Beta** badge.

---

## How to create a company agent

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Agents**.
2. Select **New agent**.
3. Select **Build custom agent**, or under **Or start with a template:**, find the template you want and select **Add**.
4. Review the auto-generated profile image and **Agent name**. If needed, you can edit these later.
5. Select **Role** and choose the agent's role in the workspace.
6. Select **Write custom instructions** and describe what you want the agent to do. If you started from a template, review the pre-filled instructions and edit them if needed.
7. Select **Create agent**.

After you select **Create agent**, you're taken directly to a direct message (DM) with the new agent. The agent also appears on the workspace's **Agents** page.

<!-- SCREENSHOT:
Suggestion: The workspace Agents page with the New agent button and a list of company agents with their roles
Location: How to create a company agent
Purpose: Shows where company agents are created and listed
-->

---

## How to choose a company agent's role

The agent joins the workspace as a member with the role you choose. The role controls what the agent can see and do in the workspace, the same way it does for any other member. [Learn about workspace member roles](/articles/new-expensify/workspaces/Managing-Workspace-Members).

- On Collect workspaces, you can choose **Workspace admin** or **Member**.
- On Control workspaces, you can also choose **Auditor**, **Guest**, **Card admin**, **People admin**, or **Payments admin**.

**Workspace admin** is selected by default. Choose the role with the least access the agent needs to do its job.

---

## Who owns a company agent

When you create a company agent, you don't become its owner. Instead:

- If you're a domain admin and your email address is on that private domain, your domain owns the agent.
- Otherwise, the workspace you created it from owns the agent.

You can see each agent's owner in the **Owner** column under **Account > Agents**. Personal agents show the person who owns them, workspace-owned agents show the workspace name, and domain-owned agents show the domain name.

---

## Who can manage a company agent

The admins of the agent's owner manage it:

- Any workspace admin can manage an agent owned by their workspace.
- Any domain admin can manage an agent owned by their domain.

These admins can chat with the agent, edit its instructions, Copilot into its account, and delete it. They automatically get full Copilot access to the agent's account, so you don't need to add them by hand.

Company agents you can manage appear in your list under **Account > Agents**, next to your personal agents. To chat, Copilot, edit, or delete one, follow the same steps as for a personal agent. [Learn how to use agents](/articles/new-expensify/ai-agents/Create-and-Use-Agents).

On a workspace's **Agents** page, agents you can't manage are shown dimmed, and their buttons are turned off.

---

## How company agents differ from personal agents

| | **Personal agents** | **Company agents** |
| --- | --- | --- |
| **Where you create it** | **Account > Agents** | **Workspaces > [workspace name] > Agents** |
| **Who can create it** | Any member | Workspace admins |
| **Owner** | The person who created it | The workspace or domain |
| **Who can manage it** | The owner | All workspace or domain admins of the owner |
| **Copilot on the creator's account** | Yes, with full access | No |
| **Workspace membership** | Added to workspaces like any member | Joins the workspace with the role you choose |

---

# FAQ

## Is a company agent added as a Copilot on my account?

No. Unlike a personal agent, a company agent doesn't get delegated access to the account of the person who created it. It works from its own account with the workspace role you chose.

## What happens to a company agent if I leave the company?

The agent stays with its workspace or domain. The remaining workspace or domain admins can keep managing it.

## Are company agents billed?

A company agent is a member of the workspace it's created in and is billed as a workspace member like any other member.

## Why can't I see Agents in my workspace menu?

**Agents** appears only on Collect and Control workspaces. It's also hidden while you're Copiloting into an agent's account, because an agent can't create its own agents.

## Is there an Agents page for domains?

No. Domain admins manage domain-owned agents under **Account > Agents**.
