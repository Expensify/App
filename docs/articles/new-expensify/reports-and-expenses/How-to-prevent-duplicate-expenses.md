---
title: How to Prevent Duplicate Expenses
description: Learn why duplicate expenses happen in Expensify and how to prevent SmartScan merge failures. 
keywords: [New Expensify, duplicate expenses, SmartScan merge failed, receipt didn’t merge, why didn’t my expenses merge, receipt matching, SmartScan duplicate, expense duplicate warning, card transaction not merging, foreign exchange merge failure, review duplicates]
internalScope: Audience is members and approvers managing expenses. Covers why duplicate expenses occur and how to prevent SmartScan and card feed merge failures. Does not cover how to edit, merge, split, or delete expenses step-by-step.
---

Duplicate expenses typically occur when a SmartScanned receipt does not merge with its matching imported card transaction. This guide explains why duplicates happen and how to prevent them.

# How to prevent duplicate expenses in Expensify

## Why duplicate expenses happen

Duplicate expenses most commonly occur when a SmartScanned receipt doesn’t merge with a matching card transaction as expected. This results in two separate expenses for the same purchase.

---

## How SmartScan automatic expense merge works 

Expensify automatically merges a SmartScanned receipt with its matching imported card transaction when specific conditions are met.

Expenses can merge automatically when:

- The amounts match exactly (or fall within the allowed tolerance)
- The transaction dates match
- The currencies match or fall within the allowed foreign exchange tolerance
- Only one matching pair exists
- The card transaction posts within 7 days of the receipt being SmartScanned

If any of these conditions are not met, SmartScan will not merge the expenses automatically.

---

## Common reasons SmartScan merge fails

SmartScan will not merge expenses automatically if:

- The receipt was not SmartScanned, SmartScan did not complete, or key details were manually edited
- The receipt and card transaction differ in amount, date, or currency
- The card transaction has not posted within seven days of the receipt being SmartScanned
- The foreign exchange difference exceeds five percent
- The receipt was already matched to another expense
- Both expenses are card expenses — card-to-card merges are not allowed
- The expenses exist in different Expensify accounts

---

## How to prevent duplicate expenses

To reduce the chance of duplicate expenses:

- SmartScan the final receipt total (for example, include the receipt showing the tip if one was added)
- Avoid uploading the same receipt multiple times
- Do not edit key fields (amount, date, currency) while SmartScan is processing
- Wait for the card transaction to post before manually resolving duplicates
- Review duplicate warnings before submitting or approving a report

## How to fix duplicate expenses

If expenses are duplicated because they failed to merge automatically, you can manually merge or delete the duplicate as needed. 

For step-by-step instructions, see:
- [Merge Expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Merging-expenses)
- [Delete Expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Delete-Expenses)

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


