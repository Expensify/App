---
title: ONL077 Export Error in QuickBooks Online Integration
description: Learn what the ONL077 export error means in QuickBooks Online and how to adjust duplicate document number settings to restore successful exports.
keywords: ONL077, QuickBooks Online export error, duplicate document number flagged, duplicate bill number warning QuickBooks, disable duplicate bill number warning, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL077 export error caused by duplicate document number warnings. Does not cover other QuickBooks Online error codes.
---

# ONL077 Export Error in QuickBooks Online Integration

If you see the error:

ONL077: Duplicate Document Number flagged.

This means QuickBooks Online has duplicate document number warnings enabled, and the document number being exported already exists in QuickBooks, preventing the export from completing.

---

## Why the ONL077 Export Error Happens in QuickBooks Online

The ONL077 error typically indicates:

- Duplicate bill number warnings are enabled in QuickBooks Online.
- The exported report uses a document number that already exists.
- QuickBooks Online blocked the transaction due to duplicate validation rules.

QuickBooks Online includes a preference that warns users when duplicate document numbers are used. If this setting is enabled, exports may fail when a duplicate number is detected.

This is a QuickBooks Online preference setting, not a Workspace configuration issue.

---

## How to Fix the ONL077 Export Error

This issue must be resolved in QuickBooks Online.

1. Log in to QuickBooks Online.
2. Select the **Gear icon**.
3. Go to **Account and Settings**.
4. Click the **Advanced** tab.
5. Under **Other preferences**, locate **Warn if duplicate bill number is used**.
6. Turn this setting **Off**.
7. Save your changes.

After updating QuickBooks Online:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After disabling the duplicate warning and selecting **Sync Now**, retry the export.

## Does ONL077 Mean My Report Already Exists?

It may. The document number being exported matches an existing document number in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the duplicate document number setting and running **Sync Now** is typically sufficient.
