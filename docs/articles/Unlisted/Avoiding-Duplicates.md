---
title: Avoiding Duplicates in Expensify
description: Learn how to prevent and resolve duplicate expenses and duplicate reports in Expensify to keep your accounting accurate. 
keywords:[New Expensify, Expensify Classic, duplicate expenses, duplicate reports, SmartScan merge, merge failed, card feed duplicates, auto-sync duplicates, double exports, prevent duplicates, failed SmartScan, receipts didn’t merge, multiple card feeds]
internalScope: Audience is members managing expenses and reports. Covers causes and resolution of duplicate expenses and reports. Does not cover backend accounting platform configuration or subscription billing issues.
---

Duplicate expenses and reports can cause accounting errors, double reimbursements, and reconciliation issues. This guide explains why duplicates occur and how to prevent them.

# Avoiding duplicates in Expensify

## Why duplicates happen
There are two main types of duplicates:  
- **Expense duplicates** – A SmartScanned receipt doesn’t merge with a matching card transaction, creating two separate expenses.  
- **Report duplicates** – A report is both auto-synced to your accounting software and manually exported, creating two versions of the same expenses.  

---

## How to avoid duplicate expenses
Expense duplicates usually occur when a SmartScanned receipt fails to merge with its card feed transaction.  

## Common reasons SmartScan merge fails

- The receipt and card transaction differ in amount, date, or currency
- The card transaction hasn’t posted within seven days of the receipt being SmartScanned
- The receipt was already matched to another expense
- Both expenses are card expenses — **card-to-card merges are not allowed**

**Note:** When in doubt, it’s best to keep the card version for accurate reconciliation with your accounting software.

**ADD A SCREENSHOT HERE.** Suggestion: Merge button and error tooltip when merge is unavailable due to card-to-card restriction.

## How to resolve duplicate expenses 

1. **Wait for auto-merge or duplicate detection review** – Expensify may automatically prompt a review once the transaction imports.  
2. **Merge manually** – Open the expense → More → Merge. *Note: at least one expense must be a cash or non-card expense; two card expenses cannot be merged.*  
3. **Delete the duplicate** – Only after confirming it’s safe and editing is allowed.  
4. **Review duplicate holds** – If flagged, select **Review duplicates** to choose one expense, discard duplicates, or merge where possible.  

**Note:** Unresolved duplicates can carry into reports and later create duplicate exports in your accounting system.  

For details, see [Editing expenses](https://help.expensify.com/articles/expensify-classic/expenses/Edit-expenses) and [Reconcile company card expenses](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Reconcile-Company-Card-Expenses).  

---

## How to prevent duplicate reports
Report duplicates happen when the same report is exported twice to your accounting system.  

**Common causes**  
- **Auto-sync + manual export** – If auto-sync is enabled for QuickBooks Online, Xero, or NetSuite, manually exporting the same report again creates a duplicate.  
- **Multiple exports with different settings** – Exporting under different configurations can duplicate transactions.  

**How Expensify manages re-exporting**  
- For QuickBooks Online, Expensify warns you before re-exporting a report that was already exported.  
- Auto-sync exports newly approved reports only; it does not retroactively export older reports.  

## How to avoid duplicate reports
- **Check if the report already exported** – Open the report and look for export confirmation.  
- **Rely on auto-sync if enabled** – Avoid manual exports when accounting integrations already sync automatically.  

---

# FAQ

## Why didn’t my expenses merge?  
Receipts and card transactions must closely match on amount and date. If they don’t, Expensify won’t merge them automatically. You can merge manually or delete one duplicate.  

## How do I check if my report already exported?  
Open the report in Expensify. If you see export confirmation or sync status, the report has already exported. Avoid re-exporting it.  

## What should I do if I see duplicate reports in my accounting software?  
Remove or delete the duplicate report directly in your accounting software. Then confirm that only one sync method (auto-sync or manual export) is being used.  

## What version of an expense should I keep?

Keep the expense imported from the card feed whenever possible. It ensures more accurate reconciliation with your accounting software.

---


