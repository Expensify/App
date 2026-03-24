---
title: NS0988 Export Error in NetSuite Integration
description: Learn what the NS0988 export error means and how to restore or reactivate the CA-Zero tax group in NetSuite for mileage and per diem exports.
keywords: NS0988, CA-Zero tax group NetSuite, mileage tax export error NetSuite, per diem tax export error NetSuite, missing tax group NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0988 export error caused by a missing, renamed, or inactive CA-Zero tax group required for mileage and per diem exports. Does not cover general tax rate mapping issues.
---

# NS0988 Export Error in NetSuite Integration

If you see the error:

NS0988 Export Error: The 'CA-Zero' tax group is missing or renamed in NetSuite. This tax code is required for exporting mileage and per diem expenses.

This means the required **CA-Zero** tax group is not available in NetSuite.

The **CA-Zero** tax group is required when exporting mileage and per diem expenses where no tax is applied.

---

## Why the NS0988 Export Error Happens in NetSuite

The NS0988 error typically occurs when:

- The **CA-Zero** tax group is missing in NetSuite.
- The tax group was renamed.
- The tax group is inactive.
- You are exporting **mileage** or **per diem** expenses that require a zero-tax group.

NetSuite requires the specific **CA-Zero** tax group to process zero-tax transactions correctly.

If it cannot find the tax group, the export fails.

This is a required tax group configuration issue, not a general tax rate mapping issue.

---

## How to Fix the NS0988 Export Error

Follow the steps below to restore or reactivate the CA-Zero tax group.

---

## Confirm the CA-Zero Tax Group in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Accounting > Tax Groups**.
3. Locate the tax group named **CA-Zero**.
4. Confirm that it:
   - Exists.
   - Is spelled exactly **CA-Zero**.
   - Is marked as **Active**.

If the tax group was renamed:

- Rename it back to **CA-Zero**.

If it is inactive:

- Reactivate the tax group.

Click **Save** after making any changes.

---

## Sync the Workspace and Retry the Export

After confirming the tax group:

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

Then retry exporting the report.

If the **CA-Zero** tax group exists and is active, the export should complete successfully.

---

# FAQ

## Does the NS0988 Export Error Affect Only Mileage and Per Diem Expenses?

Yes. The **CA-Zero** tax group is specifically required for exporting zero-tax mileage and per diem expenses.

## Do I Need NetSuite Admin Access to Fix the NS0988 Export Error?

Yes. Creating, renaming, or reactivating tax groups in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Restoring or reactivating the **CA-Zero** tax group and selecting **Sync Now** is typically sufficient.
