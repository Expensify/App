---
title: XERO78 Export Error in Xero Integration
description: Learn what the XERO78 export error means and how to resolve invalid or inactive categories and tracking tags in Xero before exporting from New Expensify.
keywords: XERO78, Xero invalid category, Xero invalid tag, category inactive Xero, tracking category inactive Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO78 export error related to inactive or deleted categories and tracking tags in Xero. Does not cover authentication or currency configuration issues.
---

# XERO78 Export Error in Xero Integration

If you see the error:

XERO78 Export Error: Expense [merchant name] has an invalid category or tag. Please confirm the selected category or tag is active within Xero.

This means the category or tracking tag selected in the Workspace is no longer valid in Xero.

Xero must have active categories and tracking options for exports to succeed.

---

## Why the XERO78 Export Error Happens in Xero

The XERO78 error typically occurs when:

- The selected expense category has been deleted or made inactive in Xero.
- A tracking category or tracking option (tag) has been deleted or made inactive.
- The account is not enabled for expense claims in Xero.
- The Workspace has not synced after changes were made in Xero.

If Xero cannot recognize the selected category or tag, it blocks the export.

This is a category or tracking configuration issue in Xero, not a connection issue.

---

# How to Fix the XERO78 Export Error

Follow the steps below to confirm the category or tag is active and properly synced.

---

## Confirm the Expense Account in Xero

1. Log in to Xero with appropriate permissions.
2. Go to **Settings > Chart of Accounts**.
3. Locate the expense account used on the report.
4. Confirm the account:
   - Exists.
   - Is active.
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if you make changes.

If the account was deleted, create a new expense account and use that category instead.

---

## Confirm the Tracking Category or Tag in Xero

If the error relates to a tracking tag:

1. Go to **Settings > Tracking Categories**.
2. Locate the tracking category.
3. Confirm the tracking option (tag):
   - Exists.
   - Is active.
4. Reactivate the option if necessary or create a new valid option.
5. Click **Save**.

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

This refreshes categories and tracking options from Xero.

---

## Recategorize or Retag the Expense

1. Open the report that failed to export.
2. Locate expenses marked with a red violation.
3. Edit each affected expense.
4. Select a valid, active category or tracking tag.
5. Click **Save**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If all categories and tags are valid and active, the export should complete successfully.

---

# FAQ

## Does the XERO78 Error Affect Only One Expense?

It can affect one or multiple expenses depending on how many use inactive categories or tags.

## Do I Need Xero Admin Access to Fix the XERO78 Error?

Yes. Updating or reactivating categories and tracking options in Xero requires appropriate permissions.
