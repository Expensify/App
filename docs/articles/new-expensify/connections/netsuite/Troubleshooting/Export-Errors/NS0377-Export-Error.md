---
title: NS0377 Export Error in NetSuite Integration
description: Learn what the NS0377 export error means and how to update the Expensify Integration role permissions in NetSuite to restore expense report exports.
keywords: NS0377, NetSuite expense report permission error, insufficient expense report permissions NetSuite, Expensify Integration role Vendors Full permission, NetSuite role permissions error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0377 export error caused by insufficient Expense Report and Vendor permissions in NetSuite. Does not cover token authentication or subsidiary configuration issues.
---

# NS0377 Export Error in NetSuite Integration

If you see the error:

NS0377 Export Error: Your NetSuite role doesn’t have sufficient Expense Report permissions. Update the Expensify Integration role to grant the required access.

This means the **Expensify Integration role** in NetSuite does not have the required permissions to export expense reports.

Without the correct permissions, NetSuite will block the export.

---

## Why the NS0377 Export Error Happens in NetSuite

The NS0377 error typically occurs when:

- The **Expensify Integration role** does not have sufficient permissions for expense report-related records.
- The role does not have **Full** access to required list or transaction permissions.
- The role lacks proper access to **Vendor** records.

In most cases, this is related to insufficient **Vendor** permissions within the role configuration.

This is a role permission issue in NetSuite, not a token authentication or subsidiary configuration issue.

---

## How to Fix the NS0377 Export Error

Follow the steps below to update the role permissions.

---

## Update the Expensify Integration Role Permissions in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Locate and select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to the **Permissions** section.
6. Select the **Lists** tab.
7. Locate **Vendors**.
8. Set the permission level to **Full**.
9. Click **Save**.

Confirm the permission is saved before proceeding.

---

## Sync the Workspace and Retry the Export

After updating the role permissions:

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

Then retry exporting the expense report.

---

# FAQ

## Does the NS0377 Export Error Affect All Expense Report Exports?

Yes. If the integration role lacks required permissions, all related expense report exports may fail.

## Do I Need NetSuite Admin Access to Fix the NS0377 Export Error?

Yes. Updating role permissions in NetSuite requires administrator-level access.

## Do I Need to Reconnect the Integration?

No. Updating the role permission and selecting **Sync Now** is typically sufficient.
