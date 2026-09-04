---
title: Understand card connection issues
description: Learn why card connections fail in Expensify and the difference between a connection that needs reauthentication and one that is broken.
keywords: [card connection issues Expensify, card connection failed, card stopped importing transactions, broken card connection, reauthenticate card connection, reconnect card Expensify, bank connection issue, company card connection issue, personal card connection issue]
internalScope: Audience is members with personal cards and workspace admins and card admins with company card feeds. Covers why new and existing card connections can fail, the difference between reauthentication and a broken connection, where connection issues appear, and how they affect expenses. Does not cover specific connection errors or step-by-step troubleshooting.
retrievalIntent: Why a card connection failed or stopped importing and what the difference is between reauthentication and a broken connection.
order: 1
---

# Understand Card Connection Issues

Expensify establishes a secure connection with your bank to import card transactions If Expensify is unable to establish a connection with your bank, or the connection is established but later breaks, new transactions will stop importing. 

The cause can range from a bank authentication requirement to a temporary bank outage or a change to the account itself. Understanding where the connection is failing can help you find the right troubleshooting steps.

This applies to personal cards that members manage in **Wallet** and company cards workspace admins and card admins manage under **Company cards**.

---

## Why card connection issues occur

A card connection depends on your bank authorizing Expensify to access eligible cards or accounts. The connection may require attention when:

- Your bank requires additional authentication or an action in its portal.
- Your bank's authorization expires.
- Your banking credentials change.
- Online banking credentials or account numbers change.
- The bank changes or stops supporting the connection method.
- The bank is temporarily unavailable.

When you first connect a card, these issues can prevent Expensify from establishing the connection. After a card is connected, they can interrupt transaction imports until the connection is restored.

---

## What It means when a card connection needs reauthentication

A connection that needs reauthentication is paused because your bank requires you to authorize Expensify again. This commonly happens when the bank's authorization expires and does not mean the connection itself has failed.

Once the connection is reauthenticated, Expensify can resume importing transactions.

[Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

---

## What it means when a card connection is broken

A broken connection means Expensify can no longer retrieve transactions through the existing connection. This may result from changed credentials, changes to the card or account, a bank-side issue, or a change in the connection method supported by the bank.

Resolving a broken connection may require reconnecting the account, reassigning company cards, using another available connection method, or waiting for the bank to resolve an issue.

[Learn how to fix a broken card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error).

---

## How Expensify shows an existing card connection issue

When an existing connection needs attention, Expensify surfaces the issue in a few places:

 - A notification appears in the **Time Sensitive** section on **Home**.
 - A red dot appears on the affected card or feed with a message describing the problem and a **Fix** action.
 - For company card feeds, Concierge also posts a message in the **#admins** room.

The message can indicate whether the connection needs to be reauthenticated or is broken and direct you toward the appropriate action.

---

## Where card connection issues appear

When an existing connection needs attention, Expensify may surface the issue in several places:

- In the **Time Sensitive** section on **Home**.
- On the affected card or feed, with a message describing the issue and a **Fix** action.
- For company card feeds, in a message from Concierge in the **#admins** room.

Use the message shown in Expensify to find the troubleshooting guidance for that specific issue.

---

## What happens while a connection has an issue

New card transactions stop importing while the connection needs attention.

Receipt-scanned expenses may also show a broken connection violation while Expensify waits for the corresponding card transactions to import. Once the connection is restored and the transactions import, Expensify can match them with the receipts.

---

# FAQ

## Why did my card transactions stop importing?

Transactions stop importing when Expensify can no longer retrieve them through the card connection. Your bank may require you to authorize the connection again, the connection may be broken, or the bank may be temporarily unavailable.

## Will missing transactions import after the connection is restored?

Once the connection is restored, Expensify resumes importing available transactions from the bank. The transactions imported may depend on the bank and the timeframe it makes available.

## Why does my receipt show a broken connection violation?

Expensify may be waiting for a card transaction to import so it can match the transaction with the receipt. The violation remains while the connection prevents that transaction from importing.

## Can I submit an expense before the connection is restored?

If the expense must move forward immediately, you can mark it as cash and submit it without waiting for the card transaction.

## What should I do if a commercial card feed stops importing transactions?

Commercial card feeds rarely experience connection errors because the bank maintains the feed. If transactions stop importing from a commercial card feed, contact Concierge for help.
