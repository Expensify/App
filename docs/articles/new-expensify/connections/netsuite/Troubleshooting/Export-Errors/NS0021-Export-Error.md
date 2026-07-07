---
title: NS0021 Export Error in NetSuite Integration
description: Learn what the NS0021 export error means and how to correct invalid tax group mappings in NetSuite before exporting.
keywords: NS0021, NetSuite invalid tax code reference, GST mapping NetSuite, tax group mapping error, NCT-AU, TS-AU, NCF-AU, TFS-AU, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0021 export error caused by incorrect tax group mappings in NetSuite. Does not cover role permissions or currency configuration issues.
---

# NS0021 Export Error in NetSuite Integration

If you see the error:

NS0021 Export Error: Invalid tax code reference.

This means there is an incorrect tax group mapping in NetSuite.

The tax code selected in the Workspace must match the correct tax group configuration in NetSuite for the export to succeed.

---

## Why the NS0021 Export Error Happens in NetSuite

The NS0021 error typically occurs when tax groups in NetSuite are mapped incorrectly.

This is commonly related to Australian GST tax codes and incorrect tax group assignments.

If the wrong NetSuite tax group is mapped to a tax rate, NetSuite will reject the export.

This is a tax group configuration issue, not a role permission or currency configuration issue.

---

## How to Fix the NS0021 Export Error

Review and correct your tax group mappings in NetSuite.

### Confirm the Correct Tax Group Mappings

In NetSuite, verify the following mappings:

- **GST 10%** should map to **NCT-AU**, not **TS-AU**.
- **No GST 0%** should map to **NCF-AU**, not **TFS-AU**.

Update the tax group mappings if needed and click **Save**.

### Sync the Workspace in Expensify

After correcting the tax mappings:

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

1. Open the report.
2. Retry exporting to NetSuite.

If the tax groups are mapped correctly, the export should complete successfully.

---

# FAQ

## Does the NS0021 Export Error Affect All Tax Codes?

No. It affects only the tax codes that are incorrectly mapped in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0021 Export Error?

Yes. Updating tax group mappings in NetSuite requires appropriate administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the tax group mapping and selecting **Sync Now** is typically sufficient.
