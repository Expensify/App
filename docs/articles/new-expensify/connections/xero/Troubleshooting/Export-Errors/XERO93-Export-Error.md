---
title: XERO93 Export Error in Xero Integration
description: Learn what the XERO93 export error means and how to ensure expense categories are active and properly configured in Xero before exporting from New Expensify.
keywords: XERO93, Xero invalid expense category, expense type not set Xero, show in expense claims Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO93 export error related to inactive or improperly configured expense categories in Xero. Does not cover authentication or organization selection issues.
---

# XERO93 Export Error in Xero Integration

If you see the error:

XERO93 Export Error: Expense [merchant name] has an invalid category. Please confirm the selected category is active, listed as an “Expense” type, and has “Show in Expense Claims” checked in Xero.

This means the selected category in the Workspace is not valid in Xero.

Xero only allows exports to accounts that are active, configured as **Expense** type, and enabled for expense claims.

---

## Why the XERO93 Export Error Happens in Xero

The XERO93 error typically occurs when:

- The expense category no longer exists in Xero.
- The category is inactive in Xero’s Chart of Accounts.
- The account is not set as **Expense** type.
- **Show in Expense Claims** is not enabled.
- The Workspace has not synced after changes were made in Xero.

If any of these conditions apply, Xero blocks the export.

This is a category configuration issue in Xero, not a connection issue.

---

# How to Fix the XERO93 Export Error

Follow the steps below to confirm the category is correctly configured and synced.

---

## Confirm the Expense Category in Xero

1. Log in to Xero with appropriate permissions.
2. Go to **Settings > Chart of Accounts**.
3. Locate the account referenced in the error.
4. Confirm the account:
   - Is active.
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if you make changes.

If the account does not exist:

1. Create a new account.
2. Set the account type to **Expense**.
3. Enable **Show in Expense Claims**.
4. Click **Save**.

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

This refreshes categories from Xero.

---

## Recategorize the Expense

1. Open the report that failed to export.
2. Locate expenses marked with a red violation.
3. Edit each affected expense.
4. Select a valid, active category.
5. Click **Save**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the category is active, configured correctly, and synced, the export should complete successfully.

---

# FAQ

## Does the XERO93 Error Affect Only One Expense?

It affects any expense using an invalid or inactive category.

## Do I Need Xero Admin Access to Fix the XERO93 Error?

Yes. Updating account settings or creating new accounts in Xero requires appropriate permissions.
