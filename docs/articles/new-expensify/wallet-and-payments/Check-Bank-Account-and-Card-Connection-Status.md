---
title: Check Bank Account and Card Connection Status
description: Read the connection status badges and messages Expensify shows for your bank accounts and cards in Wallet and in Workflows.
keywords: [New Expensify, connection status, bank account status, card status, Active, Incomplete, Pending, Verifying, Locked, Inactive, last synced, never synced, bank account badge, card badge, fix connection]
internalScope: Audience is all members, Workspace Admins, and Payments Admins. Covers reading the connection status badges, status messages, and last sync times shown for bank accounts and cards in Wallet and on the payment account row in Workflows. Does not cover connecting a bank account, validating test transactions, unlocking an account, or fixing a company card feed.
---

# Check Bank Account and Card Connection Status

Expensify shows a status badge on each bank account and card so you can tell at a glance whether it is working. When something needs your attention, a message appears below the row with a button that takes you straight to the step you need to finish.

Cards also show when they last imported transactions, so you can confirm your spend is up to date.

---

## Who can see bank account and card connection status

- Any member can see the status of their own bank accounts and cards in **Wallet**.
- Workspace Admins and Payments Admins can see the status of the workspace payment account in **Workflows**.

Statuses appear automatically. There is no setting to turn them on.

---

## How to check bank account and card connection status in Wallet

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account > Wallet**.
2. In the **Bank accounts** section, review the badge on each bank account row.
3. In the **Cards** section, review the badge and the sync time on each card row.
4. If a message appears below a row, click the button in that message to resolve it.

<!-- SCREENSHOT:
Suggestion: Wallet page with a bank account showing an Incomplete badge and the Finish adding bank account message, and a card row showing its badge and sync time
Location: After step 4
Purpose: Shows members where the badge and the message sit relative to each other, so they don't look for the fix action on the card details page instead
-->

---

## What each bank account connection status means

| Badge | What it means | What appears below the row |
|-------|---------------|-----------------------------|
| **Active** | The account is verified and ready to use. | Nothing. |
| **Incomplete** | Setup was started but never finished. | **Finish adding bank account**, with a **Finish** button that reopens setup where you left off. |
| **Pending** | Expensify sent test transactions and is waiting for you to confirm them. | **Please confirm test transactions**, with a **Confirm** button. |
| **Verifying** | Expensify is reviewing the documents you submitted. Hover over the badge to see **We're reviewing your documentation**. | Nothing. Wait for the review to finish. |
| **Locked** | The account was locked after too many failed validation attempts. | **This account requires attention**, with an **Unlock** button. |

To finish a **Pending** account, [learn how to validate a business bank account](/articles/new-expensify/wallet-and-payments/Validate-a-Business-Bank-Account).

To resolve a **Locked** account, [learn how to unlock a business bank account](/articles/new-expensify/wallet-and-payments/Unlock-a-Business-Bank-Account).

---

## What each card connection status means

| Badge | What it means | What appears below the row |
|-------|---------------|-----------------------------|
| **Active** | The card is connected and importing transactions. | Nothing. |
| **Inactive** | The connection is broken, so transactions have stopped importing. | A message that depends on the card, described below. |

The message shown on an **Inactive** card depends on who owns it and why the connection broke:

- **Please fix this connection** — a personal card you can reconnect yourself, with a **Fix** button.
- **Your bank connection needs to be re-authenticated** — a personal card where your bank requires you to log in again.
- **Please fix this connection in company cards** — a company card on a workspace you administer. The link opens **Company cards** for that workspace.
- **Please ask an admin to fix this connection** — a company card on a workspace you do not administer.

To reconnect a company card feed, [learn how to fix a broken company card feed connection](/articles/new-expensify/connect-credit-cards/Fix-a-Broken-Company-Card-Feed-Connection).

---

## How to check when a card last imported transactions

Each card row in **Wallet** shows its sync time next to the card description:

- **Synced [time]** — how long ago the card last imported transactions successfully, for example **Synced 2 hours ago**.
- **Never synced** — the card has not imported any transactions yet.

The Expensify Card and cards imported from a spreadsheet do not show a sync time, because they do not connect to a bank.

---

## How to check the payment account connection status in Workflows

The workspace payment account uses the same bank account statuses described above.

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Select **Workflows**.
3. Under **Payments**, review the badge on the payment account row.
4. If a message appears below the row, click the button in that message to resolve it.

<!-- SCREENSHOT:
Suggestion: Workflows page with the payment account row showing an Incomplete badge and the Finish adding bank account message
Location: After step 4
Purpose: Confirms admins can finish bank account setup from Workflows without going to Wallet first
-->

---

# FAQ

## Why does my bank account show Incomplete when I already submitted my details?

**Incomplete** means Expensify still needs at least one step from you before the account can be used. Click **Finish** on the row to reopen setup at the first step that is missing.

## Why can't I click the payment account row in Workflows?

You need to be a Workspace Admin or a Payments Admin to open the payment account. The row is also not clickable while you are offline or while the account is being removed.

## Does an Inactive card delete my existing expenses?

No. Transactions that already imported stay in your account. Only new transactions stop importing until the connection is fixed.

## Why doesn't my Expensify Card show a sync time?

The Expensify Card posts transactions directly rather than importing them from a bank connection, so there is no sync to report.
