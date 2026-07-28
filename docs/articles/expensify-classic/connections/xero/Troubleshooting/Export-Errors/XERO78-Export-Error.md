---
title: XERO78 Export Error in Xero Integration
description: Learn what the XERO78 export error means and how to resolve invalid or inactive categories and tracking tags in Xero before exporting.
keywords: XERO78, Xero invalid category, Xero invalid tag, category inactive Xero, tag inactive Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO78 export error caused by inactive or deleted categories and tracking tags in Xero. Does not cover authentication or currency configuration issues.
---

# XERO78 Export Error in Xero Integration

If you see the error:

XERO78 Export Error: Expense [merchant name] has an invalid category or tag. Please confirm the selected category or tag is active within Xero.

This means the category or tracking tag selected in the Workspace is no longer valid in Xero.

Xero must have active categories and tracking options for exports to succeed.

---

## Why the XERO78 Export Error Happens in Xero

The XERO78 error typically indicates:

- The selected expense category has been deleted or made inactive in Xero.
- A tracking category or tracking option (tag) has been deleted or made inactive.
- Xero validation failed because the selected category or tag is not recognized.

If Xero cannot recognize the selected category or tag, it blocks the export.

This is a category or tracking configuration issue, not an authentication or currency configuration error.

---

## How to Fix the XERO78 Export Error

Follow the steps below to confirm categories and tracking tags are active.

### Confirm the Expense Category in Xero

1. Log in to Xero.
2. Go to **Settings > Chart of Accounts**.
3. Confirm the expense account:
   - Exists.
   - Is active.
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
4. If the account is inactive, reactivate it or create a new valid expense account.
5. Click **Save**.

### Confirm the Tracking Category or Tag in Xero

1. Go to **Settings > Tracking Categories**.
2. Locate the tracking category referenced in the report.
3. Confirm the tracking option (tag) is active.
4. Reactivate or recreate the tracking option if needed.
5. Click **Save**.

### Sync the Workspace in Expensify

After updating categories or tags in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Recategorize or Retag the Expense

1. Open the report that failed to export.
2. Locate expenses flagged with a red violation.
3. Select a valid, active category or tracking tag.
4. Click **Save**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If all categories and tracking tags are active and properly synced, the export should complete successfully.

---

# FAQ

## Does the XERO78 Export Error Affect Only One Expense?

It can affect one or multiple expenses depending on how many use inactive categories or tags.

## Do I Need Xero Admin Access to Fix the XERO78 Export Error?

You need sufficient permissions in Xero to update or reactivate categories and tracking options.

## Do I Need to Reconnect the Integration?

No. Updating the category or tag and selecting **Sync Now** is typically sufficient.
