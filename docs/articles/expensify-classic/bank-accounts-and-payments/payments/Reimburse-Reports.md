---
title: How to Reimburse Reports in Expensify
description: Learn how to reimburse employee reports in Expensify using direct deposit, global transfers, Venmo, ABA files, or manual methods.
keywords: [Expensify Classic, reimburse reports, direct deposit, ACH, global reimbursement, Venmo, ABA file, locked account, failed debits, unlock]
---

You can reimburse submitted and approved reports in Expensify using direct deposit (USD or international), third-party payment tools like Venmo, or manual methods such as payroll tracking or ABA batch files.

# How to reimburse reports via direct deposit (USD)

## Setup requirements
- **Reimburser** must [connect a verified business bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-US-Business-Bank-Account).
- **Recipient** must [connect a personal bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-Personal-US-Bank-Account).

> Only verified business accounts can issue reimbursement payments. Deposit-only accounts can receive funds but cannot initiate them.

## Steps
1. Open the approved report.
2. Click **Reimburse** > **via direct deposit**.
3. Confirm the bank account.
4. Click **Accept Terms & Pay**.

## Deposit timing

### Rapid Reimbursement
- Available for USD ACH reimbursements from verified U.S. business bank accounts
- Applies to reports under $100
- Funds are usually deposited the same day or next business day
- Works with any U.S. bank account type (including deposit-only)
- Maximum daily limit: $10,000 per business account

> **Tip:** Concierge will add a comment to the report showing the estimated reimbursement date once payment is initiated.

### Standard Reimbursement
- Applies to reports over $100 or if the daily $10,000 limit is exceeded
- Deposits typically take 1–5 business days

> **Tip:** The Concierge comment on the report includes expected deposit timing and payment details.

# Reimburse via Global Reimbursement

For international bank transfers.

## Setup requirements
- A Workspace Admin must [enable global reimbursements](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Enable-Global-Reimbursements).
- Recipients must [connect a deposit account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-Personal-US-Bank-Account).

> Only verified business accounts can send global reimbursements.

## Steps
1. Open the approved report.
2. Click **Reimburse** > **via direct deposit**.
3. Confirm the recipient’s bank account.
4. Click **Accept Terms & Pay**.

Funds are typically deposited within five business days. If delayed, reach out to Concierge.

> **Tip:** Concierge adds a comment with the estimated deposit date once payment is triggered.

# Reimburse via Manual or Third-Party Methods

## Manual reimbursement (e.g., payroll or check)
To mark a report as reimbursed manually:

1. Open the report.
2. Click **Reimburse** > **I’ll do it manually – just mark it as reimbursed**.

The report status will update to **Reimbursed**.

Once the employee confirms receipt:
- Click **Confirm** to update the status to **Reimbursed: CONFIRMED**.

## Reimburse via Venmo
If both parties have Venmo accounts, [connect them to Expensify](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Third-Party-Payments) to send payments directly.

## Reimburse via ABA batch file (Australia)
Admins can generate an ABA file to reimburse AUD reports via bank upload. This supports one or multiple reports.

[Learn more about ABA reimbursements](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/payments/Reimburse-Australian-Reports)

# FAQ

## Is there a maximum reimbursement amount per report?
Yes. Expensify cannot process reimbursements over $20,000. To reimburse a larger amount, split the expenses across multiple reports.

## Why is my business bank account locked?
Your account may be locked due to a failed withdrawal (e.g., insufficient funds or direct debit not enabled).

### To fix it:
- Make sure your bank authorizes direct debits:
  - **ACH Company IDs:** 1270239450 and 4270239450  
  - **ACH Originator Name:** Expensify
- Then:
  1. Go to **Settings > Account > Wallet**
  2. Click **Fix** next to the locked account
  3. Concierge will review and update the account within 4–5 business days
 
> **Note:** If a reimbursement debit fails, we must wait for the bank to return the attempt before another debit can be retried. We cannot manually trigger a new debit while the previous one is still pending.

## Who can reimburse reports?
Only Workspace Admins with a verified business bank account can reimburse reports.

## How do I add another employee as a reimburser?
1. Add them as a Workspace Admin:  
   **Settings > Workspaces > [Workspace Name] > Members**
2. Share the business bank account:  
   **Settings > Account > Wallet** > Click **Share**
3. The employee enters test deposits to verify access.
4. Once verified, they can reimburse reports.
5. To set them as the default reimburser:  
   **Settings > Workspaces > [Workspace Name] > Workflows > Make or track payments**

## Can I reimburse reports in bulk?
Not directly. However, you can set a threshold to automate reimbursements.

To configure this:
**Settings > Workspaces > [Workspace Name] > Workflows > Make or track payments**

Reports that are Final Approved and under the threshold will auto-reimburse. Reports over the threshold require manual reimbursement.

