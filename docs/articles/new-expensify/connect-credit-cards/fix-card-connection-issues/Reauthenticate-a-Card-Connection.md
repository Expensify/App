---
title: Reauthenticate a Card Connection
description: Re-approve an expired card connection in Expensify so your bank keeps importing transactions.
keywords: [New Expensify, reauthenticate card, reconnect card, re-consent, bank authorization, fix card, personal card, company card feed, needs reauthentication]
internalScope: Audience is members with personal cards and workspace admins and card admins with company card feeds. Covers re-approving a connection that needs reauthentication (authorization or session expired). Does not cover rebuilding a broken connection, connecting a new card, or spreadsheet imports.
retrievalIntent: How to reauthenticate a card connection that needs re-approval.
contentType: task
platform: new
order: 2
---

# Reauthenticate a Card Connection

When Expensify shows that your card connection **needs to be reauthenticated**, your bank just needs you to re-approve the connection. The connection is still valid — nothing is broken — so this only takes a minute, and imports resume once it's done.

Banks require this periodically as their authorization expires, often about once a year. It's expected and recurring, not a sign of a problem.

If you're not sure whether you need to reauthenticate or fix a broken connection, see [Understand Card Connection Issues](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Understand-Card-Connection-Issues).

---

## Who can reauthenticate a connection

- **Personal cards:** the cardholder reauthenticates their own card in **Account > Wallet**.
- **Company card feeds:** a workspace admin or card admin reauthenticates the feed under **Workspace > Company cards**. Individual members can't reauthenticate a company card feed.

---

## How to reauthenticate a personal card

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Account > Wallet**.
2. Under **Cards**, select the personal card showing the reauthentication message.
3. Choose **Fix card**.
4. Log into your bank when prompted and re-approve the connection.

<!-- SCREENSHOT:
Suggestion: Personal card details page in Wallet with the "Fix card" action for a card that needs reauthentication.
Location: Account > Wallet > [card] > Card details
Purpose: Show where the cardholder starts the reauthentication flow.
-->

---

## How to reauthenticate a company card feed

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**.
2. Select **Company cards**.
3. Locate the feed showing the reauthentication message.
4. Select the message under the feed name and follow the prompts to log into your bank and re-approve the connection.

<!-- SCREENSHOT:
Suggestion: Company cards page with a feed showing a reauthentication message and its Fix action.
Location: Workspaces > [Workspace name] > Company cards
Purpose: Show where a workspace admin reauthenticates a company card feed.
-->

---

## What happens after you reauthenticate

Once you re-approve the connection:

- New transactions begin importing again.
- Any transactions from while the connection was down import automatically.
- Any **broken connection** violation held on your receipt-scanned expenses is removed automatically once the connection is restored.

---

## Related articles

- [Understand Card Connection Issues](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Understand-Card-Connection-Issues)
- [Fix a Card Connection Error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error)
- [Manage Personal Cards](/articles/new-expensify/connect-credit-cards/connect-and-manage-personal-cards/Manage-Personal-Cards)

---

# FAQ

## How often will I need to reauthenticate?

It varies by bank. Many banks require re-approval about once a year as their authorization expires. It's a routine security step, not a sign that anything went wrong.

## I reauthenticated but transactions still aren't importing. What now?

If re-approving didn't restore imports, the connection may actually be broken. Try a manual refresh with **Update card**, and if that doesn't help, follow [Fix a Card Connection Error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error).
