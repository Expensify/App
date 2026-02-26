---
title: INT459 Export Error: Unable to Find Category in the Workspace
description: Learn why the INT459 export error occurs and how to ensure categories are active and synced from Sage Intacct before retrying the export.
keywords: INT459, category not found Sage Intacct, expense type missing, GL code not found, workspace categories error, sync category configuration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT459 export error related to missing or inactive categories. Does not cover tag, tax, or employee configuration errors.
---

# INT459 Export Error: Unable to Find Category in the Workspace

If you see the error message:

**“INT459 Export Error: Unable to find category [XXX] in the workspace. Please confirm all categories are listed and active in Sage Intacct.”**

It means the category selected on one or more expenses is not available or not active in the Workspace.

Sage Intacct requires all categories used in exports to be active and properly synced.

---

## Why the INT459 Export Error Happens

The INT459 export error occurs when:

- The category selected on an expense is not available in the Workspace, or  
- The category exists in Sage Intacct but has not been synced  

Categories are determined based on export type:

- **Expense reports** — Categories are **Expense Types** in Sage Intacct  
- **Vendor bills** — Categories are found in the **Chart of Accounts (GL codes)**  

If a category is inactive, deleted, or not synced, the export will fail.

---

# How to Fix the INT459 Export Error

Follow the steps below to confirm categories are active and properly synced.

---

## Step 1: Confirm the Category in Sage Intacct

1. Log in to Sage Intacct.  
2. Identify the export type:
   - For expense reports, check **Expense Types**  
   - For vendor bills, check the **Chart of Accounts (GL codes)**  
3. Confirm the category exists and is active.  

If the category is missing or inactive, update it in Sage Intacct and save your changes.

---

## Step 2: Confirm the Category in the Workspace

1. Go to **Settings > Workspace > [Workspace Name] > Categories**.  
2. Confirm the category is listed and available.  

If it is not listed, proceed to sync.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

This refreshes categories from Sage Intacct.

---

## Step 4: Update Categories on the Report

1. Open the report that failed to export.  
2. Identify any categories highlighted in red.  
3. Edit the expense and select a valid, active category.  

---

## Step 5: Retry the Export

Retry exporting the report.

If the category exists, is active in Sage Intacct, and is properly synced, the export should complete successfully.

---

# FAQ

## Does this error mean the integration is disconnected?

No. The error indicates a category mismatch or missing category, not a connection issue.

## Do I always need to run Sync?

If categories were recently added or updated in Sage Intacct, running **Sync Now** ensures they are imported into the Workspace.

## Can I fix this by selecting a different category?

Yes. If the selected category is no longer valid, choosing an active category will resolve the error.
