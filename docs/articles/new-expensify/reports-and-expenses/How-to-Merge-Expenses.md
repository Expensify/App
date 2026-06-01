---
title: How to Merge Duplicate Expenses
description: Learn how to manually merge duplicate expenses in Expensify, including eligibility rules, supported expense types, and what happens after the merge.
keywords: [New Expensify, merge expenses, combine expenses, merge duplicate expenses, merge receipts, fix duplicate expense, merge transactions, combine transactions, deduplicate expenses, merge button missing]
internalScope: Audience is all members. Covers manually merging duplicate expenses and eligibility rules. Does not cover automatic duplicate detection, resolving flagged duplicates, or SmartScan merge logic.
---

# How to merge duplicate expenses

You can manually merge duplicate expenses when two expenses represent the same purchase. This is useful when a receipt and its matching card transaction were not automatically combined.

There are several ways to merge duplicate expenses: 

- From the Expenses page
- From within a report
- From inside an individual expense

If Expensify already flagged an expense as a duplicate and shows a red dot with **Review duplicates**, follow How to [Resolve Flagged Duplicate Expenses](https://help.expensify.com/articles/new-expensify/How-to-Find-and-Resolve-Flagged-Duplicate-Expenses) instead.


If you want to learn why duplicate expenses happen, see [Why Expenses Duplicate](https://help.expensify.com/articles/new-expensify/Why-Expenses-Duplicate).

---

## Who can merge duplicate expenses

You can merge duplicate expenses if you can edit both expenses.

- Submitters can merge their own unreported expenses, expenses on Draft reports, and expenses on Outstanding reports.
- Approvers and Workspace Admins can merge expenses on the same Draft or Outstanding report. 

You can't merge expenses that are Approved or Paid. Learn more about [expense statuses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions). 

---

## What types of expenses can be merged

You can merge:

- Two cash expenses
- One cash expense and one imported card expense

You cannot merge two imported card expenses. 

---

<!-- CROSS LINK:
Create new page describing expense icons and what they mean. WIP here: https://github.com/Expensify/Expensify/issues/614406
-->

---

## How to merge duplicate expenses from the Expenses page

Use this method when you already see both duplicate expenses on the Expenses page. 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Expenses**.
2. Select two expenses to merge.
3. Choose **Selected**, then select **Merge**.
4. If both expenses have receipts, select the one you want to keep.
5. Choose which expense details to apply to the final expense. 
6. Select **Merge expenses**.

---

## How to merge duplicate expenses from a report

Use this method when both expenses are inside the same report.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** 
2. Click the report to open it. 
3. Select the two expenses you want to merge
4. Choose **Selected**, then select **Merge**.
5. If both expenses have receipts, choose which receipt to keep
6. Choose which expense details to apply to the final expense. 
7. Select **Merge expenses**.

---

![expenses selected within a report > Selected button > Merge highlighted]({{site.url}}/assets/images/ExpensifyHelp-ResolveDuplicates_01){:width="100%"}

---

## How to merge duplicate expenses from an individual expense

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Spend > Expenses**
2. Click on the expense you want to merge to open it. 
3. Choose **More**, then select **Merge**.
4. Choose one eligible expense to merge with, then select **Continue**. 
5. If both expenses have receipts, select which receipt to keep.
6. Choose which expense details to apply to the final expense. 
7. Select **Merge expenses**.

---

![one individual expense > More > Merge > one eligible expense selected]({{site.url}}/assets/images/ExpensifyHelp-ResolveDuplicates_02){:width="100%"}

---

## What happens after you merge duplicate expenses

After you merge duplicate expenses:

- One expense becomes the final expense.
- The other expense is merged into it and no longer appears separately.
- The details you selected are saved on the final expense.
- If one expense is an imported card expense, that expense is kept as the final expense.
- If both expenses are cash expenses, the expense you started from is kept.

---

# FAQ

## Can I merge two imported card expenses?

No. You can only merge two cash expenses or one cash expense and one imported card expense.

## What happens to the other expense after I merge duplicate expenses?

The second expense is merged into the final expense and no longer appears separately. The final expense reflects the expense details you selected during the merge process.

## Why was I not asked to choose which expense details to apply to the final expense? 

If both expenses already have the same details, the final expense keeps those values automatically.

## Why is the Merge option missing on my expenses?

You won’t see **Merge** if:

- You don’t have permission to edit both expenses.
- Both expenses are imported card transactions.
- One or both expenses are Approved or Paid.
- One or both expenses are no longer editable.

## Can I undo a merged expense?

No. Merging expenses can't be undone, so review the details before confirming.
