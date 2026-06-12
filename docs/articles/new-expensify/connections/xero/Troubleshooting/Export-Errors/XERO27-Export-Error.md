---
title: XERO27 Export Error in Xero Integration
description: Learn what the XERO27 export error means and how to restore or replace inactive expense categories in Xero before exporting from New Expensify.
keywords: XERO27, Xero category not found, Xero chart of accounts inactive, expense category deleted Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO27 export error related to inactive or deleted expense categories in Xero. Does not cover authentication or organization selection issues.
---

# XERO27 Export Error in Xero Integration

If you see the error:

XERO27 Export Error: Category not found. The category may be deleted or inactive in Xero so please select new category.

This means the expense category used on the report no longer exists or is inactive in Xero.

Xero must have an active expense account in its Chart of Accounts for the export to succeed.

---

## Why the XERO27 Export Error Happens in Xero

The XERO27 error typically occurs when:

- An expense in the Workspace is categorized under an account that no longer exists in Xero.
- The account has been marked as inactive in Xero’s Chart of Accounts.
- The account is not configured as an **Expense** type.
- The account is not enabled for expense claims in Xero.

If the category is missing or inactive, Xero rejects the export.

This is a category configuration issue in Xero, not a connection issue.

---

# How to Fix the XERO27 Export Error

Follow the steps below to restore or replace the affected category.

---

## Confirm the Expense Account in Xero

1. Log in to Xero with appropriate permissions.
2. Go to **Settings > Chart of Accounts**.
3. Locate the expense account referenced in the report.
4. Confirm the account:
   - Exists.
   - Is active.
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if you make changes.

If the account was deleted or cannot be reactivated, create a new expense account with the correct configuration.

---

## Run Sync in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Sync now**.

This refreshes the imported categories from Xero.

---

## Update the Category on the Report

1. Open the report that failed to export.
2. Look for expenses marked with a red violation.
3. Edit each affected expense.
4. Select a valid, active category.
5. Click **Save**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If all expenses are mapped to active expense accounts, the export should complete successfully.

---

# FAQ

## Does the XERO27 Export Error Affect Only One Category?

Yes. It affects only expenses tied to inactive or deleted categories.

## Do I Need Xero Admin Access to Fix the XERO27 Error?

Yes. Updating or creating expense accounts in Xero requires appropriate permissions.
