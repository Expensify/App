---
title: INT304 Export Error: Invalid Coding on $0.00 Expenses
description: Learn why the INT304 export error occurs and how to correct invalid categories or tags on $0.00 expenses before retrying the export.
keywords: INT304, $0.00 expense export error, invalid coding Sage Intacct, zero dollar expense export failure, category tag validation error
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT304 export error related to invalid coding on $0.00 expenses. Does not cover tax or employee record configuration errors.
---

# INT304 Export Error: Invalid Coding on $0.00 Expenses

If you see the error message:

**“INT304 Export Error: Unable to export report due to invalid coding on $0.00 expenses to Sage Intacct.”**

It means one or more **$0.00 expenses** on the report have invalid or outdated categories or tags applied.

Even though the expense amount is zero, Sage Intacct still validates all coding during export.

---

## Why the INT304 Export Error Happens

The INT304 export error occurs when:

- A report contains one or more **$0.00 expenses**, and  
- Those expenses have invalid categories, tags, or dimensions  

Sage Intacct validates coding on every expense line, including zero-dollar expenses. If any coding does not match an active account, category, or dimension, the export fails.

---

# How to Fix the INT304 Export Error

Follow the steps below to identify and correct invalid coding.

---

## Step 1: Review $0.00 Expenses on the Report

1. Open the report that failed to export.  
2. Identify any expenses with a **$0.00** amount.  
3. Review the categories and tags applied to those expenses.  

Confirm that:

- The category is valid and properly mapped  
- All required tags or dimensions are selected  
- No inactive or outdated coding is applied  

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

This refreshes categories and dimensions from Sage Intacct.

---

## Step 3: Reconfirm Coding on $0.00 Expenses

1. Return to the report.  
2. Open each $0.00 expense.  
3. Reapply or confirm the correct category and tags.  

If needed, remove and reselect the category or tags to ensure they match the latest synced data.

---

## Step 4: Retry the Export

Retry exporting the report.

If all coding on $0.00 expenses is valid and active, the export should complete successfully.

---

# FAQ

## Why does Sage Intacct validate $0.00 expenses?

Sage Intacct validates all expense lines to maintain accounting accuracy, even if the amount is zero.

## Can I delete the $0.00 expense instead?

Yes. If the $0.00 expense is not needed, removing it from the report may resolve the error.

## Do I always need to run Sync?

Running **Sync Now** helps ensure categories and tags are up to date before retrying the export.
