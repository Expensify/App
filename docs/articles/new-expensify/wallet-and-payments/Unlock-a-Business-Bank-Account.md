---
title: Unlock a Business Bank Account
description: Request an unlock for a locked business bank account in Expensify and restore reimbursements and payments.
keywords: [New Expensify, locked bank account, unlock bank account, reimbursements failed, ACH rejected, bank error, fix bank account, Expensify Card locked, ACH company ID, unlock payment method]
internalScope: Audience is Workspace Admins with a locked business bank account. Covers requesting an unlock and preventing future lockouts. Does not cover initial bank account setup, validation, sharing, or unsharing.
---

# Unlock a Business Bank Account

If your business bank account is locked, Expensify pauses reimbursements and payments to prevent failed debits. You’ll need to request an unlock before the account can be used again.

---

## Why your business bank account is locked

Bank accounts may be locked after a failed debit attempt or a bank-side restriction. Common reasons include:

- Insufficient funds at the time of reimbursement
- Your bank blocked the debit attempt
- The bank account isn't enabled for ACH direct debits

When a bank account is locked, you’ll see a **Locked** badge on the account in: 

 - **Settings > Wallet** in the **Bank accounts** section
 - **Workspaces > [Workspace Name] > Workflows** in the **Payments** section

---

## How to unlock a business bank account

1. In the navigation tabs (on the left on web, on the bottom on mobile) go to **Account > Wallet**.
2. Click the bank account with the **Locked** badge.
3. Click **Fix** or **Unlock account**.
4. Send the message to Concierge to request the unlock.

Concierge will walk you through the next steps to unlock the account, or confirm when your account is ready to use.

<!-- SCREENSHOT:
Suggestion: Locked bank account row showing the Locked badge and Fix button
Location: After step 2
Purpose: Shows the locked state and how to initiate an unlock
-->

---

## What happens after you request to unlock a business bank account

Unlocking is tied to your bank's processing timeline:

1. Expensify must wait for the failed debit attempt to fully return from your bank.
2. Once returned, Concierge will notify you.
3. You confirm whether you'd like Expensify to retry the debit.
4. After a successful debit, the account unlocks automatically.

Expensify cannot manually retry debits until the bank returns the original attempt.

---

## How to prevent your business bank account from locking again

Ask your bank to allow ACH debits from the following originators:

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

## Will I be notified when my bank account is locked?

Yes. You’ll see a **Locked** badge in **Wallet** and **Workflows**, and Concierge will message you.

## Can I delete a locked bank account?

No. Locked accounts can't be deleted until they're resolved and unlocked.

## Why hasn’t my account unlocked yet?

The failed debit may still be processing with your bank. Concierge will notify you as soon as it can be retried.

