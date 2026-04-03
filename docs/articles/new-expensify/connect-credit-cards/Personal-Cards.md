---
title: Manage personal cards in New Expensify
description: Learn how to view, manage, and fix broken connections for personal credit cards in New Expensify.
keywords: [personal cards, Wallet, reimbursable, credit card import, Expensify Classic, New Expensify, assigned cards, card details, broken connection, fix card]
internalScope: Audience is members with personal credit cards already connected to their account. Covers viewing and managing existing personal cards in the Wallet, including reimbursable settings and fixing broken card connections. Does not cover connecting new personal cards or company card programs.
---

# Manage personal cards in New Expensify

Expensify lets you view and manage your personal credit cards in one place, making it easier to track spending, submit reimbursable expenses, and stay organized for tax time.

If you previously connected a personal card in Expensify Classic, you can now manage that card directly in Expensify on both web and mobile.

---

## Who can manage personal cards

You can manage personal cards if you have a personal credit card that was already connected to your account. You can manage these cards on both web and mobile, alongside any company cards on your account.

---

## Where to find personal cards in the Wallet

1. Navigate to **Account > Wallet** on web or mobile.
2. Under **Assigned cards**:
   - Personal cards imported from Expensify Classic will appear here.
   - You'll see the card name, bank icon, and last 4 digits.
3. Tap the personal card you want to manage.

If you have both company and personal cards, you'll see them separated into **Company cards** and **Personal cards** sections.

![Tap a personal card to open card details]({{site.url}}/assets/images/personal-card-01.png){:width="100%"}

---

## What you can do with personal cards

You can:
- View all personal cards imported from Expensify Classic
- Automatically import transactions from your linked personal cards
- Generate IRS-compliant eReceipts for eligible USD purchases
- Update personal card settings
- Fix broken card connections
- Filter expenses by card in the **Expenses** tab on the **Reports** page

---

## How to update personal card settings

1. Navigate to **Account > Wallet** on web or mobile.
2. Under **Assigned cards**, select a personal card.
3. On the **Card details** page, you can:
   - Rename the card
   - Update the card to pull in new transactions (if not CSV-imported)
   - Unassign the card if it's no longer needed
   - Toggle **Mark transactions as reimbursable**
     - The reimbursable setting applies only to **new** transactions and is turned on by default.

**Note:** Unassigning a personal card permanently deletes any unreported expenses or expenses on draft reports from that card.

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

## How to fix a broken personal card connection

When a personal card connection breaks, you'll see:

- A broken connection error on the card's **Card details** page in **Wallet**.
- A red brick road (RBR) indicator on the card in **Wallet** leading to the error.
- A notification in your **Concierge** DM alerting you to the broken connection.

To fix the connection:

1. Navigate to **Account > Wallet** on web or mobile.
2. Under **Assigned cards**, select the card showing the error.
3. Tap **Fix card**.
4. Log into your bank when prompted to re-authenticate the connection.

If logging into your bank doesn't resolve the issue, tap **Update card** to attempt a manual refresh.

The broken connection error is automatically removed when:
- Logging into your bank successfully re-authenticates the connection.
- Tapping **Update card** successfully refreshes the card.
- Expensify's daily automatic card refresh succeeds.

---

## How the broken connection violation works

When you have a broken personal card connection, Expensify adds a **broken connection** violation to receipt-scanned cash expenses across all of your workspaces. This violation holds those expenses back in case they need to be merged with card transactions once the connection is fixed.

To resolve the violation, fix the broken card connection by following the steps above. The violation is automatically removed from affected expenses once the connection is restored.

You can tap the hyperlinked text in the violation to go directly to the **Card details** page in **Wallet** where you can fix the connection.

---

# FAQ

## Can I add a new personal card?

Yes! You can connect new personal cards directly in New Expensify. Learn how to [connect a personal card]({{site.url}}/articles/new-expensify/connect-credit-cards/Connect-Personal-Cards).

## Can I change the reimbursable setting for past transactions?

No. Changes to the reimbursable setting only apply to transactions imported after the change.

## Why don't I see my personal card in the Wallet?

Personal cards appear in the Wallet if they were previously connected to your account in Expensify Classic, or if you connected them directly in New Expensify. If your card doesn't show up, try [connecting it as a new personal card]({{site.url}}/articles/new-expensify/connect-credit-cards/Connect-Personal-Cards).

## Why do I see a broken connection violation on my expenses?

When a personal card connection breaks, Expensify adds a broken connection violation to receipt-scanned cash expenses. This holds them back in case they need to merge with card transactions once the connection is restored. Fix the card connection to remove the violation automatically.
