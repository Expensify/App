---
title: Merge Expenses
description: Learn how to merge two expenses to eliminate duplicates and simplify your reports.
keywords: [New Expensify, merge expenses, duplicate expenses, SmartScan, manual merge, combine expenses, combine duplicate expenses, merge receipts, expense matching]
---


Use merging to resolve duplicates when SmartScan doesn’t catch them. This guide walks you through manually merging two expenses from the expense view or Reports page.

# Merge expenses

You can merge two expenses if at least one is a cash expense. You cannot merge two card expenses. Merging is only available for editable expenses (such as those that are unsubmitted or awaiting first-level approval).

## Merging from an individual expense

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Reports > Expenses**
2. Tap the expense you'd like to merge from.
3. Tap the **More** button, then select **Merge**.
4. Choose another eligible expense to merge with.
   - You can only select one.
   - Expenses are sorted by date (newest first).
   - If there are no eligible matches, you'll see:
     *"You don’t have any expenses that can be merged with this one. [Learn more](#eligible-expenses)."*
5. If only one expense has a receipt, it’s selected automatically. If both do, you’ll be asked to choose.
6. Select the details you want to keep from each expense—like merchant name, amount, or category.
7. Tap **Continue**, then **Confirm** to complete the merge.

## Eligible expenses for merging

To merge two expenses, they must meet all of the following:

- **By type**:
  - You can merge a cash expense with another cash expense, or a cash expense with a card expense.
  - You cannot merge two card expenses.

- **By permission**:
  - **Submitters** can merge their own expenses (including unreported and in-progress ones).
  - **Approvers and Admins** can merge expenses on the same report

- **By status**:
  - Both expenses must be editable. That includes unreported expenses, or ones on a Draft or Outstanding report that hasn’t yet been approved.

## What happens when you merge?

- One expense is kept, and the details you choose will be used for the final version.
- The other expense is **merged into the final one** and no longer shown separately.
- If one expense is a card transaction, it will always be the one that’s kept.
- If both are cash expenses, the one you started the merge from will be kept.

## Can I change an expense from cash to credit card?
You can’t change an expense from cash to credit card, or the other way around.  

- Expenses imported directly from a connected credit card are always **credit card expenses**.  
- Expenses you create manually, or those created from uploaded receipts, are always **cash expenses**.  

# FAQ

## Can I merge two card expenses?

No. Only one card expense can be part of a merge. You can merge:
- Two cash expenses
- One cash and one card expense

## What happens to the other expense?

It’s merged into the final expense and no longer appears separately. Its details are combined based on what you selected.

## What if the expenses have the same details?

If there are no differences to resolve, the system automatically keeps the shared values without prompting you.

## Why don’t I see the Merge option?

Check these conditions:
- You must have permission to edit both expenses.
- At least one expense must be a cash transaction.
- The expenses must be editable (not submitted or fully approved).

