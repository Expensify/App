---
title: DESK57 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK57 export error in QuickBooks Desktop when an account or category is missing or inactive.
keywords: DESK57, QuickBooks Desktop account not found, category inactive QuickBooks Desktop, export account deleted, Chart of Accounts error, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK57 export error caused by missing or inactive accounts. Does not cover QuickBooks Online errors.
---

# DESK57 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK57: Account not found. The category or export account may be deleted or inactive in the QuickBooks Desktop Chart of Accounts.

This means the category selected on the report or the export account configured in the Workspace cannot be found in QuickBooks Desktop.

---

## Why the DESK57 Export Error Happens in QuickBooks Desktop

The DESK57 error occurs when:

- The category used on the report was deleted in QuickBooks Desktop.
- The export account in Workspace settings was made inactive.
- The Chart of Accounts changed after the last sync.
- The selected account no longer exists in QuickBooks Desktop.

If QuickBooks Desktop cannot locate the account, the export will fail.

---

## How to Fix the DESK57 Export Error

### Step One: Confirm the Account in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to **Lists** > **Chart of Accounts**.
3. Locate the category used on the report.
4. Confirm the account:
   - Exists.
   - Is active.

If the account does not exist, create it.

If the account is inactive, reactivate it.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This refreshes the Chart of Accounts from QuickBooks Desktop.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct category and export account are selected.
3. Retry exporting the report.

Once the account exists and is active in QuickBooks Desktop, the export should complete successfully.

---

# FAQ

## Does DESK57 Mean My QuickBooks Desktop Connection Is Broken?

No. This error usually indicates that the selected account or category is missing or inactive.

## Do I Need to Reconnect QuickBooks Desktop?

Not usually. Running **Sync now** after creating or reactivating the account typically resolves the issue.
