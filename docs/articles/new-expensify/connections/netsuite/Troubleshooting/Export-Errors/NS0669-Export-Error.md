---
title: NS0669 Export Error in NetSuite Integration
description: Learn what the NS0669 export error means and how to select a valid default vendor instead of NetSuite’s -Accountant- vendor before exporting.
keywords: NS0669, NetSuite default vendor -Accountant-, vendor ID -3 NetSuite, default vendor export error, update Default Vendor Workspace, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0669 export error caused by selecting the -Accountant- default vendor in NetSuite. Does not cover vendor email or subsidiary mismatches.
---

# NS0669 Export Error in NetSuite Integration

If you see the error:

NS0669 Export Error: NetSuite’s default vendor '-Accountant-' (ID -3) cannot be used for exports. Please choose or create a different vendor and retry.

This means the default NetSuite vendor **-Accountant-** is selected as the export vendor in the Workspace.

The **-Accountant-** vendor (Internal ID **-3**) is automatically created by NetSuite and cannot be used for exports.

---

## Why the NS0669 Export Error Happens in NetSuite

NetSuite provides a default vendor called **-Accountant-** in every NetSuite environment:

- Internal ID: **-3**
- System-generated record
- Not intended for transaction exports

If **-Accountant-** is selected as the **Default Vendor** in the Workspace, NetSuite will block the export.

This is a default vendor configuration issue, not a vendor email or subsidiary mismatch.

---

## How to Fix the NS0669 Export Error

Follow the steps below to select a valid default vendor.

---

## Select a Different Default Vendor in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Locate the **Default Vendor** setting.
6. Select a valid vendor from the dropdown (not **-Accountant-**).
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Update the **Default Vendor** field.
6. Tap **Save**.

---

## Sync the Workspace and Retry the Export

1. Go to **Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.
4. Open the report.
5. Retry exporting to NetSuite.

If a valid vendor is selected, the export should complete successfully.

---

# FAQ

## Can I Use the -Accountant- Vendor for Any Exports?

No. The **-Accountant-** vendor (Internal ID -3) is a NetSuite system default and cannot be used for exports from the Workspace.

## Do I Need NetSuite Admin Access to Fix the NS0669 Export Error?

No. You only need Workspace Admin access to update the **Default Vendor** setting.

## Should I Create a New Vendor if None Are Available?

Yes. If no valid vendor exists, create one in NetSuite and then select it as the **Default Vendor** in the Workspace.
