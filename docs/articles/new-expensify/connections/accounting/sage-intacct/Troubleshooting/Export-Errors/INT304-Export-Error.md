---
title: INT304 Export Error in Sage Intacct Integration
description: Learn what the INT304 export error means and how to correct invalid categories or tags on $0.00 expenses before retrying the export.
keywords: INT304, Sage Intacct invalid coding error, $0.00 expense export error, zero dollar expense validation Intacct, category tag validation error Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT304 export error caused by invalid coding on $0.00 expenses. Does not cover tax or employee record configuration errors.
---

# INT304 Export Error in Sage Intacct Integration

If you see the error:

INT304 Export Error: Unable to export report due to invalid coding on $0.00 expenses to Sage Intacct.

This means one or more **$0.00 expenses** on the report have invalid or outdated categories or tags applied.

Even though the expense amount is zero, Sage Intacct still validates all coding during export.

---

## Why the INT304 Export Error Happens in Sage Intacct

The INT304 error typically occurs when:

- A report contains one or more **$0.00 expenses**.
- Those expenses use invalid, inactive, or outdated categories.
- One or more required tags or dimensions are missing or inactive.

Sage Intacct validates coding on every expense line, including zero-dollar expenses. If any coding does not match an active account, category, or dimension, the export fails.

This is a coding validation issue, not a tax or employee configuration issue.

---

# How to Fix the INT304 Export Error

Follow the steps below to identify and correct invalid coding.

---

## Review $0.00 Expenses on the Report

1. Open the report that failed to export.
2. Identify any expenses with a **$0.00** amount.
3. Open each $0.00 expense.
4. Review the selected:
   - Category
   - Department
   - Class
   - Location
   - Project
   - Any other tags or user-defined dimensions

Confirm that:

- The category is valid and properly mapped.
- All required tags or dimensions are selected.
- No inactive or outdated coding is applied.

---

## Sync the Workspace

To ensure categories and tags are up to date:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes categories and dimensions from Sage Intacct.

---

## Reapply Coding on $0.00 Expenses

After syncing:

1. Return to the report.
2. Open each $0.00 expense.
3. Remove and reselect the correct category and tags.
4. Save the expense.

This ensures the expense uses the latest synced data.

---

## Retry the Export

1. Retry exporting the report to Sage Intacct.

If all coding on $0.00 expenses is valid and active, the export should complete successfully.

---

# FAQ

## Why Does Sage Intacct Validate $0.00 Expenses?

Sage Intacct validates coding on every expense line to maintain accounting accuracy, even if the amount is zero.

## Can I Delete the $0.00 Expense Instead?

Yes. If the $0.00 expense is not needed, removing it from the report may resolve the error.

## Do I Always Need to Run Sync?

Running **Sync Now** helps ensure categories and tags are current before retrying the export and is recommended when correcting coding issues.
