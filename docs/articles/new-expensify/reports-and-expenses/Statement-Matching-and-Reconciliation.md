---
title: Statement Matching and Reconciliation
description: Learn how to reconcile company card transactions in Expensify against your credit card statement.
keywords: [New Expensify, company cards, statement matching, company card reconciliation, reconciliation, card statement, card feed, statement close date, statement mismatch]
internalScope: Audience is Workspace Admins reconciling third-party company card spend. Covers statement-based reconciliation under Reconciliation > Card statements. Does not cover Expensify Card withdrawal-based reconciliation or reimbursement reconciliation.
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

## How Multi-Currency Works With Company Card Reconciliation

If your workspace uses multiple currencies, apply the **Group currency** filter to convert all transactions into a single currency. This ensures the grouped totals match your accounting system's reporting currency.

---

# FAQ

## What Is the Difference Between Company Card Reconciliation and Expensify Card Reconciliation?

Company card reconciliation is statement-based and matches Expensify transaction totals to an external card statement. Expensify Card reconciliation is withdrawal-based and matches bank withdrawals to grouped expenses within Expensify. See [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses) for the Expensify Card workflow.

## Why Don't I See Card Statements Under Reconciliation?

The Card statements option appears only when your workspace has at least one company card feed connected. If you don’t see it, confirm that a company card feed is set up and active.

## What Does the Last Statement Filter Show?

The **Last statement** filter shows transactions posted during the most recent completed statement period, based on your configured statement close date.
