---
title: Share a Company Card Feed Across Workspaces
description: Learn how to add an existing company card feed to another Workspace instead of connecting a new one.
keywords: [New Expensify, share company card feed Expensify, connect existing company cards, company cards Workspaces, direct feed Expensify, commercial card feed]
internalScope: Audience is Workspace Admins. Covers sharing an existing company card feed across Workspaces. Does not cover setting up new feeds, assigning cards, or troubleshooting feeds.
---

# Share a Company Card Feed Across Workspaces

Sharing a company card feed lets you reuse an existing card connection in another Workspace instead of creating a new one. This keeps card management centralized and prevents duplicate connections.

You can share both direct company card feeds and commercial card feeds across multiple Workspaces.

If you haven’t set up a feed yet, learn how to connect to your bank: 

 - [Learn how to set up a direct company card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection).
 - [Learn how to set up a commercial card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Commercial-Card-Feed-Connection). 

---

## Who can share a company card feed across Workspaces 

Workspace Admins with an email on a private domain can share a company card feed. 

 - On the **Collect** plan, you can add one company card feed per Workspace. 
 - On the **Control** plan, you can add unlimited company card feeds. 

[Learn about the different plan types available in Expensify.](/articles/new-expensify/billing-and-subscriptions/Plan-types-and-pricing)

---

## How to share a company card feed across Workspaces

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and select **Workspaces > [Workspace Name]**
2. Choose **Company cards** to view your company’s card setup page.
 - If you don't see **Company cards**, enable the feature under **More features > Company cards**
3. Select your existing card connection.
4. In **From other workspaces**, choose a company card feed to add to the Workspace.

---

<!-- SCREENSHOT:
Suggestion: Show From other workspaces
Design request:https://github.com/Expensify/Expensify/issues/XXXX
-->

---

## What happens after you share a company card feed across Workspaces

 - Workspace members with assigned cards on the company card feed appear in the card list
 - Unassigned cards can be assigned to Workspace Members
 - After a card is assigned, posted transactions import into the assigned member's account automatically as expenses.

[Learn how to assign company cards](/articles/new-expensify/connect-credit-cards/Assign-Company-Cards).

# FAQ

## What happens when you remove a shared company card feed? 

Removing a company card feed from a Workspace disconnects that Workspace and removes its members from the feed. The feed itself is only deleted if it is no longer connected to any Workspaces.

## Why don’t I see the “From other workspaces” section?

This can happen if:

 - There are no existing company card feeds available to share
 - Your email is not on a private domain

## Does sharing a company card feed duplicate transactions

No. Sharing a feed does not duplicate transactions. Transactions are tied to the assigned card and will only appear for the member the card is assigned to.
