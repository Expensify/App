---
title: NS0034 Export Error in NetSuite Integration
description: Learn what the NS0034 export error means and how to delete duplicate records in NetSuite before reexporting from the Workspace.
keywords: NS0034, NetSuite record already exists, duplicate export NetSuite, report exported twice NetSuite, delete duplicate NetSuite record, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0034 export error caused by duplicate records from reexport attempts. Does not cover permission or mapping issues.
---

# NS0034 Export Error in NetSuite Integration

If you see the error:

NS0034 Export Error: This record already exists. Please search for the report ID in NetSuite, delete the entry, and reexport from Expensify.

This means the report has already been exported to NetSuite.

NetSuite prevents duplicate records from being created.

---

## Why the NS0034 Export Error Happens in NetSuite

The NS0034 error typically occurs when:

- A report is exported successfully to NetSuite.
- An attempt is made to export the same report again.
- The original record still exists in NetSuite.

Because the record already exists, NetSuite blocks the second export to prevent duplicates.

This is a duplicate record issue, not a permission or mapping issue.

---

## How to Fix the NS0034 Export Error

Follow the steps below to remove the duplicate record and retry the export.

### Search for the Report in NetSuite

1. Log in to NetSuite.
2. Use the global search bar.
3. Search for the **Report ID** referenced in the error.
4. Locate the existing exported record.
5. Review the record to confirm it is a duplicate.
6. Delete the original export entry if you intend to replace it.

Only delete the record if you need to reexport the report.

### Sync the Workspace

After deleting the record in NetSuite:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

### Retry the Export

1. Open the report in the Workspace.
2. Retry exporting to NetSuite.

If the duplicate record has been removed, the export should complete successfully.

---

# FAQ

## Does the NS0034 Export Error Mean the Original Export Failed?

No. It usually means the original export succeeded and NetSuite is preventing a duplicate record.

## Should I Always Delete the Existing Record in NetSuite?

No. Only delete it if you need to reexport the report. If the original record is correct, no further action is required.

## Can This Affect Other Reports?

No. This error applies only to the specific report that was previously exported.
