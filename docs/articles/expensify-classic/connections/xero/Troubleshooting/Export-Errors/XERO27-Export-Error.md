---
title: XERO27 Export Error in Xero Integration
description: Learn what the XERO27 export error means and how to restore or replace inactive expense categories in Xero before exporting.
keywords: XERO27, Xero category not found, Xero Chart of Accounts inactive, expense category deleted Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO27 export error caused by inactive or deleted expense categories in Xero. Does not cover authentication or organization selection issues.
---

# XERO27 Export Error in Xero Integration

If you see the error:

XERO27 Export Error: Category not found. The category may be deleted or inactive in Xero so please select new category.

This means the expense category used in the Workspace no longer exists or is inactive in Xero.

Xero must have an active expense account in its **Chart of Accounts** for the export to succeed.

---

## Why the XERO27 Export Error Happens in Xero

The XERO27 error typically indicates:

- An expense in the Workspace is categorized under an account that no longer exists in Xero.
- The account has been marked as inactive in Xero’s Chart of Accounts.
- The account is not set up correctly for expense claims.

If the category is missing or inactive, Xero rejects the export.

This is a category configuration issue in Xero, not an authentication or organization selection issue.

---

## How to Fix the XERO27 Export Error

Follow the steps below to restore or replace the inactive category.

### Confirm Expense Accounts in Xero

1. Log in to Xero.
2. Go to **Settings > Chart of Accounts**.
3. Confirm that all expense accounts used in the Workspace:
   - Exist.
   - Are active.
   - Are set to **Expense** type.
   - Have **Show in Expense Claims** enabled.

If an account is missing or inactive:

- Create a new expense account, or
- Reactivate the existing account if appropriate.
- Enable **Show in Expense Claims**.
- Click **Save**.

### Sync the Workspace in Expensify

After updating accounts in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes imported categories from Xero.

### Recategorize Flagged Expenses

1. Open the report that failed to export.
2. Identify any expenses flagged with a red violation.
3. Select a valid, active category.
4. Click **Save**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the category exists and is active in Xero, the export should complete successfully.

---

# FAQ

## Does the XERO27 Export Error Affect Only One Category?

Yes. It affects only expenses tied to inactive or deleted categories.

## Do I Need Xero Admin Access to Fix the XERO27 Export Error?

You need sufficient permissions in Xero to update or create expense accounts.

## Do I Need to Reconnect the Integration?

No. Updating the category and selecting **Sync Now** is typically sufficient.
