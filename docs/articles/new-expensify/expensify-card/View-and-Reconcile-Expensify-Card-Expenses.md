---
title: View and Reconcile Expensify Card Expenses
description: Learn how to reconcile Expensify Card transactions using the built-in withdrawal-based reconciliation tool in Expensify.
keywords: [Expensify Card, reconciliation, withdrawal, card expenses, reconcile card, withdrawal ID]
internalScope: Audience is Workspace Admins reconciling Expensify Card activity. Covers the withdrawal-based reconciliation workflow under Reconciliation > Expensify Card. Does not cover company card statement matching, reimbursement reconciliation, or manual export-based reconciliation.
---

# View and Reconcile Expensify Card Expenses

Expensify Card reconciliation is **withdrawal-based** — each settlement withdrawal from your bank account is matched to the individual card expenses that make up that withdrawal. The entire workflow happens inside Expensify under **Reports > Reconciliation > Expensify Card**, so there is no need to cross-reference external card statements.

For an overview of all reconciliation workflows, see [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation).

---

## Who Can Reconcile Expensify Card Expenses

Workspace Admins whose workspace has the Expensify Card enabled can access the Expensify Card reconciliation workflow.

---

## How to View Expensify Card Withdrawals

1. Go to **Reports > Reconciliation > Expensify Card**.
2. Apply the **Withdrawn** filter to select a date range (for example, **Last month**).
3. Review the list of withdrawals. Each row represents a single settlement withdrawal from your bank account and shows the total amount.

---

## How to View Expenses Within a Withdrawal

1. From the Expensify Card reconciliation view, locate the withdrawal you want to review.
2. Expand the withdrawal row to see the individual card expenses that make up that withdrawal.
3. Review each expense to confirm it matches expected activity.

---

## How to Verify Expensify Card Withdrawal Totals

1. Open your bank statement and locate the Expensify Card settlement charges for the period you are reconciling.
2. In the Expensify Card reconciliation view, compare each withdrawal total to the corresponding charge on your bank statement.
   - If the totals match, the withdrawal is verified.
   - If a total does not match, expand the withdrawal to review the individual expenses and identify any discrepancies.

---

## How to Export Expensify Card Expenses

1. From the Expensify Card reconciliation view, select the expenses you want to export using the checkboxes.
2. Click **Export** in the actions bar that appears above the results.
3. Select **Basic export** to download the results as a CSV file.

---

# FAQ

## Why Don't I See Expensify Card Under Reconciliation?

The **Expensify Card** option appears under **Reports > Reconciliation** only when your workspace has the Expensify Card enabled. If you do not see it, confirm that the Expensify Card is set up for your workspace.

## What Does a Withdrawal Represent?

A withdrawal represents a single settlement charge from your bank account. It groups together all the individual Expensify Card expenses that were settled in that payment.

## How Is Expensify Card Reconciliation Different From Statement Matching?

Expensify Card reconciliation is withdrawal-based — you match bank withdrawals to grouped expenses. Statement matching is used for company (non-Expensify) cards and compares transaction totals against an external card statement. See [Reconcile Company Cards](/articles/new-expensify/reports-and-expenses/Reconcile-Company-Cards) for details on statement-based reconciliation.
