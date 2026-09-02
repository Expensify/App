---
title: Reconcile Reimbursements
description: Learn how to use the Bank reconciliation report to match reimbursement payments to bank charges, trace payments to expense reports, and troubleshoot discrepancies with your accounting system.
keywords: [New Expensify, reconcile reimbursements, match reimbursements bank statement, reimbursement payments Expensify, reimbursement mismatch NetSuite QuickBooks, trace reimbursement to expense reports, amount debited, amount reimbursed, cross-border reimbursement currency, bank reconciliation, reimbursement debit]
internalScope: Audience is Workspace Admins reconciling reimbursement payments. Covers payment-based reconciliation under Accounting > Bank reconciliation. Does not cover Expensify Card reconciliation or company card statement matching.
---

# Reconcile Reimbursements

Reimbursement reconciliation helps you match each reimbursement payment to the bank withdrawal it creates, then trace that payment back to the expense report it covers. You can review and verify these payments directly in Expensify.

---

## Who can reconcile reimbursements

Workspace Admins can use the Bank reconciliation report to reconcile reimbursements when Payments is enabled on the Workspace with a verified business bank account.

---

## How to view reimbursement withdrawals

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and go to **Spend**.
2. In the **Accounting** section, select **Bank reconciliation**.
3. Select the **Withdrawal type** filter and choose **Reimbursement**.
4. Select the **Withdrawn** filter to choose a date range (for example, **Last month**).
5. Review the list of reimbursements. Each row represents a reimbursement for a single report and shows the total amount.

![Spend page showing reimbursements]({{site.url}}/assets/images/Bank_Reconciliation_Withdrawals.png){:width="100%"}

---

## How to read the Amount debited and Amount reimbursed columns for cross-border reimbursements

A cross-border reimbursement debits your company in one currency and pays the employee in another, so a single total cannot describe it. When your selected results include at least one cross-border reimbursement, the reconciliation view shows two additional columns between **Expenses** and **Total**:

- **Amount debited** — the amount withdrawn from your company's bank account, shown in the settlement currency.
- **Amount reimbursed** — the amount deposited to the employee, shown in the employee's deposit currency.

If every reimbursement in view is domestic, these columns are hidden entirely. In a mixed list, domestic rows leave both cells blank and show their amount in the **Total** column. You can sort the list by either column by clicking its header.

---

## How to trace a reimbursement payment to expense reports

1. From the **Bank reconciliation** report, locate the payment you want to investigate.
2. Click the arrow next to the reimbursement amount to expand the row.
3. Review each report to confirm the payment matches expected activity.

![Spend page showing reimbursements with one reimbursement expanded]({{site.url}}/assets/images/Reimbursement_Expanded.png){:width="100%"}

---

## How to verify reimbursement totals against your bank statement

1. On your bank statement, locate the reimbursement charges for the period you are reconciling.
2. In the **Bank reconciliation** view, compare each payment total to the corresponding charge on your bank statement.
   - If the totals match, the reimbursement is reconciled. 
   - If a total does not match, expand the reimbursement to review the underlying expenses and identify discrepancies.

---

# FAQ

## How do I identify an unknown bank charge?

If you see a charge on your bank statement that you cannot identify, go to the **Bank reconciliation** view and filter to the date range when the charge occurred. Match the charge amount to a payment in the list, then expand it to see which report(s) were reimbursed.

## What does a reimbursement payment include?

A single reimbursement payment covers one expense report. Expanding the payment row shows all the expenses on the report that was reimbursed. 

## Why don't I see the Amount debited and Amount reimbursed columns, or why are they blank?

Those columns apply only to cross-border reimbursements, where the debited and reimbursed amounts are in different currencies. If your selected results contain only domestic reimbursements, the columns don't appear at all. In a mixed list, domestic rows leave both cells blank because the amount is shown in the **Total** column instead.

## Why don't I see Reimbursements in the Withdrawal type filter? 

The Reimbursements option only appears when your workspace has Payments enabled with a verified business bank account. If you don’t see it, confirm that the Payments is enabled and a verified business bank account is connected. 
