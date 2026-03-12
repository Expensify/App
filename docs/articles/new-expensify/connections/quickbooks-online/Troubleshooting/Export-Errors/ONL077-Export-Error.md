---
title: ONL077 Export Error in QuickBooks Online
description: Learn how to fix the ONL077 export error in QuickBooks Online by disabling duplicate document number warnings and syncing your Workspace in Expensify.
keywords: ONL077, QuickBooks Online duplicate document number, duplicate bill number warning, Warn if duplicate bill number is used, Expensify QuickBooks Online export error, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL077 export error caused by duplicate document number warnings. Does not cover other export error codes.
---

# ONL077 Export Error in QuickBooks Online

If you see the error:

ONL077: Duplicate Document Number flagged. Please disable the setting in QuickBooks.

This means QuickBooks Online is blocking the export because duplicate document number warnings are enabled.

---

## Why the ONL077 Export Error Happens in QuickBooks Online

The ONL077 error occurs when:

- QuickBooks Online has duplicate bill number warnings turned on.
- The document number being exported from Expensify matches an existing bill number in QuickBooks Online.

When duplicate document number warnings are enabled, QuickBooks Online prevents the export from completing.

---

## How to Disable Duplicate Bill Number Warnings in QuickBooks Online

To allow the export to go through, turn off duplicate bill number warnings.

1. In QuickBooks Online, click the **Gear icon** in the upper-right corner.
2. Select **Account and Settings**.
3. Click **Advanced**.
4. Under **Other Preferences**, find **Warn if duplicate bill number is used**.
5. Turn this setting **Off**.
6. Click **Save**, then **Done**.

After updating this setting, return to Expensify and sync your connection.

---

## How to Sync QuickBooks Online in Expensify

After disabling the duplicate bill number warning, refresh your QuickBooks Online connection.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Once the sync completes, retry exporting the report.

---

## How to Re-Export a Report After Fixing ONL077

1. Open the report that failed to export.
2. Click **Export to QuickBooks Online**.
3. Confirm the export.

The report should now export successfully without the duplicate document number error.

---

# FAQ

## Will Disabling Duplicate Bill Number Warnings Affect Existing Bills?

No. Turning off the warning only prevents QuickBooks Online from blocking exports due to duplicate document numbers. It does not change existing bills.

## Do I Need to Reconnect QuickBooks Online to Fix ONL077?

No. You only need to disable the duplicate bill number warning in QuickBooks Online and run **Sync now** in Expensify before retrying the export.
