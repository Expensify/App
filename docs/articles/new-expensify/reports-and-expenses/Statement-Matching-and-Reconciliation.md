---
title: Statement Matching and Reconciliation
description: Learn how Workspace Admins can match card statement totals and reconcile bank withdrawals from within Expensify.
keywords: [statement matching, reconciliation, Expensify Card, bank reconciliation, card statements, reimbursements, Workspace Admin, withdrawal matching]
internalScope: Audience is Workspace Admins who need to verify card statement totals and reconcile bank withdrawals. Covers statement matching and reconciliation workflows in Reports. Does not cover viewing or exporting individual card transactions.
---
<div id="new-expensify" markdown="1">

Statement matching and reconciliation workflows help you confirm card statement totals and reconcile bank withdrawals from within Expensify. These workflows let Workspace Admins compare card statements against recorded spend and match payments with bank activity without leaving Expensify.

# Statement Matching and Reconciliation

Statement matching and reconciliation are available as suggested search shortcuts under **Reports > Reconciliation**. They help you close your books faster by comparing card statements against recorded spend and matching withdrawals or reimbursements with your bank statement.

To view, filter, or export individual Expensify Card transactions, see [View and Export Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses).

---

## Who Can Use Statement Matching and Reconciliation

Workspace Admins with at least one of the following:
- The Expensify Card
- At least one company card feed connected
- Reimbursements enabled with a verified business bank account

Only the options that apply to your workspace configuration are shown.

---

## Where to Find Statement Matching and Reconciliation

Go to **Reports > Reconciliation**, where you can access:
- **Card statements** — compare card statement totals against recorded spend.
- **Expensify Card** — match Expensify Card withdrawals with your bank statement.
- **Reimbursements** — match reimbursement payments with your bank statement.

---

## How to Match Card Statements Using Statement Matching

Statement matching helps you verify that all company card transactions in Expensify match your card statement total.

1. Open **Reports > Reconciliation > Card statements**.
2. Apply the **Feed** filter for the correct card account.
3. Use the **Posted** filter with **Last statement**.
4. Compare the **Total** footer with your card statement.
   - If totals match, the statement period is verified.
   - If totals do not match, expand the card groups to find missing or unmatched transactions.

Admins can configure a statement close date in card settings. By default, this is the last day of the month. You can update the statement close date anytime in **Settings > Workspaces > [Workspace Name] > Company Cards**.

---

## How to Reconcile Expensify Card Withdrawals

1. Open **Reports > Reconciliation > Expensify Card**.
2. Group expenses by **Withdrawal ID**.
3. Apply the **Withdrawn** filter (for example, **Last month**).
4. Compare totals per withdrawal against your bank statement.

---

## How to Reconcile Reimbursement Payments

1. Open **Reports > Reconciliation > Reimbursements**.
2. Group expenses by **Withdrawal ID**.
3. Apply the **Withdrawn** filter (for example, **Last month**).
4. Compare totals per reimbursement against your bank statement.

---

## How Multi-Currency Works With Statement Matching and Reconciliation

If your workspace uses multiple currencies, apply the **Group currency** filter to convert all spend into a single currency. This ensures grouped totals match your accounting system's reporting currency.

---

# FAQ

## What Is the Difference Between Statement Matching and Reconciliation?

Statement matching checks that all card transactions in Expensify equal the card statement total. Reconciliation ensures payments (card withdrawals or reimbursements) match what cleared your bank account.

## Can I Expand Grouped Results to See Individual Transactions?

Yes. You can expand or collapse groups (by card or withdrawal ID) to view the underlying transactions.

## Why Don't I See the Reconciliation Section?

The **Reconciliation** section appears only when your workspace has at least one of: company card feeds, the Expensify Card, or reimbursements with a verified business bank account.

## What Is the Default Statement Close Date?

For new card feeds, the last day of the month is automatically selected. You can update the statement close date anytime in **Settings > Workspaces > [Workspace Name] > Company Cards**.

</div>
