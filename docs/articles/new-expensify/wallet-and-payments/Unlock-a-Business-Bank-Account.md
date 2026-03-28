---
title: Unlock a Business Bank Account
description: How to resolve a locked business bank account in Expensify and restore payment functionality.
keywords: [locked bank account, unlock bank account, reimbursements failed, ACH rejected, bank error, fix bank account, Expensify Card locked, ACH company ID, unlock payment method]
internalScope: Audience is Workspace Admins with a locked business bank account. Covers unlocking a locked account and ensuring ACH direct debits are enabled. Does not cover initial bank account setup, validation, sharing, or unsharing.
---

<div id="new-expensify" markdown="1">

If your business bank account gets locked, Expensify pauses reimbursements and payments to prevent errors. You'll need to unlock the account before you can use it again for any financial activity.

# Unlock a Business Bank Account

---

## Why a business bank account may get locked

Bank accounts may be locked after a failed debit attempt or a bank-side restriction. Common reasons include:

- Insufficient funds at the time of reimbursement
- Your bank blocked the debit attempt
- Your account isn't enabled for ACH direct debits

When this happens, you'll see a **Locked** badge next to the account in both **Settings > Wallet** and **Workspaces > [Workspace Name] > Workflows**.

---

## Where to find locked business bank accounts

- Go to **Settings > Wallet** and look for the account with a **Locked** badge.
- Or go to **Workspaces > [Workspace Name] > Workflows** if the account is linked to a workspace.

On mobile, tap the hamburger menu in the top-left corner, then select **Settings > Wallet**.

---

## How to unlock a business bank account

1. Click the bank account with the **Locked** badge.
2. Click **Fix** or **Unlock account**.
3. This opens a Concierge chat and sends your unlock request.
4. Concierge will walk you through the next steps or confirm when your account is ready to use.

If there's already an open issue for this account, your message will be added to the ongoing thread.

<!-- SCREENSHOT:
Suggestion: Locked bank account row showing the Locked badge and Fix button
Location: After step 2
Purpose: Shows the locked state and how to initiate an unlock
-->

---

## What to expect after requesting an unlock

Unlocking is tied to your bank's processing timeline:

1. Expensify must wait for the failed debit attempt to fully return from your bank.
2. Once returned, Concierge will notify you.
3. You confirm whether you'd like Expensify to retry the debit.
4. After a successful debit, the account unlocks automatically.

Expensify cannot manually retry debits until the bank returns the original attempt.

---

## How to ensure your bank allows ACH debits

To prevent future lockouts, ask your bank to approve the following ACH details:

**For reimbursements via Expensify:**
- ACH Company IDs: 1270239450, 4270239450, 2270239450
- ACH Originator Name: Expensify

**For bill payments via Stripe:**
- ACH Company IDs: 1800948598, 4270465600
- ACH Originator Name: expensify.com

**For international reimbursements via CorPay:**
- ACH Company IDs: 1522304924, 2522304924
- ACH Originator Name: Cambridge Global Payments

---

# FAQ

## Will I be notified when my account is locked?

Yes. You'll see a **Locked** badge in Wallet and Workflows, and you'll receive a message from Concierge.

## Can I still pay reports with a different bank account?

Yes, but if you try to pay from a locked account, you'll see a message explaining the issue.

## Can I delete a locked bank account?

No. Locked accounts can't be deleted until they're resolved and unlocked.

## What if I already requested an unlock but didn't get a response?

If your account is still locked, the failed debit may still be processing. Concierge will notify you as soon as it's ready to retry.

</div>
