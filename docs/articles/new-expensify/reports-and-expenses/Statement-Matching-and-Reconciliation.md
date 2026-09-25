---
title: Statement Matching and Reconciliation
description: Learn how to reconcile company card transactions in Expensify against your credit card statement.
keywords: [New Expensify, company cards, statement matching, company card reconciliation, reconciliation, card statement, card feed, statement close date, statement mismatch, export card statement, Reconciliation - All Expenses, export card group]
internalScope: Audience is Workspace Admins reconciling third-party company card spend. Covers statement-based reconciliation under Reconciliation > Card statements, including exporting selected card groups with the Reconciliation - All Expenses template. Does not cover Expensify Card withdrawal-based reconciliation or reimbursement reconciliation.
---

# Statement Matching and Reconciliation

Company card reconciliation helps you match the transactions in Expensify to your card statement for a given period. This ensures the totals line up and all card activity is accounted for before you close your books.

---

## Who Can Reconcile Company Cards

Workspace Admins whose workspace has at least one company card feed connected can reconcile company cards in Expensify.

---

## How to Reconcile Company Card Transactions Against a Statement

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and go to **Spend**.
2. In the **Reconciliation** section, select **Card statements**.
3. Choose the **Feed** filter to select the card feed or account you want to reconcile.
4. Choose the **Posted** filter to select the date range that matches your statement period. 
5. Review the **Total spend** shown at the bottom of the results and compare it to your card statement total.
   - If the totals match, the statement period is reconciled.
   - If the totals do not match, expand the card groups to review individual transactions and identify missing expenses. 

---

## How to Identify and Fix Discrepancies in Company Card Reconciliation

If the Expensify total does not match your card statement:

1. From the reconciliation view, click the arrow next to the total to see individual transactions. 
2. Compare each transaction against your card statement line items.
3. Look for missing transactions that appear on your card statement but not in Expensify, or duplicate transactions that may have been recorded twice.
4. Check the posting dates — a transaction may fall into a different statement period in Expensify than on your card statement if posting dates differ.

---

## How to Export the Card Transactions You Are Reconciling

You can export the card groups you're reconciling to a CSV without expanding them first.

1. From the **Card statements** view, check the box next to each card group you want to export.
2. Click the selection button at the top (for example, **1 selected**).
3. Select **Export**.
4. Select **Reconciliation - All Expenses**.

The export covers every transaction on each selected card group, including transactions further down the list that you haven't scrolled to yet. If you also expanded a group and checked individual transactions, those are included as well.

**Reconciliation - All Expenses** and **Current view** are the only options offered for a card group selection. To use a different export template, expand the group and select the individual transactions instead. Learn more about [exporting grouped expenses](/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses#export-grouped-expenses).

---

## How Multi-Currency Works With Company Card Reconciliation

If your workspace uses multiple currencies, apply the **Group currency** filter to convert all transactions into a single currency. This ensures the grouped totals match your accounting system's reporting currency.

---

# FAQ

## What Is the Difference Between Company Card Reconciliation and Expensify Card Reconciliation?

Company card reconciliation is statement-based and matches Expensify transaction totals to an external card statement. Expensify Card reconciliation is withdrawal-based and matches bank withdrawals to grouped expenses within Expensify. See [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses) for the Expensify Card workflow.

## Why Don't I See Card Statements Under Reconciliation?

The Card statements option appears only when your workspace has at least one company card feed connected. If you don’t see it, confirm that a company card feed is set up and active.

## Why Don't I See Reconciliation - All Expenses When I Select a Card Group?

The **Reconciliation - All Expenses** template is offered only to Workspace Admins and card admins of a workspace that has a card product enabled. If you don't have one of those roles, **Current view** is the only export option for a card group selection.

## What Does the Last Statement Filter Show?

The **Last statement** filter shows transactions posted during the most recent completed statement period, based on your configured statement close date.
