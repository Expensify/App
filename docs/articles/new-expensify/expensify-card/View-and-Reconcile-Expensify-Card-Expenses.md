---
title: View and Reconcile Expensify Card Expenses
description: Learn how to view, verify, and export Expensify Card expenses by matching settlement withdrawals to grouped transactions in Expensify.
keywords: [New Expensify, Expensify Card reconciliation, reconcile Expensify Card withdrawals, view Expensify Card expenses, verify Expensify Card totals, export Expensify Card expenses, withdrawal-based reconciliation, Expensify Card current balance transactions, view transactions, Workspace Admin]
internalScope: Audience is Workspace Admins reconciling Expensify Card activity. Covers the withdrawal-based reconciliation workflow under Accounting > Bank reconciliation. Does not cover company card statement matching, reimbursement reconciliation, or manual export-based reconciliation.
---

# View and Reconcile Expensify Card Expenses

Expensify Card reconciliation helps you match each bank withdrawal (also known as a settlement) to the group of card expenses it covers. You can review and verify these withdrawals directly in Expensify. 

---

## Who Can Reconcile Expensify Card Expenses

Workspace Admins can reconcile Expensify Card expenses when the Expensify Card is enabled on the Workspace.

---

## How to View Expensify Card Withdrawals

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and go to **Spend**.
2. In the **Accounting** section, select **Bank reconciliation**.
3. Make sure the **Withdrawal type** filter is set to **Expensify Card**.
4. Choose the **Withdrawn** filter to select a date range (for example, **Last month**).
5. Review the list of withdrawals. Each row represents a single settlement withdrawal from your bank account.

**Note:** Use **Bank reconciliation**, not **Card statements**. **Card statements** groups expenses by card, not by withdrawal.

---

## How to View Expenses Included in an Expensify Card Withdrawal

1. From the Expensify Card reconciliation view, locate the withdrawal you want to review.
2. Click the arrow next to the withdrawal amount to expand the row.
3. Review the individual expenses included in that withdrawal.
   
---

## How to View the Transactions That Make Up Your Expensify Card Current Balance

The **Current balance** on the Expensify Card page reflects the card expenses that have not yet been withdrawn from your settlement account. You can open a filtered list of those transactions directly from the Expensify Card page.

1. From the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace Name] > Expensify Card**.
2. Under the **Current balance** amount, click **View transactions**.
3. Review the filtered results, which show the card expenses counted toward the current balance.

---

## How to Verify Expensify Card Withdrawal Totals Against Your Bank Statement

1. On your bank statement, locate Expensify Card settlement charges.
2. From the reconciliation view, find the matching withdrawal.
3. Compare the withdrawal total to the bank charge.

- If the totals match, the withdrawal is reconciled.
- If the totals do not match, expand the withdrawal to review individual expenses and identify discrepancies.

---

## How to Export Expensify Card Expenses

1. From the Expensify Card reconciliation view, select the expenses you want to export using the checkboxes.
2. In the bar that appears at the bottom of the results, click **Export**. If you don't see it, click **More** first.
3. Choose an export template to download the results as a CSV file.

---

## How to Download an Expensify Card Statement PDF

You can download a PDF statement for one or more Expensify Card settlements. A settlement is a single withdrawal from your bank account. The statement lists each card transaction and payment in the settlement.

**Note:** Statements are only available from **Bank reconciliation**. **Card statements** groups expenses by card, so **Download statement** never appears there.

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and go to **Spend**.
2. In the **Accounting** section, select **Bank reconciliation**.
3. Make sure the **Withdrawal type** filter is set to **Expensify Card**.
4. Use the **Withdrawn** filter to choose the period you want (for example, **Last month**).
5. Optional: To get a statement for one workspace only, add a **Workspace** filter for that workspace.
6. Check the box next to each settlement you want. Each row is one bank withdrawal, not one card. You can also expand a settlement and check every transaction in it.
7. Click **Download statement**:
   - On web, it's in the bar at the bottom of the results. If you don't see it, click **More** first.
   - On mobile, tap the **_N_ selected** button, then tap **Download statement**.
8. Wait for the statement to generate, then the PDF downloads automatically.

**Download statement** only appears when all of the following are true:

- You're a Workspace Admin with export access to the settlement.
- You selected whole settlements. If you expand a settlement and check only some of its transactions, the option is hidden.
- You checked settlement rows yourself. Using select-all-matching mode hides the option.
- All selected settlements come from the same Expensify Card feed. If you select settlements from more than one feed, you'll see the message **Please select settlements from one Expensify Card feed at a time.** and no statement is generated.
- Your only filters are **Withdrawal type**, **Withdrawn**, **Withdrawal status**, **Feed**, **Bank account**, or one **Workspace**. Any other filter hides the option so the statement always matches the settlement in full. This includes **Posted**, **Status**, merchant, category, amount, or more than one workspace.

Filtering by **Bank account** keeps **Download statement** available. Each settlement is withdrawn from a single bank account, so this filter keeps or removes whole settlements rather than narrowing the transactions inside one. This is useful for isolating an Expensify Card program that settles to its own bank account.

With no **Workspace** filter, the statement covers the entire settlement across every workspace it spans. With one **Workspace** filter, the statement shows that workspace's share of each settlement, and the header reads "This workspace's share of each settlement."

![The Expensify Card reconciliation list with the Withdrawn date-range filter open, several settlement withdrawal rows, and one row expanded to reveal its individual expenses]({{site.url}}/assets/images/Expensify_Card_Withdrawal_Transactions.png){:width="100%"}

---

# FAQ

## Why don't I see Expensify Card withdrawals in Bank reconciliation?

**Bank reconciliation** only shows Expensify Card withdrawals when the Expensify Card is enabled for your Workspace. If you don’t see them, confirm that the Expensify Card is enabled and active, and that the **Withdrawal type** filter is set to **Expensify Card**.

## How is Expensify Card reconciliation different from statement matching?

Expensify Card reconciliation uses withdrawal-based matching, where each bank withdrawal corresponds to grouped expenses. Company card reconciliation uses statement matching, where transactions are compared against an external card statement.

## Why don't I see any withdrawals in the Expensify Card reconciliation view? 

If you don’t see any withdrawals, adjust the **Withdrawn** filter and select a different date range.

## Why don't I see Download statement when I select a settlement?

First, make sure you're on **Bank reconciliation**, not **Card statements**. **Download statement** never appears on **Card statements**.

**Download statement** also appears only for Workspace Admins with export access to the settlement. It's hidden if you selected only part of a settlement, if a transaction-narrowing filter (such as **Posted**, **Status**, merchant, category, or amount) is active, or if you're using select-all-matching mode instead of selecting the settlement rows.

## Can I download a statement for one Expensify Card program?

Yes. If each program settles to its own bank account, apply the **Bank account** filter for that account to show only its settlements, then select the settlements and click **Download statement**. The **Bank account** filter keeps **Download statement** available because it selects whole settlements rather than narrowing the transactions inside them.

## Can I download a statement for a failed or pending settlement?

Yes. Failed and pending settlements can be downloaded, and the statement labels each settlement's status.

## Can I download a statement while offline?

No. You'll see an offline message and no statement is generated. Reconnect to the internet and try again.
