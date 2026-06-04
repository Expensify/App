---
title: INT459 Export Error in Sage Intacct Integration
description: Learn what the INT459 export error means and how to resolve missing or inactive categories in Sage Intacct before retrying the export.
keywords: INT459, Sage Intacct category not found, expense type missing Intacct, GL code not found Sage Intacct, workspace categories error, Sage Intacct sync categories, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT459 export error caused by missing or inactive categories. Does not cover tag, tax, employee, or vendor configuration errors.
---

# INT459 Export Error in Sage Intacct Integration

If you see the error:

INT459 Export Error: Unable to find category [XXX] in the workspace. Please confirm all categories are listed and active in Sage Intacct.

This means the category selected on one or more expenses is not available or not active in the Workspace.

Sage Intacct requires all categories used in exports to exist, be active, and be properly synced before transactions can be created.

---

## Why the INT459 Export Error Happens in Sage Intacct

The INT459 error typically occurs when:

- The category selected on an expense does not exist in the Workspace.
- The category exists in Sage Intacct but has not been synced.
- The category is inactive or deleted in Sage Intacct.

Categories are determined by export type:

- **Expense reports** use **Expense Types** in Sage Intacct.
- **Vendor bills** use **Chart of Accounts (GL codes)** in Sage Intacct.

If a category is inactive, deleted, or not synced, Sage Intacct cannot create the transaction.

This is a category configuration or sync issue, not a connection issue.

---

# How to Fix the INT459 Export Error

Follow the steps below to confirm the category is active and properly synced.

---

## Confirm the Category Is Active in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Identify the export type:
   - For expense reports, open **Expense Types**.
   - For vendor bills, open the **Chart of Accounts (GL codes)**.
3. Search for the category listed in the error message.
4. Confirm the category exists and is marked as active.
5. Click **Save** if you made any updates.

If the category is missing or inactive, update it in Sage Intacct before proceeding.

---

## Sync the Workspace

After confirming the category in Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes categories from Sage Intacct and updates the Workspace.

---

## Update the Category on the Report

1. Open the report that failed to export.
2. Review any expenses highlighted in red.
3. Edit the expense.
4. Select a valid, active category.
5. Save your changes.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the category exists, is active, and is properly synced, the export should complete successfully.

---

# FAQ

## Does the INT459 Error Mean the Integration Is Disconnected?

No. The INT459 error indicates a missing or inactive category, not a connection issue.

## Do I Always Need to Run Sync Now?

If categories were recently added, updated, or reactivated in Sage Intacct, running **Sync Now** ensures the changes are reflected in the Workspace.

## Can I Fix This by Selecting a Different Category?

Yes. If the selected category is no longer valid, choosing an active category will resolve the error.
