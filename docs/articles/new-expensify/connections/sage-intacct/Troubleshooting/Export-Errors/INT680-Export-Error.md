---
title: INT680 Export Error in Sage Intacct Integration
description: Learn what the INT680 export error means and how to categorize uncategorized expenses before retrying the export to Sage Intacct.
keywords: INT680, uncategorized expenses export error, invalid data Sage Intacct, missing category export failure, categorize expenses before export, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT680 export error caused by uncategorized expenses. Does not cover category mapping or Sage Intacct configuration errors.
---

# INT680 Export Error in Sage Intacct Integration

If you see the error:

INT680 Export Error: The report contains invalid data. Please categorize any uncategorized expenses and try exporting again.

This means one or more expenses on the report do not have a category selected.

Sage Intacct requires every expense to have a valid category before it can be exported.

---

## Why the INT680 Export Error Happens in Sage Intacct

The INT680 error typically occurs when:

- A report contains one or more **uncategorized expenses**.
- The export attempts to send the report to Sage Intacct.
- Required category data is missing from the expense.

Expenses without categories are considered invalid data and cannot be exported.

This is a missing required field issue, not a connection or integration issue.

---

# How to Fix the INT680 Export Error

Follow the steps below to categorize all expenses and retry the export.

---

## Categorize All Expenses on the Report

1. Open the report that failed to export.
2. Review each expense line on the report.
3. Identify any expenses without a category selected.
4. Open each uncategorized expense.
5. Select the appropriate category.
6. Click **Save**.

Ensure every expense on the report has a valid category before proceeding.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If all expenses are categorized, the export should complete successfully.

---

# FAQ

## How Can I Quickly Find Uncategorized Expenses?

Uncategorized expenses typically do not display a category name. Review each expense line and confirm a category is selected.

## Does the INT680 Error Mean There Is a Connection Issue?

No. This error is caused by missing required data on the report, not by an integration issue.

## Do I Need to Run Sync Now?

No. This error is resolved by categorizing the expenses. Syncing is not required unless other accounting configuration changes were made.
