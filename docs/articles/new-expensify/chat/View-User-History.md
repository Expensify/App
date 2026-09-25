---
title: View User History
description: Use View user history on a profile to open Chats search filtered to every message that person has sent in the chats you can see.
keywords: [view user history, view agent history, user message history, chat history, search messages from a person, from filter, profile, New Expensify]
internalScope: Audience is all New Expensify members. Covers opening a person's or agent's message history from their profile using the View user history action. Does not cover Search operators, expense or report search, chat moderation, or agent creation.
---

# View User History

**View user history** opens **Chats** search with a **From** filter already applied for the person whose profile you're viewing. It gathers everything that person has posted into one list, so you can catch up on their messages without opening each chat.

On an agent's profile the same action is labeled **View agent history**.

---

## Who can use View user history

Any signed-in member can use **View user history**. There is no plan requirement and you don't need to be a workspace admin.

The results only include messages in chats you already have access to. **View user history** does not give you access to chats you aren't a member of.

---

## How to view a person's message history

1. Open a chat with the person.
2. Click their name or avatar in the chat header at the top of the conversation. The **Profile** page opens.
3. Click **View user history**.

You land on the **Chats** search results with a **From: [Name]** filter applied. Click the **x** on the filter to remove it, or click **Reset** to clear the search and start over.

<!-- SCREENSHOT:
Suggestion: A member's Profile page with the View user history row visible between the Local time field and Notify me about new messages
Location: How to view a person's message history
Purpose: Confirms which row on the Profile page is the history action, since the Profile page has several similar-looking rows and the action is easy to scroll past
-->

---

## How to view an agent's message history

An agent has its own profile, and the action there is labeled **View agent history**.

1. Open the chat with the agent.
2. Click its name or avatar in the chat header at the top of the conversation. The **Profile** page opens.
3. Click **View agent history**.

You can also reach the same list from the agent's settings. [Learn how to view an agent's history from the Agents page](/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents#how-to-view-an-agents-history).

---

## What the history results show

The results are an ordinary **Chats** search, so you can refine them after they load:

- Type in the search field to narrow the list to specific wording.
- Click the **x** on the **From** filter to drop it, or click **Reset** to clear the search.
- Click any result to open that message in its chat.

The equivalent query is `type:chat from:[name]`, so you can rebuild it by hand or combine it with other conditions. [Learn how to use Search operators to filter and analyze](/articles/new-expensify/reports-and-expenses/Use-Search-Operators-to-Filter-and-Analyze).

---

# FAQ

## Why don't I see every message the person has sent?

**View user history** only searches chats you can see. Messages in workspace rooms, group chats, or DMs you aren't part of aren't included.

## Why does the profile say View agent history instead of View user history?

The label changes to **View agent history** when the profile belongs to an AI agent rather than a person. The action works the same way. [Learn how to create and use agents](/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents).

## Does the person know I viewed their history?

No. **View user history** runs a search on your own account. It doesn't notify the other person and it doesn't mark anything as read for them.

## Why is the search field empty when the results are already filtered?

The **From** filter is applied as a chip next to the search field rather than as typed text, so the field stays empty and ready for you to add search terms.
