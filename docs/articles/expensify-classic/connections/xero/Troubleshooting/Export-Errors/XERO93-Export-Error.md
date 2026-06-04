---
title: XERO93 Export Error in Xero Integration
description: Learn what the XERO93 export error means and how to ensure expense categories are active and properly configured in Xero before exporting.
keywords: XERO93, Xero invalid expense category, expense type not set Xero, Show in Expense Claims Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO93 export error caused by inactive or improperly configured expense categories in Xero. Does not cover authentication or organization selection issues.
---

# XERO93 Export Error in Xero Integration

If you see the error:

XERO93 Export Error: Expense [merchant name] has an invalid category. Please confirm the selected category is active, listed as an 'Expense' type, and has 'Show in Expense Claims' checked in Xero.

This means the selected category in the Workspace is not valid in Xero.

Xero only allows exports to active accounts configured as **Expense** type and enabled for expense claims.

---

## Why the XERO93 Export Error Happens in Xero

The XERO93 error typically indicates:

- The expense category no longer exists in Xero.
- The category is inactive.
- The account is not set as **Expense** type.
- **Show in Expense Claims** is not enabled.
- Xero validation failed due to invalid account configuration.

If any of these conditions apply, Xero blocks the export.

This is a category configuration issue in Xero, not an authentication or organization selection issue.

---

## How to Fix the XERO93 Export Error

Follow the steps below to confirm and correct the expense category.

### Confirm the Category in Xero

1. Log in to Xero.
2. Go to **Settings > Chart of Accounts**.
3. Locate the account referenced in the error.
4. Confirm the account:
   - Is active.
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if changes were made.

If the account does not exist:

- Create a new account with the **Expense** type.
- Enable **Show in Expense Claims**.
- Click **Save**.

### Sync the Workspace in Expensify

After updating the account in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the imported categories.

### Recategorize the Expense

1. Open the report that failed to export.
2. Locate any expenses flagged with a red violation.
3. Select a valid, active category.
4. Click **Save**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the category is active, properly configured, and synced, the export should complete successfully.

---

# FAQ

## Does the XERO93 Export Error Affect Only One Expense?

It affects any expense using an invalid or inactive category.

## Do I Need Xero Admin Access to Fix the XERO93 Export Error?

You need sufficient permissions in Xero to update account settings or create new accounts.

## Do I Need to Reconnect the Integration?

No. Updating the account and selecting **Sync Now** is typically sufficient.
