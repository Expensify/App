---
title: Reconcile Company Cards
description: Learn how to reconcile company card transactions in Expensify against your external card statement.
keywords: [company cards, statement matching, reconciliation, card statement, card feed, statement close date]
internalScope: Audience is Workspace Admins reconciling non-Expensify company card spend. Covers statement-based reconciliation under Reconciliation > Card statements. Does not cover Expensify Card withdrawal-based reconciliation or reimbursement reconciliation.
---

# Reconcile Company Cards

Company card reconciliation is **statement-based** — you compare the transactions recorded in Expensify against your external card provider's statement to verify that totals match for a given period. This helps you confirm that all card activity has been captured before closing your books.

For an overview of all reconciliation workflows, see [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation).

---

## Who Can Reconcile Company Cards

Workspace Admins whose workspace has at least one company card feed connected can access the company card reconciliation workflow.

---

## How to Reconcile Company Card Transactions Against a Statement

1. Go to **Reports > Reconciliation > Card statements**.
2. Apply the **Feed** filter to select the card account you want to reconcile.
3. Use the **Posted** filter and select **Last statement** (or set a custom date range that matches your statement period).
4. Review the **Total** shown at the bottom of the results and compare it to your card statement total.
   - If the totals match, the statement period is verified.
   - If the totals do not match, expand the card groups to review individual transactions and identify missing or unmatched expenses.

---

## How to Identify Discrepancies in Company Card Reconciliation

If the Expensify total does not match your card statement:

1. Expand the card groups in the reconciliation view to see individual transactions.
2. Compare each transaction against your card statement line items.
3. Look for missing transactions that appear on your card statement but not in Expensify, or duplicate transactions that may have been recorded twice.
4. Check the posting dates — a transaction may fall into a different statement period in Expensify than on your card statement if posting dates differ.

---

## How to Configure the Statement Close Date for Company Cards

By default, the statement close date is set to the last day of the month for new card feeds. You can update this date to match your card provider's billing cycle:

1. Go to **Settings > Workspaces > [Workspace Name] > Company Cards**.
2. Update the statement close date to match your card provider's cycle.

This ensures the **Last statement** filter in the reconciliation view aligns with your actual statement period.

---

## How Multi-Currency Works With Company Card Reconciliation

If your workspace uses multiple currencies, apply the **Group currency** filter to convert all transactions into a single currency. This ensures the grouped totals match your accounting system's reporting currency.

---

# FAQ

## What Is the Difference Between Company Card Reconciliation and Expensify Card Reconciliation?

Company card reconciliation is statement-based — you match Expensify transaction totals to an external card statement. Expensify Card reconciliation is withdrawal-based — you match bank withdrawals to grouped expenses within Expensify. See [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses) for the Expensify Card workflow.

## Why Don't I See Card Statements Under Reconciliation?

The **Card statements** option appears only when your workspace has at least one company card feed connected. If you do not see it, confirm that a card feed is set up under **Settings > Workspaces > [Workspace Name] > Company Cards**.

## What Does the Last Statement Filter Show?

The **Last statement** filter shows transactions posted during the most recent completed statement period, based on your configured statement close date.
