---
title: Learn About Card Connection Issues
description: Learn why credit card connections break in Expensify, the difference between a connection that needs re-authentication and one that's broken, and how to tell which situation you're in.
keywords: [New Expensify, card connection, broken connection, re-authenticate, reconnect card, bank connection, company card feed, personal card, credit card import]
internalScope: Audience is members with personal cards and Workspace Admins with company card feeds. Covers why card connections stop importing, the two failure modes (needs re-authentication vs. broken), the indicators members see, and who resolves each. Does not cover the step-by-step reconnect workflows or connecting a new card.
retrievalIntent: Why a card connection stopped importing and what the difference is between re-authentication and a broken connection.
contentType: topic
platform: new
order: 1
---

# Learn About Card Connection Issues

Expensify imports your card transactions by keeping a secure connection to your bank. When that connection is interrupted, transactions stop importing until you restore it. Most interruptions fall into one of two situations: the connection needs to be **re-authenticated**, or the connection is **broken**. Knowing which one you're facing points you to the right fix.

This applies to both personal cards you manage in your **Wallet** and company card feeds a Workspace Admin manages under **Company cards**.

---

## Why a card connection stops importing

A card connection relies on your bank continuing to authorize Expensify to access your transactions. That authorization can lapse or fail for several reasons:

- **Your bank's authorization expired.** Banks periodically require you to re-approve the connection. As banks move to newer open-banking standards, this re-approval is expected roughly once a year and is not a sign that anything is wrong.
- **Your login session expired.** The bank ended the active session and needs you to log in again.
- **Your bank credentials changed.** A password reset or updated login details will stop the connection until you reconnect.
- **Your bank requires an extra step.** Multi-factor authentication, a security question, or an action in your bank's portal is blocking access.
- **Your bank changed or removed the account.** A reissued card, changed card number, or a bank that stopped supporting a connection type will break the connection.
- **A temporary bank outage.** These usually resolve on their own once the bank is available again.

---

## The two failure modes

### Needs re-authentication

The connection is still valid — your bank just needs you to re-approve it before it will keep sending transactions. This is the most common situation, and it's routine: it happens on a schedule as your bank's authorization expires, not because something failed.

Fixing it takes a minute: you log back into your bank and re-approve the connection. Nothing needs to be rebuilt.

[Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

### Broken connection

The connection itself failed and can't simply be re-approved — for example, your bank credentials changed, the card number changed, the bank is having an outage, or the bank withdrew support for the connection. Restoring it may take more than re-approving: you might re-add the card, switch to a different connection method, or wait out a bank-side issue.

[Learn how to fix a broken card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Broken-Card-Connection).

Not sure which one you have? See [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue).

---

## How Expensify tells you there's a problem

When a connection needs attention, Expensify surfaces it in a few places:

- A notification appears in the **Time Sensitive** section on **Home**.
- A red dot appears on the affected card or feed, along with a message describing the problem and a **Fix** action.
- For company card feeds, Concierge also posts a message in the **#admins** room.

The message tells you whether the connection **needs to be re-authenticated** or is **broken**, and gives you the action to resolve it.

---

## Who resolves the issue

Who fixes a connection depends on the card type:

- **Personal cards** are managed by the individual cardholder in **Account > Wallet**. You resolve issues with your own personal cards.
- **Company card feeds** are managed by a Workspace Admin under **Workspace > Company cards**. Admins reconnect the feed for the whole workspace; individual members can't fix a company feed themselves.

If a company card connection breaks, members may see a **broken bank connection** indicator on affected expenses until an Admin restores the feed.

---

## What happens to your expenses while a connection is down

While a connection needs attention, new transactions don't import. You may also see a **broken connection** violation held on receipt-scanned expenses — Expensify holds these back in case they still need to be matched to a card transaction once the connection is restored. Once you fix the connection, imports resume and the violation is removed automatically.

If you need an expense to move forward before the connection is fixed, you can mark it as cash to request payment right away.

---

## Related articles

- [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue)
- [Re-authenticate a Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection)
- [Fix a Broken Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Broken-Card-Connection)
- [Manage Personal Cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards)
