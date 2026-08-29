---
title: Understand Card Connection Issues
description: Learn why card connections fail in Expensify, the difference between a connection that needs re-authentication and one that's broken, and how to tell which situation you're in.
keywords: [New Expensify, card connection, broken connection, re-authenticate, reconnect card, bank connection, company card feed, personal card, credit card import]
internalScope: Audience is members with personal cards and Workspace Admins with company card feeds. Covers why a new card may fail to connect, why an existing connection stops importing, the two failure modes (needs re-authentication vs. broken), the indicators members see, and who resolves each. Does not cover the step-by-step reconnect workflows or connecting a new card.
retrievalIntent: Why a card connection failed or stopped importing and what the difference is between re-authentication and a broken connection.
contentType: topic
platform: new
order: 1
---

# Understand Card Connection Issues

Expensify connects to your bank by establishing a secure connection to your bank to import card transactions. Card connection issues can happen when you first try to connect a card or after a card has already been connected. If Expensify is unable to establish a connection with your bank, or the connection is established but later breaks, transactions will stop importing. 

The cause can range from a bank authentication requirement to a temporary bank outage or a change to the account itself. Understanding where the connection is failing can help you find the right troubleshooting steps.

This applies to personal cards you manage in **Wallet** and company card feeds a Workspace Admin manages under **Company cards**.

---

## Why a new card may have trouble connecting

When you add a card, Expensify must establish a connection with your bank and receive access to the eligible cards or accounts.

A new connection may have an issue if:

 - Your bank requires additional authentication or an action in its portal.
 - Expensify can't authenticate with the credentials provided.
 - The card or account isn't available through the bank connection.
 - The bank doesn't support the connection you're trying to establish.
 - The bank is temporarily unavailable.

If you encounter an issue while adding a card, use the error shown during the connection process to find the appropriate troubleshooting steps.

---

## Why an existing card connection may stop working

After a card is connected, Expensify relies on your bank continuing to authorize access to its transactions.

An existing connection can break if: 

 - Your bank's authorization expired. Banks may periodically require you to approve the connection again.
 - Your banking credentials changed. A password reset or updated login details can break the connection.
 - Your bank requires an extra step. Multi-factor authentication, a security question, or an action in your bank's portal may block access.
 - Your card or account changed. A reissued card, changed account number, or other account change may affect the existing connection.
 - Your bank changed its connection support. The bank may change or stop supporting a connection method.
 - Your bank is temporarily unavailable. Temporary bank outages can interrupt transaction imports.

Depending on the cause, the connection may need to be re-authenticated or may be considered broken.

---

## What It means when a card connection needs reauthentication

A connection that needs reauthentication is paused because your bank requires you to authorize Expensify again before transactions can continue importing.

This commonly happens when your bank's authorization expires. It doesn't mean the connection itself has failed.

[Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

---

## What it means when a card connection is broken

A broken connection means the connection has been disrupted and Expensify can no longer reach your bank.

This can happen because of changed credentials, changes to the card or account, a bank outage, or changes to the connection supported by the bank.

Resolving a broken connection may require reconnecting or reassigning cards, using another available connection method, or waiting for a bank-side issue to be resolved.

[Learn how to fix a broken card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error).

---

## How Expensify shows an existing card connection issue

When an existing connection needs attention, Expensify surfaces the issue in a few places:

 - A notification appears in the **Time Sensitive** section on **Home**.
 - A red dot appears on the affected card or feed with a message describing the problem and a **Fix** action.
 - For company card feeds, Concierge also posts a message in the **#admins** room.

The message can indicate whether the connection needs to be reauthenticated or is broken and direct you toward the appropriate action.

---

## What happens while an existing card connection has an issue

While an existing connection needs attention, new transactions stop importing.

You may also see a **broken connection** violation on receipt-scanned expenses. Expensify holds these expenses in case they need to be matched with card transactions after the connection is restored. Once the connection is fixed, imports resume and the violation is removed. 

If you need an expense to move forward before the connection is fixed, you can mark it as cash to request payment right away.

---

## Where to troubleshoot a card connection issue


Use the troubleshooting guidance for the specific error or connection state you're seeing rather than removing or reconnecting a card without first identifying the issue.

* [Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection)
* [Learn how to fix a card connection error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error)
