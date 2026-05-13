---
title: INT304 Export Error in Sage Intacct Integration
description: Learn what the INT304 export error means and how to correct invalid categories or tags on $0.00 expenses before exporting to Sage Intacct.
keywords: INT304, $0.00 expense export error, Sage Intacct invalid coding error, zero dollar expense export failure, category tag validation error, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT304 export error caused by invalid coding on $0.00 expenses. Does not cover tax configuration or employee record errors.
---

# INT304 Export Error in Sage Intacct Integration

If you see the error:

INT304 Export Error: Unable to export report due to invalid coding on $0.00 expenses to Sage Intacct.

This means one or more **$0.00 expenses** on the report have invalid or outdated categories or tags applied.

Even though the expense amount is zero, Sage Intacct still validates all coding during export.

---

## Why the INT304 Export Error Happens in Sage Intacct

The INT304 error typically indicates:

- The report contains one or more $0.00 expenses.
- Those expenses have invalid categories, tags, or dimensions.
- Sage Intacct validation failed due to inactive or mismatched coding.

Sage Intacct validates coding on every expense line, regardless of amount. If any category, account, or dimension does not match an active value in Sage Intacct, the export fails.

This is a coding validation issue, not a tax configuration or employee record error.

---

## How to Fix the INT304 Export Error

Follow the steps below to identify and correct invalid coding on $0.00 expenses.

### Review $0.00 Expenses on the Report

1. Open the report that failed to export.
2. Identify any expenses with a **$0.00** amount.
3. Review the categories and tags applied to those expenses.
4. Confirm that:
   - The category is valid and mapped correctly.
   - All required tags or dimensions are selected.
   - No inactive or outdated coding is applied.

Update any incorrect coding.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes categories, accounts, and dimensions from Sage Intacct.

### Reconfirm Coding on $0.00 Expenses

After syncing:

1. Return to the report.
2. Open each $0.00 expense.
3. Reapply or confirm the correct category and tags.
4. Save your changes.

If needed, remove and reselect the correct coding to ensure it matches the latest synced data.

### Retry the Export

Retry exporting the report to Sage Intacct.

If all coding on $0.00 expenses is valid and properly mapped, the export should complete successfully.

---

# FAQ

## Why Does Sage Intacct Validate $0.00 Expenses?

Sage Intacct validates coding on every expense line to ensure accounting accuracy, even if the amount is zero.

## Can I Delete the $0.00 Expense Instead?

Yes. If the $0.00 expense is not needed, you can remove it from the report and retry the export.

## Do I Always Need to Run Sync Now?

Selecting **Sync Now** helps ensure categories and tags are up to date before retrying the export.
