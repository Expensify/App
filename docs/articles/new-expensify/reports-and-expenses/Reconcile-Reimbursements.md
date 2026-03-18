---
title: Reconcile Reimbursements
description: Learn how to identify and verify reimbursement payments by tracing bank charges back to expense reports in Expensify.
keywords: [reimbursements, reconciliation, payment, bank statement, withdrawal ID, expense reports]
internalScope: Audience is Workspace Admins reconciling reimbursement payments. Covers payment-based reconciliation under Reconciliation > Reimbursements. Does not cover Expensify Card reconciliation or company card statement matching.
---

# Reconcile Reimbursements

Reimbursement reconciliation is **payment-based** — you match reimbursement charges on your bank statement to the corresponding payments in Expensify, then trace each payment back to the underlying expense report(s). This helps you verify that every bank charge for reimbursements corresponds to expected activity.

For an overview of all reconciliation workflows, see [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation).

---

## Who Can Reconcile Reimbursements

Workspace Admins whose workspace has reimbursements enabled with a verified business bank account can access the reimbursement reconciliation workflow.

---

## How to View Reimbursement Payments

1. Go to **Reports > Reconciliation > Reimbursements**.
2. Apply the **Withdrawn** filter to select a date range (for example, **Last month**).
3. Review the list of reimbursement payments. Each row represents a single payment from your bank account and shows the total amount.

---

## How to Trace a Reimbursement Payment to Expense Reports

1. From the reimbursement reconciliation view, locate the payment you want to investigate.
2. Expand the payment row to see the underlying expense report(s) that make up that payment.
3. Review each report to confirm the payment matches expected activity.

---

## How to Verify Reimbursement Totals Against Your Bank Statement

1. Open your bank statement and locate the reimbursement charges for the period you are reconciling.
2. In the reimbursement reconciliation view, compare each payment total to the corresponding charge on your bank statement.
   - If the totals match, the payment is verified.
   - If a total does not match, expand the payment to review the underlying reports and identify discrepancies.

---

# FAQ

## How Do I Identify an Unknown Bank Charge?

If you see a charge on your bank statement that you cannot identify, go to **Reports > Reconciliation > Reimbursements** and filter to the date range when the charge occurred. Match the charge amount to a payment in the list, then expand it to see which report(s) were reimbursed.

## What Does a Reimbursement Payment Include?

A single reimbursement payment may cover one or more expense reports. Expanding the payment row shows all the reports that were included in that settlement.

## Why Don't I See Reimbursements Under Reconciliation?

The **Reimbursements** option appears only when your workspace has reimbursements enabled with a verified business bank account. If you do not see it, confirm your workspace settings under **Settings > Workspaces > [Workspace Name] > Reimbursement**.
