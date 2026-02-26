---
title: INT680 Export Error: Report Contains Invalid Data Due to Uncategorized Expenses
description: Learn why the INT680 export error occurs and how to categorize uncategorized expenses before retrying the export.
keywords: INT680, uncategorized expenses export error, invalid data Sage Intacct, missing category export failure, categorize expenses before export
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT680 export error related to uncategorized expenses. Does not cover category mapping or configuration errors.
---

# INT680 Export Error: Report Contains Invalid Data Due to Uncategorized Expenses

If you see the error message:

**“INT680 Export Error: The report contains invalid data. Please categorize any uncategorized expenses and try exporting again.”**

It means one or more expenses on the report do not have a category selected.

Sage Intacct requires every expense to have a valid category before it can be exported.

---

## Why the INT680 Export Error Happens

The INT680 export error occurs when:

- A report contains one or more **uncategorized expenses**, and  
- The export attempts to send the report to Sage Intacct  

Expenses without categories are considered invalid data and cannot be exported.

---

# How to Fix the INT680 Export Error

Follow the steps below to categorize the expenses and retry the export.

---

## Step 1: Categorize All Expenses on the Report

1. Open the report that failed to export.  
2. Identify any expenses without a category selected.  
3. Open each uncategorized expense.  
4. Select the appropriate category.  
5. Save your changes.  

Ensure every expense on the report has a valid category.

---

## Step 2: Retry the Export

Return to the report and retry the export.

If all expenses are categorized, the export should complete successfully.

---

# FAQ

## How can I quickly find uncategorized expenses?

Uncategorized expenses are typically highlighted and will not display a category name. Review each expense line to confirm a category is selected.

## Does this error mean there is a connection issue?

No. This error is caused by missing required data on the report, not by an integration issue.

## Do I need to run Sync?

No. This error is resolved by categorizing the expenses. Syncing is not required unless other accounting changes were made.
