---
title: Manage Personal Cards
description: Learn how to view, manage, and fix broken connections for personal credit cards in New Expensify.
keywords: [New Expensify, personal cards, Wallet, reimbursable, credit card import, Expensify Classic, New Expensify, assigned cards, card details, broken connection, fix card]
internalScope: Audience is members with personal credit cards already connected to their account. Covers viewing and managing existing personal cards in the Wallet, including reimbursable settings and fixing broken card connections. Does not cover connecting new personal cards or company card programs.
---

# Manage Personal Cards

Expensify lets you manage your personal credit cards in one place using **Wallet**. From there, you can review card details, track spending, and use transactions for expense reporting.

If you don’t have a card connected yet, [learn how to connect a personal card](/articles/new-expensify/connect-credit-cards/Connect-Personal-Cards).

---

## Who can manage personal cards

Anyone with a personal credit card connected to their Expensify account can manage it in **Wallet**.

---

## How to view personal cards in Wallet

1. Click the navigation tabs (on the left on web, on the bottom on mobile), then select **Account > Wallet**.
2. Under **Assigned cards**:
   - Personal cards will appear in the **Personal** section. 
   - You'll see the card name, bank icon, and last 4 digits.

If you have both company and personal cards, you'll see them separated into **Company cards** and **Personal cards** sections.

![Tap a personal card to open card details]({{site.url}}/assets/images/ExpensifyHelp-FixPersonalCards.png){:width="100%"}

---

## What you can manage on a personal card in Wallet

You can manage the following settings for a personal card:

- Rename the card with a custom nickname
- Turn on **Mark transactions as reimbursable** for imported transactions
- View the last successful transaction import
- Update the transaction start date for imports
- View imported transactions from the card
- Manually refresh the card to import recent transactions
- Fix connection issues if the card stops syncing
- Remove the card from your account

---

## How to update personal card settings

1. Click the navigation tabs (on the left on web, on the bottom on mobile), then select **Account > Wallet**.
2. Under **Assigned cards**, select a personal card.
3. On the **Card details** page, you can:
   - Rename the card
   - Update the card to pull in new transactions (if not CSV-imported)
   - Unassign the card if it's no longer needed
   - Toggle **Mark transactions as reimbursable** to mark future transactions as reimbursable. 

**Note:** Removing a personal card permanently deletes any unreported expenses or expenses on draft reports from that card.

![Update personal card settings from the card details page]({{site.url}}/assets/images/personal-card-02.png){:width="100%"}

---

## Why a personal card connection can break

A personal card connection can break when your bank can no longer authenticate your account. Common causes include:

- Your bank login credentials changed (e.g., you updated your password).
- Your bank requires additional verification (e.g., multi-factor authentication expired).
- Your bank revoked access to the third-party connection.
- A temporary outage at your bank disrupted the connection.

When a connection breaks, Expensify can no longer import new transactions from that card.

---

## How to know when a personal card connection is broken 

When a personal card connection breaks, you'll see:

- A notification in the **Time Sensitive** section on **Home**.
- A red dot indicator on **Wallet** in the navigation tabs. 
- A red dot indicator on the card in **Wallet** leading to the error.

<!-- SCREENSHOT:
Suggestion: Show broken personal card connection with indicators on Wallet and on the card. 
Design request: https://github.com/Expensify/Expensify/issues/620248
-->


## How to fix a broken personal card connection 

1. In the navigation tabs (on the left on web, on the bottom on mobile) navigate to **Account > Wallet**. 
2. Under **Assigned cards**, select the card with the broken connection. 
3. Choose **Fix card**.
4. Log into your bank when prompted to re-authenticate the connection.

If logging into your bank doesn't resolve the issue, tap **Update card** to attempt a manual refresh.

---

## How the broken connection violation works

When you have a broken personal card connection, Expensify adds a **broken connection** violation to receipt-scanned cash expenses across all of your workspaces. This violation holds those expenses back in case they need to be merged with card transactions once the connection is fixed.

To resolve the violation, fix the broken card connection by following the steps above. The violation is automatically removed from affected expenses once the connection is restored.

You can tap the hyperlinked text in the violation to go directly to the **Card details** page in **Wallet** where you can fix the connection.

---

# FAQ


## Can I change the reimbursable setting for past transactions?

No. Changes to the reimbursable setting only apply to transactions imported after the change.

## Why don't I see my personal card in the Wallet?

Personal cards appear in the Wallet only if they were previously connected to your account in Expensify Classic. If your card doesn't show up, it means it wasn't connected before and isn't available to manage yet.

## Why do I see a broken connection violation on my expenses?

When a personal card connection breaks, Expensify adds a broken connection violation to receipt-scanned cash expenses. This holds them back in case they need to merge with card transactions once the connection is restored. Fix the card connection to remove the violation automatically.

## When is the broken connection error removed? 

The broken connection error is automatically removed when any of the following occurs: 

- Logging into your bank successfully re-authenticates the connection.
- Tapping Update card successfully refreshes the card.
- Expensify's daily automatic card refresh succeeds.
