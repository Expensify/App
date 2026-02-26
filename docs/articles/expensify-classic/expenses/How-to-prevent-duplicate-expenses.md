---
title: How to Prevent Duplicate Expenses
description: Learn why duplicate expenses happen in Expensify and how to prevent SmartScan merge failures. 
keywords: [Expensify Classic, duplicate expenses, SmartScan merge failed, receipt didn’t merge, why didn’t my expenses merge, receipt matching, SmartScan duplicate, expense duplicate warning, card transaction not merging, foreign exchange merge failure, review duplicates, how to prevent duplicate expenses]
internalScope: Audience is members and approvers managing expenses. Covers why duplicate expenses occur and how to prevent SmartScan and card feed merge failures.
---

# How to Prevent Duplicate Expenses

Duplicate expenses most commonly occur when a SmartScanned receipt doesn’t merge with a matching card transaction as expected. This results in two separate expenses for the same purchase. You can reduce the chance of duplicate expenses by ensuring expenses meet the conditions to merge automatically, and manually merging or deleting duplicates as needed. 

---

## How SmartScan automatic expense merge works 

Expensify automatically merges SmartScanned receipts with their matching imported card transaction when specific conditions are met.

Expenses can merge automatically when:

- The amounts match exactly (or fall within the allowed tolerance)
- The transaction dates match
- The currencies match or fall within the allowed foreign exchange tolerance
- Only one matching pair exists
- The card transaction posts within seven days of the receipt being SmartScanned

If any of these conditions are not met, SmartScan will not merge the expenses automatically.

---

## Conditions that prevent SmartScan from merging expenses

SmartScan will not merge expenses automatically if:

- The receipt was not SmartScanned, SmartScan did not complete, or key details were manually edited
- The receipt and card transaction differ in amount, date, or currency
- The card transaction has not posted within seven days of the receipt being SmartScanned
- The foreign exchange difference exceeds five percent
- The receipt was already matched to another expense
- Both expenses are card expenses — card-to-card merges are not allowed
- The expenses exist in different Expensify accounts

---

## How to fix duplicate expenses

If expenses are duplicated because they failed to merge automatically, you can manually merge or delete the duplicate as needed. 

For step-by-step instructions, see:
- [Merge Expenses](https://help.expensify.com/articles/expensify-classic/expenses/Edit-expenses#merge-expenses)
- [Delete Expenses](https://help.expensify.com/articles/expensify-classic/expenses/Edit-expenses#delete-an-expense)

**Note:** When in doubt, keep the imported card expense. It provides more accurate reconciliation with your accounting system.

---

# FAQ

## Why didn’t my receipt merge with my card transaction? 
SmartScan requires a close match in amount, date, and currency. If those details differ, or if the card transaction has not posted within seven days, the expenses will not merge automatically.

## Can expenses merge if they are different currencies? 

Yes. SmartScan can merge expenses in different currencies as long as the foreign exchange difference is five percent or less.

If the foreign exchange difference exceeds five percent, the expenses will not merge automatically.

## Can SmartScan merge expenses after a report is submitted?

Yes. Imported card expenses can still merge with eligible SmartScanned receipts even if the report is Outstanding, Approved, Paid, or Done, as long as the report has not been exported to an accounting integration and the merge does not change the reimbursable total.

## Will Expensify warn me about duplicate expenses?

Yes. Expensify may display a duplicate warning when two expenses appear to represent the same purchase. Review these warnings before submitting or approving a report.

---
