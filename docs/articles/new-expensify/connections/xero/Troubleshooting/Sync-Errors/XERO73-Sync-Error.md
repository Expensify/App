---
title: XERO73 Sync Error in Xero Integration
description: Learn what the XERO73 sync error means and how to configure Expense accounts correctly in Xero before syncing with New Expensify.
keywords: XERO73, Xero chart of accounts error, show in expense claims Xero, expense type accounts Xero, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO73 sync error related to chart of accounts configuration in Xero. Does not cover authentication token or organization selection issues.
---

# XERO73 Sync Error in Xero Integration

If you see the error:

XERO73 Sync Error: Could not retrieve Xero chart of accounts. Please make sure the accounts in Xero are set to “Expense” type and have “Show in Expense Claims” enabled.

This means the Workspace cannot access valid expense accounts in Xero.

As a result, categories cannot sync properly.

---

## Why the XERO73 Sync Error Happens in Xero

The XERO73 error typically occurs when:

- Accounts in Xero are not set to **Expense** type.
- The **Show in Expense Claims** option is not enabled.
- No eligible expense accounts are available to import.
- Changes were made in Xero but the Workspace has not been synced.

The Workspace only imports accounts that are configured for expense claims in Xero.

This is a chart of accounts configuration issue, not a connection issue.

---

# How to Fix the XERO73 Sync Error

Follow the steps below to update account settings and retry the sync.

---

## Update Expense Account Settings in Xero

1. Log in to Xero with appropriate permissions.
2. Go to **Accounting > Chart of Accounts**.
3. Locate the accounts you want to use for expenses.
4. Confirm each account:
   - Is set to **Expense** type.
   - Has **Show in Expense Claims** enabled.
5. Click **Save** if you make changes.

If no suitable accounts exist:

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

Once the sync completes, the updated expense accounts should import successfully.

---

# FAQ

## Does the XERO73 Error Affect Exports?

Yes. If categories cannot sync, exports may fail due to missing expense accounts.

## Do I Need Xero Admin Access to Fix the XERO73 Error?

Yes. Updating account types and enabling **Show in Expense Claims** requires appropriate permissions in Xero.
