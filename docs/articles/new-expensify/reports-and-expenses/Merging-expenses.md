---
title: Merge Expenses
description: Learn how to merge duplicate expenses in Expensify, including cash and card transactions, eligibility rules, and step-by-step instructions for web and mobile.
keywords: [merge expenses, duplicate expenses, combine expenses, merge duplicate expenses, merge receipts, SmartScan duplicate, cash expense, card expense, expense matching, fix duplicate expense]
internalScope: Audience is all members. Covers manually merging duplicate expenses and eligibility rules. Does not cover SmartScan automation logic or expense deletion workflows.
---


Use merging to resolve duplicates when SmartScan doesn’t catch them. This guide walks you through manually merging two expenses from the expense view or Reports page.

# Merge expenses

If you have duplicate expenses that SmartScan didn’t automatically match, you can manually merge them. Merging helps clean up duplicates and keeps your reports accurate.

You can merge:
- Two cash expenses
- One cash expense and one card expense

You cannot merge two card expenses.

---

## Who can merge expenses 

You can merge expenses if you have permission to edit both expenses.

- **Submitters** can merge their own:
  - Unreported expenses  
  - Expenses on Draft reports  
  - Expenses on Outstanding reports  

- **Approvers and Workspace Admins** can merge expenses on the same Draft or Outstanding report.

You cannot merge expenses that are fully approved or paid.

---

## What types of expenses can be merged 

To merge two expenses, one of the following must be true:

- Both expenses are cash expenses  
- One expense is a cash expense and the other is an imported card expense  

You cannot merge two imported card expenses.

Note: Merging does not convert expense types.

---

## How to merge duplicate expenses from an individual expense

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Reports > Expenses**
2. Click on the expense you want to merge to open it. 
3. Choose **More**, then select **Merge**.
4. Choose one eligible expense to merge with.
5. If both expenses have receipts, select which receipt to keep.
6. Choose the details to keep from each expense such as merchant name, date or report.
7. Select **Continue**, then **Merge expenses**.

---

## How to merge duplicate expenses from the Expenses page

Use this method when you already see both duplicate expenses in a list.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Reports > Expenses**
2. Select two expenses to merge.
3. Choose **Selected**, then select **Merge**.
4. If both expenses have receipts, select the one you want to keep.
5. Choose the details to keep from each expense such as merchant name, date or report. 
6. Select **Continue**, then **Merge expenses**.

---

## What happens when expenses are merged

When you merge expenses:

- One expense becomes the final expense.
- The other expense is merged into it and no longer appears separately.
- The details you selected are applied to the final expense.

**Additional rules:**

- If one expense is a card transaction, the card expense is always kept.
- If both expenses are cash expenses, the one you started the merge from is kept.

---

## Can expenses be converted from cash to card?

You can’t change an expense from cash to card, or card to cash.

- Expenses imported directly from a connected credit card are always **card expenses**.  
- Expenses you create manually or from uploaded receipts are always **cash expenses**.  

---

# FAQ

## Can I merge two card expenses?

No. Only one card expense can be part of a merge. You can merge:
- Two cash expenses
- One cash and one card expense

## What happens to the other expense after merging?

The second expense is merged into the final expense and no longer appears separately. The final expense reflects the details you selected during the merge process.

## What if the expenses have the same details?

If there are no differences between the two expenses, Expensify automatically keeps the shared values without prompting you to choose.

## Why is the Merge option not showing?

You won’t see **Merge** if:

- You don’t have permission to edit both expenses.
- Both expenses are card transactions.
- One or both expenses are fully approved or paid.
- The expenses are no longer editable.

