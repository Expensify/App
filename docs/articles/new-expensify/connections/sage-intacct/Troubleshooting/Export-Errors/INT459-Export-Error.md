---
title: INT459 Export Error: Unable to Find Category in the Workspace
description: Learn why the INT459 export error occurs and how to ensure categories are active and synced from Sage Intacct before retrying the export.
keywords: INT459, category not found Sage Intacct, expense type missing, GL code not found, workspace categories error, sync category configuration, Sage Intacct export failure, Workspace Admin troubleshooting
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT459 export error caused by missing or inactive categories. Does not cover tag, tax, employee, or connection configuration errors.
---

# INT459 Export Error: Unable to Find Category in the Workspace

If you see the error message:

**“INT459 Export Error: Unable to find category [XXX] in the workspace. Please confirm all categories are listed and active in Sage Intacct.”**

It means the category selected on one or more expenses is not available or not active in the Workspace.

Sage Intacct requires all categories used in exports to exist, be active, and be properly synced before transactions can post successfully.

---

## Why the INT459 Export Error Happens in Sage Intacct

The INT459 export error typically occurs when:

- The category selected on an expense does not exist in the Workspace.
- The category exists in Sage Intacct but has not been synced.
- The category is inactive or deleted in Sage Intacct.

Categories are determined by export type:

- **Expense reports** use **Expense Types** in Sage Intacct.
- **Vendor bills** use **Chart of Accounts (GL codes)** in Sage Intacct.

If the selected category is unavailable in either system, the export will fail.

This is a category configuration or sync issue, not a connection issue.

---

# How to Fix the INT459 Export Error

Follow the steps below to confirm the category is active and synced.

---

## Confirm the Category Is Active in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Identify the export type:
   - For expense report exports, open **Expense Types**.
   - For vendor bill exports, open the **Chart of Accounts (GL codes)**.
3. Search for the category listed in the error message.
4. Confirm the category exists and is marked as active.
5. Save any changes if you updated the record.

If the category is missing or inactive, update it in Sage Intacct before proceeding.

---

## Confirm the Category Is Available in the Workspace

On web:
1. Go to **Settings** in the navigation tabs on the left.
2. Select **Workspaces**.
3. Choose your Workspace.
4. Click **Categories**.

On mobile:
1. Tap the hamburger menu in the top-left corner.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Categories**.

Confirm the category is listed and enabled. If it is missing, run a sync.

---

## Sync Sage Intacct With the Workspace

On web:
1. Go to **Settings** in the navigation tabs on the left.
2. Select **Workspaces**.
3. Choose your Workspace.
4. Click **Accounting**.
5. Click **Sync Now**.

On mobile:
The Sage Intacct accounting connection and sync controls are available on web only.

Running **Sync Now** refreshes categories and imports any updates from Sage Intacct.

---

## Update the Category on the Report

1. Open the report that failed to export.
2. Review any expenses highlighted in red.
3. Edit the expense.
4. Select a valid, active category.
5. Save your changes.

---

## Retry the Sage Intacct Export

After confirming the category is active and synced:

1. Open the report.
2. Retry the export to Sage Intacct.

If the category exists, is active, and is synced, the export should complete successfully.

---

# FAQ

## Does the INT459 error mean the Sage Intacct integration is disconnected?

No. The INT459 error indicates a missing or inactive category. It does not mean the integration is disconnected.

## Do I always need to run Sync Now after updating categories in Sage Intacct?

Yes. If categories were added, edited, or reactivated in Sage Intacct, you should run **Sync Now** to import the changes into the Workspace.

## Can I fix the INT459 error by selecting a different category?

Yes. If the selected category is no longer valid, choosing an active and synced category will resolve the error.
