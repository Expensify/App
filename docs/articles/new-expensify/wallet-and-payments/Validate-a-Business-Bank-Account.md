---
title: Validate a Business Bank Account
description: Enter test transaction amounts to complete validation of a business bank account in Expensify.
keywords: [New Expensify, validate bank account, test deposits, ACH validation, business bank verification, confirm test transactions, micro-transactions, pending bank account, validation failed, test deposits wrong, Fix button missing, Unlock button missing, bank account pending, verification expired, wrong amounts, validation locked]
internalScope: Audience is all members with a pending business bank account. Covers entering test transactions to validate a bank account. Does not cover initial bank account setup, sharing, unsharing, or unlocking.
---

# Validate a Business Bank Account

After your business bank account is approved, Expensify sends three test transactions to confirm ownership. You’ll also receive a message from Concierge that says “Your bank account is almost set up!”.

The three transactions (two small withdrawals and one small deposit) typically arrive within one–two business days. Once they appear in your bank account, enter the exact amounts in Expensify to complete validation and start using the account for reimbursements or payments.

---

## Who can validate a business bank account

Any member who has a **Pending** business bank account in **Wallet** can validate it using the test transactions. 

---

## When can a business bank account be validated

After your business bank account is approved: 

 - Expensify sends three test transactions to your bank account - two small withdrawals and one small deposit.
 - When the test transactions are sent, Concierge will send a message to notify you that says "Your bank account is almost set up!".
 - The test transactions will arrive 1-2 days after sending. 

## How to validate a business bank account with test transactions

When you see the three test amounts post to your bank account: 

1. In the navigation tabs (on the left on web, on the bottom on mobile) go to **Account > Wallet**.
2. In the **Bank accounts** section, click the business bank account with the **Action required** badge. 
3. In the **Validate your bank account** section that appears, enter each transaction amount. 
4. Click **Validate**.

Once the values are confirmed, your business bank account is fully connected and ready to use.

---

![Account > Wallet > bank account with a callout on the Action required badge]({{site.url}}/assets/images/ExpensifyHelp-BetterBusinessBankAccount_02.png){:width="100%"}

![Account > Wallet > bank account with an Action required badge > expose validation pane]({{site.url}}/assets/images/ExpensifyHelp-BetterBusinessBankAccount_03.png){:width="100%"}

---

## What to do if test transactions don't arrive

If the test deposits don't appear after two business days:

1. Confirm that your bank account supports ACH direct debits.
2. Share the following ACH details with your bank:
   - **ACH Company IDs:** 1270239450, 4270239450, 2270239450
   - **ACH Originator Name:** Expensify
3. If still missing, contact Concierge to re-trigger the test transactions.

---

# FAQ

## How many test transactions will I receive?

Three total: two small withdrawals and one small deposit. These are temporary and used only for verification.

## What is the name on the test transactions? 

The test transactions will have a name like "Expensify, Inc. Validation".

## What happens if I enter the wrong amounts?

You’ll be prompted to try again. Multiple failed attempts may temporarily lock validation. See the troubleshooting section below for common causes of incorrect amounts.

## Can I skip validation if the account was shared with me?

No. US bank accounts require validation by entering test transactions. Some non-US accounts may not require this step.

## What if I don’t have access to the bank account?

Another member with access to the bank account must complete the validation.

---

# Troubleshooting

## Test transactions arrived but the amounts I entered are rejected

If you can see the test transactions in your bank account but validation keeps failing:

- **Use posted amounts, not pending amounts.** Wait until the transactions have fully posted to your account. Pending transaction amounts can sometimes differ slightly from the final posted amounts.
- **Check for rounding.** Enter the exact amounts shown in your bank statement, including cents. Even a one-cent difference will cause validation to fail.
- **Make sure you have the right transactions.** Look for transactions labeled "Expensify, Inc. Validation" or similar. If you have connected multiple bank accounts, make sure you are not confusing test transactions from a different account.
- **Check the transaction order.** Expensify expects two withdrawals and one deposit. Make sure you are entering each amount in the correct field.

If you have confirmed all of the above and validation still fails, contact Concierge for assistance.

## The Fix or Unlock button is missing

If your bank account shows a **Locked** badge but you do not see a **Fix** or **Unlock account** option:

1. Check **Settings > Wallet** in the **Bank accounts** section and click the locked bank account.
2. If no option appears there, check **Workspaces > [Workspace Name] > Workflows** in the **Payments** section.
3. Also look for a time-sensitive alert on the **Home** screen, which may include a **Fix** button.

If you still cannot find the option, refer to [Unlock a Business Bank Account](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Unlock-a-Business-Bank-Account) for detailed steps, or contact Concierge.

## Validation is temporarily locked after failed attempts

If you enter incorrect amounts multiple times, validation is temporarily locked to protect your account. The lock typically lasts a few hours. After the lock period ends, you can try again by going to **Settings > Wallet** and clicking the bank account.

If you are still unable to validate after the lock period has passed, contact Concierge.

## How long does validation stay open before expiring?

Test transactions and the validation window remain active for a limited time. If you do not complete validation within this period, the test transactions may expire and you will need to request new ones by contacting Concierge.

To avoid expiration, enter the test transaction amounts as soon as they appear in your bank account.

## "Your bank account is almost set up" message but no test transactions after several days

If Concierge has sent the "Your bank account is almost set up!" message but you have not received the test transactions after more than two business days:

1. Confirm that the bank account number connected in Expensify matches the account you are checking.
2. Ask your bank if they have blocked or filtered any small ACH transactions. Provide these details:
   - **ACH Company IDs:** 1270239450, 4270239450, 2270239450
   - **ACH Originator Name:** Expensify
3. Check whether the transactions were returned or rejected by your bank.
4. If none of the above resolves the issue, contact Concierge to re-trigger the test transactions.
