---
title: INT459 Export Error in Sage Intacct Integration
description: Learn what the INT459 export error means and how to ensure categories are active and synced from Sage Intacct before exporting.
keywords: INT459, Sage Intacct category not found, expense type missing Sage Intacct, GL code not found, Workspace categories error, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT459 export error caused by missing or inactive categories. Does not cover tag, tax, or employee record errors.
---

# INT459 Export Error in Sage Intacct Integration

If you see the error:

INT459 Export Error: Unable to find category [XXX] in the Expensify workspace. Please confirm all categories are listed and active in Sage Intacct.

This means the category selected on one or more expenses is not available or not active in the Workspace.

Sage Intacct requires all categories used in exports to be active and properly synced.

---

## Why the INT459 Export Error Happens in Sage Intacct

The INT459 error typically indicates:

- The category selected on an expense is not available in the Workspace.
- The category exists in Sage Intacct but has not been synced into the Workspace.
- The category is inactive or has been deleted in Sage Intacct.

Categories are determined based on export type:

- **Expense reports** — Categories are **Expense Types** in Sage Intacct.
- **Vendor bills** — Categories come from the **Chart of Accounts (GL codes)**.

If a category is inactive, deleted, or not synced, the export will fail.

This is a category configuration issue, not a tag, tax, or employee record error.

---

## How to Fix the INT459 Export Error

Follow the steps below to confirm categories are active and properly synced.

### Confirm the Category in Sage Intacct

1. Log in to Sage Intacct.
2. Identify the export type:
   - For expense reports, check **Expense Types**.
   - For vendor bills, check the **Chart of Accounts (GL codes)**.
3. Confirm the category exists and is active.
4. If the category is missing or inactive, update it in Sage Intacct and click **Save**.

### Confirm the Category in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Categories**.
4. Confirm the category is listed and available.

If the category is not listed, proceed to sync.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes categories from Sage Intacct.

### Update Categories on the Report

1. Open the report that failed to export.
2. Identify any categories highlighted in red.
3. Edit the expense and select a valid, active category.
4. Save your changes.

### Retry the Export

Retry exporting the report.

If the category exists, is active in Sage Intacct, and is properly synced, the export should complete successfully.

---

# FAQ

## Does This Error Mean the Integration Is Disconnected?

No. The error indicates a category mismatch or missing category, not a connection issue.

## Do I Always Need to Run Sync Now?

If categories were recently added or updated in Sage Intacct, selecting **Sync Now** ensures they are imported into the Workspace.

## Can I Fix This by Selecting a Different Category?

Yes. If the selected category is no longer valid, choosing an active category will resolve the error.
