---
title: Manage MCP connectors in a workspace
description: Learn how Workspace Admins open the MCP page in a workspace, launch AI assistant connectors, and turn the MCP feature on or off in More features.
keywords: [manage MCP connectors workspace, MCP workspace menu, enable MCP More features, turn off MCP workspace, Expensify workspace AI assistant connectors, MCP page Expensify]
internalScope: Audience is Workspace Admins in New Expensify. Covers the workspace MCP page, its Connectors list, and the MCP toggle in More features. Does not cover client-side setup in ChatGPT, Claude, or Cursor, or MCP server capabilities, permissions, and security.
order: 5
---

# Manage MCP connectors in a workspace

The **MCP** feature adds an **MCP** page to your workspace. The page lists the AI assistants that Expensify publishes a connector for and gives you a shortcut to each one's setup flow.

**MCP** is turned on for every workspace unless a Workspace Admin turns it off.

Learn more about supported AI clients, permissions, and security in [Use the Expensify MCP server with AI assistants](/articles/new-expensify/connections/connect-ai-assistants/Use-the-Expensify-MCP-Server-With-AI-Assistants).

---

## Who can manage MCP connectors in a workspace

You must be a Workspace Admin to open the **MCP** page or change the **MCP** toggle.

Members who are not Workspace Admins do not see the **MCP** page. They can still connect an AI assistant to their own Expensify account directly from their AI client.

**MCP** is available on every workspace type.

---

## How to open the MCP page in a workspace

1. Go to **Workspaces > [Workspace Name] > MCP**.

The **MCP** page shows a **Connectors** section with the subtitle **Connect an AI assistant to your Expensify account.** The section lists each supported AI assistant and the company that makes it:

- **ChatGPT** — by OpenAI
- **Claude** — by Anthropic
- **Cursor** — by Anysphere

At the bottom of the **Connectors** section, **Need help connecting?** links to **Read our guide.**

If **MCP** does not appear in the workspace menu, the feature is turned off for that workspace.

<!-- SCREENSHOT:
Suggestion: The workspace MCP page showing the Connectors section with the ChatGPT, Claude, and Cursor rows and their Connect buttons.
Location: Immediately after this section.
Purpose: Confirms admins are on the right page and shows that Connect sits on each row rather than at the section level, which is where admins most often look first.
-->

---

## How to connect an AI assistant from the MCP page

1. Go to **Workspaces > [Workspace Name] > MCP**.
2. Click **Connect** next to the AI assistant you want to use.
3. Complete the setup steps on the page that opens in a new tab.

**Connect** opens that assistant's setup destination in a new browser tab. It does not complete the connection on its own — you finish the connection in your AI client and approve the OAuth request.

Each person connects their own Expensify account. Clicking **Connect** does not connect the assistant on behalf of other workspace members.

---

## How to turn the MCP feature off or back on in a workspace

1. Go to **Workspaces > [Workspace Name] > More features**.
2. In the **Integrate** section, turn the **MCP** toggle off or back on.

The **MCP** toggle uses the title **MCP** and the subtitle **Connect an AI assistant to your Expensify account.**

---

## What happens after you turn off the MCP feature

- **MCP** no longer appears in the workspace menu.
- The **MCP** page is no longer reachable from that workspace.
- Members can still connect an AI assistant to their own Expensify account directly from their AI client, because the Expensify MCP server is authorized per member rather than per workspace.

---

## Related articles

- [Connect ChatGPT to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-ChatGPT-to-Expensify-Using-MCP)
- [Connect Claude to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-Claude-to-Expensify-Using-MCP)
- [Connect Cursor to Expensify using MCP](/articles/new-expensify/connections/connect-ai-assistants/Connect-Cursor-to-Expensify-Using-MCP)

---

# FAQ

## Why can't I see MCP in the workspace menu?

Check the following:

- You are a Workspace Admin. Members who are not Workspace Admins do not see the **MCP** page.
- The **MCP** toggle is turned on in **More features**.

## Does the MCP toggle control which AI assistants appear on the MCP page?

No. The toggle only controls whether **MCP** appears in the workspace menu. The **Connectors** list always shows **ChatGPT**, **Claude**, and **Cursor**.

## Can an AI assistant connected through MCP change data in my workspace?

No. The Expensify MCP server provides read-only access. An AI assistant can search, filter, summarize, and analyze data, but it cannot approve reports, edit expenses, reimburse payments, or manage workspace settings.
</content>
</invoke>
