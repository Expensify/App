---
title: Reconcile Reimbursements
description: Learn how to match reimbursement payments to bank charges, trace payments to expense reports, and troubleshoot discrepancies with your accounting system.
keywords: [New Expensify, reconcile reimbursements, match reimbursements bank statement, reimbursement payments Expensify, reimbursement mismatch NetSuite QuickBooks, trace reimbursement to expense reports, amount debited, amount reimbursed, cross-border reimbursement currency]
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
4. Review the list of reimbursements. Each row represents a reimbursement for a single report and shows the total amount. For a cross-border reimbursement, the row also shows the **Amount debited** and **Amount reimbursed** in their own currencies.

---

## How to read the Amount debited and Amount reimbursed columns

A cross-border reimbursement debits your company in one currency and pays the employee in another, so a single total cannot describe it. When your selected results include at least one cross-border reimbursement, the reconciliation view shows two additional columns between **Expenses** and **Total**:

- **Amount debited** — the amount withdrawn from your company's bank account, shown in the settlement currency.
- **Amount reimbursed** — the amount deposited to the employee, shown in the employee's deposit currency.

If every reimbursement in view is domestic, these columns are hidden entirely. In a mixed list, domestic rows leave both cells blank and show their amount in the **Total** column. You can sort the list by either column by clicking its header.

---

## How to Trace a Reimbursement Payment to Expense Reports

1. From the Reimbursements reconciliation view, locate the payment you want to investigate.
2. Click the arrow next to the reimbursement amount to expand the row.
3. Review each report to confirm the payment matches expected activity.

---

## How to Verify Reimbursement Totals Against Your Bank Statement

1. On your bank statement, locate the reimbursement charges for the period you are reconciling.
2. In the reimbursement reconciliation view, compare each payment total to the corresponding charge on your bank statement.
   - If the totals match, the reimbursement is reconciled. 
   - If a total does not match, expand the reimbursement to review the underlying expenses and identify discrepancies.

---

# FAQ

## How do I identify an unknown bank charge?

If you see a charge on your bank statement that you cannot identify, go to the Reimbursements reconciliation view and filter to the date range when the charge occurred. Match the charge amount to a payment in the list, then expand it to see which report(s) were reimbursed.

## What does a reimbursement payment include?

A single reimbursement payment may cover one expense report. Expanding the payment row shows all the expenses on the report that was reimbursed. 

## Why don't I see the Amount debited and Amount reimbursed columns, or why are they blank?

Those columns apply only to cross-border reimbursements, where the debited and reimbursed amounts are in different currencies. If your selected results contain only domestic reimbursements, the columns don't appear at all. In a mixed list, domestic rows leave both cells blank because the amount is shown in the **Total** column instead.

## Why don't I see Reimbursements under Reconciliation?

The Payments option only appears when your workspace has Payments enabled with a verified business bank account. If you don’t see it, confirm that the Payments is enabled and a verified business bank account is connected. 
