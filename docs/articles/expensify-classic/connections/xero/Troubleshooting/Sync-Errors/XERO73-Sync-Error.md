---
title: XERO73 Sync Error in Xero Integration
description: Learn what the XERO73 sync error means and how to configure Expense accounts correctly in Xero before retrying the sync.
keywords: XERO73, Xero Chart of Accounts error, Show in Expense Claims Xero, Expense type accounts Xero, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO73 sync error caused by Chart of Accounts configuration issues in Xero. Does not cover authentication token or organization selection issues.
---

# XERO73 Sync Error in Xero Integration

If you see the error:

XERO73 Sync Error: Could not retrieve Xero chart of accounts. Please make sure the accounts in Xero are set to 'Expense' type and have 'Show in Expense Claims' enabled.

This means the Workspace cannot access valid expense accounts in Xero.

As a result, categories cannot sync properly.

---

## Why the XERO73 Sync Error Happens in Xero

The XERO73 error typically indicates:

- Accounts in Xero are not set to the **Expense** type.
- The **Show in Expense Claims** option is not enabled.
- No eligible expense accounts are available for syncing.
- Xero did not return any valid expense accounts during sync.

The Workspace only imports accounts that are eligible for expense claims. If no valid accounts are available, the Chart of Accounts cannot sync.

This is a Chart of Accounts configuration issue, not an authentication token or organization selection issue.

---

## How to Fix the XERO73 Sync Error

Follow the steps below to update account settings in Xero and retry the sync.

### Update Expense Account Settings in Xero

1. Log in to Xero.
2. Go to **Accounting > Chart of Accounts**.
3. Review the accounts you want to use for expenses.
4. Confirm each account:
   - Is set to **Expense** type.
   - Is active.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if changes were made.

### Sync the Workspace in Expensify

After updating accounts in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Once the sync completes, the updated expense accounts should import successfully.

---

# FAQ

## Does the XERO73 Sync Error Affect Exports?

It primarily affects syncing categories. If accounts cannot sync, exports may fail due to missing or invalid categories.

## Do I Need Xero Admin Access to Fix the XERO73 Sync Error?

You need sufficient permissions in Xero to update account types and enable **Show in Expense Claims**.

## Do I Need to Reconnect the Integration?

No. Updating the account configuration and selecting **Sync Now** is typically sufficient.
