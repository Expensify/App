---
title: Re-authenticate a Card Connection
description: Re-approve an expired card connection in Expensify so your bank keeps importing transactions.
keywords: [New Expensify, re-authenticate card, reconnect card, re-consent, bank authorization, fix card, personal card, company card feed, needs re-authentication]
internalScope: Audience is members with personal cards and Workspace Admins with company card feeds. Covers re-approving a connection that needs re-authentication (authorization or session expired). Does not cover rebuilding a broken connection, connecting a new card, or spreadsheet imports.
retrievalIntent: How to re-authenticate a card connection that needs re-approval.
contentType: task
platform: new
order: 3
---

# Re-authenticate a Card Connection

When Expensify shows that your card connection **needs to be re-authenticated**, your bank just needs you to re-approve the connection. The connection is still valid — nothing is broken — so this only takes a minute and imports resume once it's done.

Banks require this periodically as their authorization expires, often about once a year. It's expected and recurring, not a sign of a problem.

If you're not sure whether you need to re-authenticate or fix a broken connection, see [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue).

---

## Who can re-authenticate a connection

- **Personal cards:** the cardholder re-authenticates their own card in **Account > Wallet**.
- **Company card feeds:** a Workspace Admin re-authenticates the feed under **Workspace > Company cards**. Individual members can't re-authenticate a company feed.

---

## How to re-authenticate a personal card

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Account > Wallet**.
2. Under **Cards**, select the personal card showing the re-authentication message.
3. Choose **Fix card**.
4. Log into your bank when prompted and re-approve the connection.

<!-- SCREENSHOT:
Suggestion: Personal card details page in Wallet with the "Fix card" action for a card that needs re-authentication.
Location: Account > Wallet > [card] > Card details
Purpose: Show where the cardholder starts the re-authentication flow.
-->

---

## How to re-authenticate a company card feed

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspace > [Workspace name]**.
2. Select **Company cards**.
3. Locate the feed showing the re-authentication message.
4. Select the message under the feed name and follow the prompts to log into your bank and re-approve the connection.

<!-- SCREENSHOT:
Suggestion: Company cards page with a feed showing a re-authentication message and its Fix action.
Location: Workspace > [Workspace name] > Company cards
Purpose: Show where an Admin re-authenticates a company feed.
-->

---

## What happens after you re-authenticate

Once you re-approve the connection:

- New transactions begin importing again.
- Any transactions from while the connection was down import automatically.
- Any **broken connection** violation held on your receipt-scanned expenses is removed automatically once the connection is restored.

---

## Related articles

- [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue)
- [Fix a Card Connection Error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error)
- [Manage Personal Cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards)

---

# FAQ

## How often will I need to re-authenticate?

It varies by bank. Many banks require re-approval about once a year as their authorization expires. It's a routine security step, not a sign that anything went wrong.

## I re-authenticated but transactions still aren't importing. What now?

If re-approving didn't restore imports, the connection may actually be broken. Try a manual refresh with **Update card**, and if that doesn't help, follow [Fix a Card Connection Error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error).
