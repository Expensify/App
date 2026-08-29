---
title: Identify Your Card Connection Issue
description: Use the message Expensify shows on your card to decide whether you need to re-authenticate the connection or fix a broken one.
keywords: [New Expensify, card connection error, broken connection, re-authenticate, reconnect card, card error message, fix card, company card feed, personal card]
internalScope: Audience is members with personal cards and Workspace Admins with company card feeds. Covers matching the on-screen card connection message to the correct fix path. Does not cover the step-by-step reconnect workflows themselves or importing transactions from a spreadsheet.
retrievalIntent: Which fix a card connection needs based on the message Expensify is showing.
contentType: topic
platform: new
order: 2
---

# Identify Your Card Connection Issue

When a card connection needs attention, Expensify shows a message describing the issue. That message tells you what's wrong and how to fix it. This article helps you match what you see to the right next step.

Expensify shows these messages in plain language rather than error codes, so you can act on them without looking anything up. Start by finding the card with the red dot — on a personal card in **Account > Wallet**, or on a company card feed under **Workspace > Company cards** — and read the message shown with it.

---

## When the connection needs to be re-authenticated

You'll see a message like:

- **Needs re-authentication**


This indicates the connection is still valid, but transaction import is paused until your  your bank's authorization or your login session expired and needs to be re-approved. This is routine can happens periodically as your bank's authorization lapses.

To fix it, e-approve the connection by logging back into your bank. See [Re-authenticate a Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

---

## When a connection has an error

You'll see a message like:

- **Connection is broken** 
- **Bank connection issue**
- **Account not found / Account number changed**


This indicates connection failed and needs to be rebuilt rather than simply re-approved. This covers a range of causes — changed bank credentials, a changed or reissued card number, a bank-side outage, a bank that no longer supports the connection, or a bank Expensify can't classify the error for.

To fix it, follow the broken-connection steps and, if needed, one of the alternative connection methods. See [Fix a Broken Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Broken-Card-Connection). If a specific bank keeps disconnecting (for example, Bank of America) or loops during authorization (for example, American Express), check the bank-specific guidance in that article.

---

## When a transaction can't match a receipt

You'll see a message on the expense like:

- **Receipt pending due to broken bank connection.**
- **Can't auto-match receipt due to broken bank connection.**

This indicates a scanned receipt is waiting for a card transaction to match against, but the card connection is down, so the match can't happen. This is a symptom of a connection issue — not a separate problem.

To fix it, fix the underlying connection using the sections above. Once it's restored, the receipt matches automatically and the message clears. If you need the expense to move forward right away, mark it as cash to request payment now.

For a company card feed, the message may direct members to ask a Workspace Admin to resolve it, since only an Admin can reconnect a company feed.

---

## When a transient bank issue is to blame

You'll see a message like:

- **Retry later**
- **Login failed**

This indicates your bank is having an outage or is temporarily unavailable. No action is needed on your side.

**What to do:** Wait and try again later. If the message persists for more than a day, treat it as a broken connection and follow [Fix a Broken Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Broken-Card-Connection).

---

## When transactions imported but some are missing

If the connection is healthy (no red dot) but you're missing transactions, it's not a connection issue. Older transactions may be outside the import window, or the expense may be hidden by a filter or a modified merchant/amount. Refresh the card with **Update card**, or [import older transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Spreadsheet). If specific payments, fees, or refunds are missing, contact Concierge.

---

## Related articles

- [Learn About Card Connection Issues](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Learn-About-Card-Connection-Issues)
- [Re-authenticate a Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection)
- [Fix a Broken Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Broken-Card-Connection)
