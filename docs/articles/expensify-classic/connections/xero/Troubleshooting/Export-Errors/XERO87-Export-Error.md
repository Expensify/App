---
title: XERO87 Export Error in Xero Integration
description: Learn what the XERO87 export error means and how to select a valid Xero bank account for exports before retrying.
keywords: XERO87, Xero missing bank account, invalid bank account Xero export, select bank account Workspace, non-reimbursable export bank account, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO87 export error caused by missing or invalid bank account selection in Workspace settings. Does not cover authentication or category configuration issues.
---

# XERO87 Export Error in Xero Integration

If you see the error:

XERO87 Export Error: Missing or invalid bank account. Please confirm an active bank account has been selected in the Expensify configurations before exporting.

This means the bank account selected in the Workspace is not valid or no longer exists in Xero.

Xero requires a valid, active bank account for certain export types.

---

## Why the XERO87 Export Error Happens in Xero

The XERO87 error typically indicates:

- The destination bank account selected in the Workspace is missing in Xero.
- The bank account has been deleted or made inactive in Xero.
- No bank account has been selected in the Workspace settings.
- Xero validation failed because the bank account cannot be found.

If the bank account cannot be validated in Xero, the export fails.

This is a bank account configuration issue, not an authentication or category configuration error.

---

## How to Fix the XERO87 Export Error

Follow the steps below to select or create a valid bank account.

### Select a Valid Bank Account in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Select a valid **Xero bank account** for non-reimbursable expenses.
7. Click **Save**.

### Create a Bank Account in Xero If Needed

If no bank account appears in the dropdown:

1. Log in to Xero.
2. Go to **Accounting > Chart of Accounts**.
3. Create a new account with the **Bank** account type.
4. Click **Save**.

Then return to the Workspace and:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If a valid bank account is selected and synced, the export should complete successfully.

---

# FAQ

## Does the XERO87 Export Error Affect Reimbursable Reports?

It typically affects non-reimbursable exports where a specific bank account is required.

## Do I Need Xero Admin Access to Fix the XERO87 Export Error?

You need sufficient permissions in Xero to create or activate bank accounts.

## Do I Need to Reconnect the Integration?

No. Selecting or creating a valid bank account and clicking **Sync Now** is typically sufficient.
