---
title: Reconcile Reimbursements
description: Learn how to match reimbursement payments to bank charges, trace payments to expense reports, and troubleshoot discrepancies with your accounting system.
keywords: [New Expensify, reconcile reimbursements, match reimbursements bank statement, reimbursement payments Expensify, reimbursement mismatch NetSuite QuickBooks, trace reimbursement to expense reports]
internalScope: Audience is Workspace Admins reconciling reimbursement payments. Covers payment-based reconciliation under Reconciliation > Reimbursements. Does not cover Expensify Card reconciliation or company card statement matching.
---

# Reconcile Reimbursements

Reimbursement reconciliation helps you match each reimbursement payment to the bank charge it creates, then trace that payment back to the expense reports it covers. You can review and verify these payments directly in Expensify.

---

## Who Can Reconcile Reimbursements

Workspace Admins can reconcile reimbursements when Payments is enabled on the Workspace with a verified business bank account.

---

## How to View Reimbursements 

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and go to **Spend**.
2. In the **Reconciliation** section, select **Reimbursements**.
3. Choose the **Withdrawn** filter to select a date range (for example, **Last month**).
4. Review the list of reimbursements. Each row represents a reimbursement for a single report and shows the total amount, along with the **Amount debited** column showing what was actually withdrawn from your business bank account.

**Note:** For cross-border reimbursements where your workspace is set to **Company pays** for currency conversion fees, the **Amount debited** can be greater than the report total because it includes the foreign exchange (FX) rate difference and conversion fee. Learn more about [who pays currency conversion fees](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Workflows#how-to-choose-who-pays-currency-conversion-fees).

---

## How to Trace a Reimbursement Payment to Expense Reports

1. From the Reimbursements reconciliation view, locate the payment you want to investigate.
2. Click the arrow next to the reimbursement amount to expand the row.
3. Review each report to confirm the payment matches expected activity.

---

## How to Verify Reimbursement Totals Against Your Bank Statement

1. On your bank statement, locate the reimbursement charges for the period you are reconciling.
2. In the reimbursement reconciliation view, compare the **Amount debited** for each payment to the corresponding charge on your bank statement.
   - If the amounts match, the reimbursement is reconciled. 
   - If an amount does not match, expand the reimbursement to review the underlying expenses and identify discrepancies.

**Note:** Match the bank charge against the **Amount debited**, not the report total. When your workspace is set to **Company pays** for currency conversion fees, the amount debited from your business bank account for a cross-border reimbursement can exceed the report total.

---

# FAQ

## How do I identify an unknown bank charge?

If you see a charge on your bank statement that you cannot identify, go to the Reimbursements reconciliation view and filter to the date range when the charge occurred. Match the charge amount to a payment in the list, then expand it to see which report(s) were reimbursed.

## What does a reimbursement payment include?

A single reimbursement payment may cover one expense report. Expanding the payment row shows all the expenses on the report that was reimbursed. 

## Why don't I see Reimbursements under Reconciliation?

The Payments option only appears when your workspace has Payments enabled with a verified business bank account. If you don’t see it, confirm that the Payments is enabled and a verified business bank account is connected. 
