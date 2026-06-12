---
title: DESK57 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK57 export error means and how to restore or activate missing accounts in the QuickBooks Desktop Chart of Accounts.
keywords: DESK57, account not found QuickBooks Desktop, category deleted QuickBooks, export account inactive QuickBooks, QuickBooks Desktop chart of accounts error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK57 export error related to missing or inactive categories or export accounts in QuickBooks Desktop. Does not cover connection or permissions errors.
---

# DESK57 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK57 Export Error: Account not found. The category or export account may be deleted or inactive in the QuickBooks Desktop Chart of Accounts.

This means the category selected on the report or the export account configured in the Workspace does not exist or is inactive in QuickBooks Desktop.

QuickBooks must have the account available and active in order to complete the export.

---

## Why the DESK57 Export Error Happens in QuickBooks Desktop

The DESK57 error typically occurs when:

- The selected expense category was deleted in QuickBooks Desktop.
- The export account in the Workspace configuration was made inactive.
- The account was renamed after the last sync.
- The Workspace has not synced after changes were made in QuickBooks.

If QuickBooks cannot find the referenced account in the Chart of Accounts, the export will fail.

This is an account mismatch issue, not a connection issue.

---

# How to Fix the DESK57 Export Error

Follow the steps below to restore the missing account and retry the export.

---

## Confirm the Account in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to the **Chart of Accounts**.
3. Locate the account referenced in the report or export settings.
4. Confirm the account:
   - Exists.
   - Is active.
5. If the account is inactive, make it active.
6. If the account does not exist, create a new account with the correct account type.
7. Save any changes.

---

## Run Sync in the Workspace

After confirming or creating the account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the account list from QuickBooks Desktop.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the account exists and is active, the export should complete successfully.

---

# FAQ

## Does the DESK57 Error Mean the Integration Is Disconnected?

No. It means QuickBooks Desktop cannot find the referenced account in the Chart of Accounts.

## Should I Create a New Account or Reactivate the Old One?

If possible, reactivate the original account to avoid mapping issues. Create a new account only if the original was permanently removed.

## Will Running Sync Automatically Fix It?

Running **Sync now** will refresh the account list, but the account must first exist and be active in QuickBooks Desktop.
