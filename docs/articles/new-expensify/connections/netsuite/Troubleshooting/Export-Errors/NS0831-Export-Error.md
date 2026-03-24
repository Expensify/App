---
title: NS0831 Export Error in NetSuite Integration
description: Learn what the NS0831 export error means and how to fix invalid or missing Class and other classification settings between NetSuite and the Workspace.
keywords: NS0831, NetSuite invalid classification, Class not found NetSuite, missing classification export error, cross-subsidiary customers projects NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0831 export error caused by invalid or missing Class or other classification settings. Does not cover vendor or employee email mismatches.
---

# NS0831 Export Error in NetSuite Integration

If you see the error:

NS0831 Export Error: Invalid or missing classification. Verify it exists in NetSuite and the employee has access.

This means the selected **Class** or other classification in the Workspace is not valid in NetSuite.

NetSuite blocks exports when a Class or related classification is missing, inactive, or restricted.

---

## Why the NS0831 Export Error Happens in NetSuite

The NS0831 error typically occurs when:

- The selected **Class** does not exist in NetSuite.
- The Class is inactive.
- The employee associated with the report does not have access to that Class.
- The Class is not available for the employee’s subsidiary.
- Classification settings were recently updated and have not yet synced.

If NetSuite cannot validate the classification, the export fails.

This is a classification configuration issue, not a vendor or employee email mismatch issue.

---

## How to Fix the NS0831 Export Error

Follow the options below based on your configuration.

---

## Enable Cross-Subsidiary Customers or Projects in the Workspace

If classifications span multiple subsidiaries:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Enable **Cross-Subsidiary Customers/Projects**.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Enable **Cross-Subsidiary Customers/Projects**.
6. Tap **Save**.

Retry exporting the report.

---

## Update Time and Expense Preferences in NetSuite

If project restrictions are limiting classification access:

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Accounting > Accounting Preferences**.
3. Select the **Time & Expenses** tab.
4. Uncheck **Show Projects Only for Time and Expenses**.
5. Click **Save**.

Then in the Workspace:

1. Go to **Settings > Workspaces > Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.
4. Retry exporting the report.

---

## Confirm the Classification Exists and Is Active in NetSuite

1. Log in to NetSuite.
2. Locate the Class or other classification referenced in the error.
3. Confirm it:
   - Exists.
   - Is active.
   - Is available to the employee’s subsidiary.
4. Save any changes.

Then:

1. Go to **Workspaces > Accounting**.
2. Click **Sync Now**.
3. Retry exporting the report.

---

# FAQ

## Does the NS0831 Export Error Affect Only Class Fields?

It most commonly relates to **Class**, but it can also apply to other classifications such as **Department** or **Location**.

## Do I Need NetSuite Admin Access to Fix the NS0831 Export Error?

Yes. Updating accounting preferences and classification settings in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the classification settings and selecting **Sync Now** is typically sufficient.
