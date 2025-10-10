---
title: Statement Matching and Reconciliation
description: Learn how Workspace Admins can use suggested search  to match card statements and reconcile bank activity.
keywords: [statement matching, reconciliation, accounting workflows, Expensify Card, reimbursements, Workspace Admin, bank reconciliation, accounting, suggested search]
---
<div id="new-expensify" markdown="1">

Statement matching and reconciliation workflows bring your financial data together in one place so you can confirm card statement totals and reconcile bank withdrawals from within Expensify. These shortcuts help Workspace Admins keep their books accurate and close periods faster.

# Statement Matching and Reconciliation

Suggested search includes shortcuts for **Statement Matching** and **Reconciliation** so Workspace Admins can close the books faster. These workflows let you compare card statements against recorded spend, and reconcile reimbursements or Expensify Card withdrawals with your bank statement — all without leaving Expensify.

---

## Who can access Statement Matching and Reconciliation
Workspace Admins with:
- the Expensify Card, or
- at least one company card feed connected, or
- Reimbursements enabled with a verified business bank account.

---

## Where to find Statement Matching and Reconciliation
Go to:
- **Reports > Accounting > Statement** — compare card statement totals against recorded spend
- **Reports > Accounting > Reconciliation** — match bank withdrawals for reimbursements or Expensify Card charges

---

## Statement Matching
Statement Matching helps you verify that all company card transactions in Expensify match your card statement total.

The Statement Matching view shows:
- **Grouped by card** view with subtotals per card
- **Feed filter** if you have more than one card feed
- **Posted filter** with a preset for **Last statement**
- **Total footer** showing the sum of transactions for the statement period

**Steps:**
1. Open **Reports > Accounting > Statement**.
2. Apply the **Feed** filter for the correct card account.
3. Use the **Posted** filter with **Last statement**.
4. Compare the **Total** footer with your card statement.
   - If totals match, you’re done.
   - If not, expand the card groups to find missing or unmatched transactions.

**Note:** Admins can configure a **Statement close date** in card settings. By default, this is the last day of the month, but you can update the statement close date any time.

---

## Reconciliation
Reconciliation helps you match payments and withdrawals to ensure your books reflect reality.

**Expensify Card Reconciliation**
1. Open **Reports > Accounting > Reconciliation**.
2. Group expenses by **Withdrawal ID**.
3. Use the **Withdrawal type** filter and select **Expensify Card**.
4. Apply the **Withdrawn** filter with **Last month**.
5. Compare totals per withdrawal against your bank statement.

**Out-of-pocket Reconciliation**
1. Open **Reports > Accounting > Reconciliation**.
2. Group expenses by **Withdrawal ID**.
3. Use the **Withdrawal type** filter and select **Reimbursement**.
4. Apply the **Withdrawn** filter with **Last month**.
5. Compare totals per reimbursement against your bank statement.

---

## Multi-currency
If your workspace has multiple currencies:
- Apply the **Group currency** filter to convert all spend into a single currency (for example, GBP).
- This ensures grouped totals match your accounting system’s reporting currency.

---

# FAQ

## What’s the difference between Statement Matching and Reconciliation?
Statement Matching checks that all card transactions in Expensify equal the card statement total.  
Reconciliation ensures payments (card withdrawals or reimbursements) match what cleared your bank account.

## Can I expand grouped results to see individual transactions?
Yes. You can expand or collapse groups (by card or withdrawal ID) inline to view the underlying transactions.

## Why don’t I see the Reconciliation view?
The **Reconciliation** shortcut in the Accounting section only appears if your workspace has reimbursements enabled (verified business bank account) or an approved Expensify Card connected.

## What’s the default Statement close date?
For new card feeds, the last day of the month is automatically selected. You can update the statement close date anytime in **Settings > Workspaces > [Workspace Name] > Company Cards**.

</div>
