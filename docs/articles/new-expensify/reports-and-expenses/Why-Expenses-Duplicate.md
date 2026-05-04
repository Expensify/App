---
title: Why Expenses Duplicate
description: Learn the most common reasons duplicate expenses happen in Expensify and how to prevent them, including SmartScan merge issues and duplicate uploads.
keywords: [New Expensify, duplicate expenses, SmartScan merge failed, receipt didn't merge, why didn't my expenses merge, receipt matching, SmartScan duplicate, card transaction not merging, foreign exchange merge failure, prevent duplicate expenses, why do I have duplicates]
internalScope: Audience is members and approvers managing expenses. Covers all common causes of duplicate expenses, including SmartScan merge failures, duplicate receipt uploads, and duplicate card imports. Does not cover step by step instructions for resolving, merging, or deleting duplicate expenses and instead links out to how-to articles. 
---

# Why expenses duplicate

Duplicate expenses happen when the same purchase is recorded more than once in Expensify. In most cases, duplicates are caused by one of a few common scenarios.

Understanding these scenarios will help you quickly identify why duplicates happen and how to prevent them.

---

## What causes duplicate expenses

Duplicate expenses usually happen for one of three reasons:

- A receipt and imported credit card transaction for the same purchase did not merge automatically
- The same receipt was uploaded more than once
- A card transaction was imported more than once

Each of these scenarios can result in duplicate expenses for the same purchase.

---

## Why your expenses did not merge

Expensify automatically merges a SmartScanned receipt with a matching card transaction when key details align. If any of these conditions are not met, the receipt and card transaction will remain as separate expenses.

**Expenses can merge automatically when:**

- The amounts match exactly (or fall within the allowed tolerance)
- The transaction dates match
- The currencies match or fall within the allowed foreign exchange tolerance
- Only one possible match exists
- The card transaction posts within seven days of the receipt being SmartScanned

**Expenses will not automatically merge if:** 

- The receipt was not SmartScanned or SmartScan did not complete
- Expense details were edited before the card transaction posted
- The amount, date, or currency differs beyond tolerance
- The card transaction posts after seven days
- The foreign exchange difference exceeds five percent
- The receipt is already matched to another expense
- Both expenses are card transactions
- The expenses are in different Expensify accounts
  
If expenses do not merge automatically, they will remain separate unless you merge them manually. Learn [how to merge expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-merge-expenses). 

---

## Why the same receipt was uploaded more than once

Duplicate expenses can also happen when the same receipt is added multiple times.

This may occur when:

- You upload the same receipt more than once
- You SmartScan a receipt and also upload it manually
- A Copilot uploads an expense that had already been uploaded by the member

Each upload creates a separate expense, even if the receipt details are identical.

---

## Why card transactions import more than once

In some cases, duplicate expenses occur when the same card transaction is imported more than once. 

This most often happens when a card connection is reconnected using a Transaction Start Date that is earlier than the last imported transaction. When this happens, Expensify imports older transactions again, even if they were already imported.

As a result, the same transaction appears multiple times as separate expenses.

---

## What to do if you have duplicate expenses

If you have duplicate expenses, you can use Review Duplicates to resolve them, or merge them manually: 

- [How to Find and Resolve Flagged Duplicate Expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-Find-and-Resolve-Flagged-Duplicate-Expenses)
- [How to Merge Duplicate Expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-Merge-Duplicate-Expenses)

If both expenses are card transactions, they cannot be merged. Instead, [delete the duplicate expense](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Delete-Expenses) or [move the duplicate to your personal space](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Delete-Expenses#deleting-company-card-expenses). 

---

# FAQ

## Why do I have both a receipt and a card transaction for the same expense?

This happens when the receipt and card transaction did not merge into a single expense. This is usually due to differences in amount, date, currency, or timing.

## Why didn’t my receipt merge with my card transaction? 
SmartScan requires a close match in amount, date, and currency. If those details differ, or if the card transaction has not posted within seven days, the expenses will not merge automatically.

## Can uploading the same receipt twice create duplicates?

Yes. Each time a receipt is uploaded, Expensify creates a new expense, even if the receipt is identical.

## Can expenses merge if they are different currencies? 

Yes. SmartScan can merge expenses in different currencies as long as the foreign exchange difference is five percent or less. If the foreign exchange difference exceeds five percent, the expenses will not merge automatically.

## Can SmartScan merge expenses after a report is submitted?

Yes. Imported card expenses can still merge with eligible SmartScanned receipts even if the report is Outstanding, Approved, Paid, or Done, as long as the report has not been exported to an accounting integration and the merge does not change the reimbursable total.

## Will Expensify warn me about duplicate expenses?

Yes. When two expenses appear to represent the same purchase, a red **Potential duplicate** warning will appear on both expenses. Review these warnings before submitting or approving a report.
