---
title: Unlock a Business Bank Account
description: Request an unlock for a locked business bank account in Expensify and restore reimbursements and payments.
keywords: [New Expensify, locked bank account, unlock bank account, reimbursements failed, ACH rejected, bank error, fix bank account, Expensify Card locked, ACH company ID, unlock payment method, request already submitted, duplicate unlock request]
internalScope: Audience is Workspace Admins with a locked business bank account. Covers requesting an unlock, what happens if you request an unlock more than once, and preventing future lockouts. Does not cover initial bank account setup, validation, sharing, or unsharing.
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
 - **Workspaces > [Workspace Name] > Workflows > Payments**

You’ll also see an alert in the **Time sensitive** section on **Home** with a **Fix** button that guides you through the unlock process.

---

![Account > Wallet > bank account with a Locked badge ]({{site.url}}/assets/images/ExpensifyHelp-BetterBusinessBankAccount_04.png){:width="100%"}

![Workspace > Workflows > Payments > bank account with a Locked badge]({{site.url}}/assets/images/ExpensifyHelp-BetterBusinessBankAccount_05.png){:width="100%"}

---

## How to unlock a business bank account

You can start the request from **Home**, **Wallet**, or a workspace’s **Workflows**. The steps are the same on web and mobile.

1. Do one of the following:
   - On **Home**, click **Fix** on the locked bank account alert in the **Time sensitive** section, then skip to step 3.
   - Go to **Settings > Wallet** and find the account in the **Bank accounts** section.
   - Go to **Workspaces > [Workspace Name] > Workflows** and click the **Payments** tab. **Workflows** opens on the **Submissions** tab, so the bank account isn’t shown until you switch to **Payments**.
2. In **Wallet** or **Payments**, click the bank account with the **Locked** badge, or click **Unlock** next to it.
3. Review the request Expensify posts in your Concierge chat.

There is no extra confirmation step. Expensify sends the request to Concierge as soon as you click and takes you straight to your Concierge chat, where the request appears as a message — you don’t need to write anything. Concierge will walk you through the next steps to unlock the account, or confirm when your account is ready to use.

---

## What happens if you request an unlock more than once

Expensify sends only one unlock request per bank account. If you click **Fix**, **Unlock**, or the locked bank account again for the same account, a **Request already submitted** message appears confirming that your request is already with Concierge, and no duplicate request is sent.

Click **Got it** to dismiss the message. Your place in the queue is unaffected — clicking again does not speed up the unlock.

<!-- SCREENSHOT:
Suggestion: The "Request already submitted" confirmation message that appears after clicking Fix a second time for the same locked bank account, including the Got it button.
Location: Immediately after the "What happens if you request an unlock more than once" section.
Purpose: Prevents admins from reading the message as an error or a failed request and contacting support to ask why their second attempt "didn't work".
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

Yes. You’ll see a **Locked** badge in **Wallet** and on the **Payments** tab of **Workflows**, and Concierge will message you.

## Can I delete a locked bank account?

No. Locked accounts can't be deleted until they're resolved and unlocked.

## Why hasn’t my account unlocked yet?

The failed debit may still be processing with your bank. Concierge will notify you as soon as it can be retried.

## Why do I see “Request already submitted” when I click Fix or Unlock?

You’ve already requested an unlock for that bank account. Expensify blocks duplicate requests, so Concierge still has your original request. Click **Got it** and wait for Concierge to reply.

## Can I submit another unlock request to speed things up?

No. Only one request per bank account is sent, and repeat clicks show the **Request already submitted** message instead. Unlocking depends on your bank returning the failed debit, which a second request can’t change.

