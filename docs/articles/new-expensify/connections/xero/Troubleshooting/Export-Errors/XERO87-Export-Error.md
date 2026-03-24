---
title: XERO87 Export Error in Xero Integration
description: Learn what the XERO87 export error means and how to select a valid Xero bank account for exports in New Expensify.
keywords: XERO87, Xero missing bank account, invalid bank account Xero export, select bank account Expensify, non-reimbursable export bank account, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO87 export error related to missing or invalid bank account selection in Workspace settings. Does not cover authentication or category configuration issues.
---

# XERO87 Export Error in Xero Integration

If you see the error:

XERO87 Export Error: Missing or invalid bank account. Please confirm an active bank account has been selected in the Expensify configurations before exporting.

This means the bank account selected in the Workspace is not valid or no longer exists in Xero.

Xero requires a valid, active bank account for certain export types.

---

## Why the XERO87 Export Error Happens in Xero

The XERO87 error typically occurs when:

- The destination bank account selected in the Workspace no longer exists in Xero.
- The bank account has been deleted or made inactive in Xero.
- No bank account has been selected in the Workspace export settings.
- The Workspace has not synced after changes were made in Xero.

If the bank account cannot be validated in Xero, the export fails.

This is a bank account configuration issue, not a connection issue.

---

# How to Fix the XERO87 Export Error

Follow the steps below to select or create a valid bank account and retry the export.

---

## Select a Valid Xero Bank Account in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under **Non-reimbursable expenses**, select a valid **Xero bank account** from the dropdown.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap **Export**.
6. Select the appropriate **Xero bank account**.
7. Tap **Save**.

---

## Create or Reactivate a Bank Account in Xero

If no bank account appears in the dropdown:

1. Log in to Xero with appropriate permissions.
2. Go to **Accounting > Chart of Accounts**.
3. Confirm a valid **Bank** account exists and is active.
4. If needed, create a new **Bank** account.
5. Click **Save**.

After updating Xero:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the Xero connection.
3. Click **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If a valid bank account is selected and synced, the export should complete successfully.

---

# FAQ

## Does the XERO87 Error Affect Reimbursable Reports?

It typically affects non-reimbursable exports that require a designated bank account in the export configuration.

## Do I Need Xero Admin Access to Fix the XERO87 Error?

Yes. Creating, activating, or modifying bank accounts in Xero requires appropriate permissions.
