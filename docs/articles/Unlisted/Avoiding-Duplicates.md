---
title: Avoiding Duplicates in Expensify
description: Learn how to prevent and resolve duplicate expenses and duplicate reports in Expensify to keep your accounting accurate. 
keywords: [New Expensify, duplicate expenses, duplicate reports, SmartScan merge, merge failed, card feed duplicates, auto-sync duplicates, double exports, prevent duplicates]
---
<div id="new-expensify" markdown="1">

Duplicate expenses and reports can create accounting errors, wasted time, and unnecessary cleanup. This guide explains why duplicates happen and how to prevent them before they cause problems.  

# Avoiding duplicates in Expensify

## Why duplicates happen
There are two main types of duplicates:  
- **Expense duplicates** – A SmartScanned receipt doesn’t merge with a matching card transaction, creating two separate expenses.  
- **Report duplicates** – A report is both auto-synced to your accounting software and manually exported, creating two versions of the same expenses.  

---

## Preventing duplicate expenses
Expense duplicates usually occur when a SmartScanned receipt fails to merge with its card feed transaction.  

**Common reasons expenses don’t merge**  
- The card transaction hasn’t imported yet  
- The receipt amount or date is slightly different  
- The expense is already linked to another receipt or transaction  
- The duplicate is flagged by Duplicate Detection and requires review  

**How to resolve duplicates**  
1. **Wait for auto-merge or duplicate detection review** – Expensify may automatically prompt a review once the transaction imports.  
2. **Merge manually** – Open the expense → More → Merge. *Note: at least one expense must be a cash or non-card expense; two card expenses cannot be merged.*  
3. **Delete the duplicate** – Only after confirming it’s safe and editing is allowed.  
4. **Review duplicate holds** – If flagged, select **Review duplicates** to choose one expense, discard duplicates, or merge where possible.  

**Note:** Unresolved duplicates can carry into reports and later create duplicate exports in your accounting system.  

For details, see [Editing expenses](https://help.expensify.com/articles/expensify-classic/expenses/Edit-expenses) and [Reconcile company card expenses](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Reconcile-Company-Card-Expenses).  

---

## Preventing duplicate reports
Report duplicates happen when the same report is exported twice to your accounting system.  

**Common causes**  
- **Auto-sync + manual export** – If auto-sync is enabled for QuickBooks Online, Xero, or NetSuite, manually exporting the same report again creates a duplicate.  
- **Multiple exports with different settings** – Exporting under different configurations can duplicate transactions.  

**How Expensify manages re-exporting**  
- For QuickBooks Online, Expensify warns you before re-exporting a report that was already exported.  
- Auto-sync exports newly approved reports only; it does not retroactively export older reports.  

**How to avoid duplicate reports**  
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

---

</div>
