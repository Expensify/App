---
title: NS0634 Sync Error in NetSuite Integration
description: Learn what the NS0634 sync error means and how to update the Expensify Integration role to allow access to Employee records in NetSuite.
keywords: NS0634, NetSuite Employee permission error, Expensify Integration role Employees permission, NetSuite sync error Employee, Employee record permission NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0634 sync error caused by missing Employee record permissions on the Expensify Integration role. Does not cover token formatting or bundle update issues.
---

# NS0634 Sync Error in NetSuite Integration

If you see the error:

NS0634 Sync Error: Permission error querying NetSuite for 'Employee'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role used for the integration does not have access to **Employee** records.

Without proper Employee permissions, the Workspace cannot sync employee data from NetSuite.

---

## Why the NS0634 Sync Error Happens in NetSuite

The NS0634 error typically occurs when:

- The **Expensify Integration** role does not have sufficient permission to access **Employee** records.
- The **Employees** permission under Lists is set to **View**, restricted, or not enabled.
- The access token is tied to a role that lacks Employee permissions.

If the role cannot access Employee records, NetSuite blocks the query during sync.

This is a role permission issue, not a token formatting or bundle update issue.

---

## How to Fix the NS0634 Sync Error

Follow the steps below to update the role permissions in NetSuite.

---

## Update Employee Permissions on the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to **Permissions > Lists**.
6. Locate **Employees**.
7. Set the permission level to **Full**.
8. Click **Save**.

Confirm the change is saved before proceeding.

---

## Sync the Workspace and Retry

After updating the permission:

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

Retry the sync after it completes.

---

# FAQ

## Does the NS0634 Sync Error Affect Employee Imports?

Yes. If the role does not have permission to access Employee records, employee data will not sync properly.

## Do I Need NetSuite Admin Access to Fix the NS0634 Sync Error?

Yes. Updating role permissions in NetSuite requires administrator-level access.

## Do I Need to Reconnect the Integration?

No. Updating the role permission and selecting **Sync Now** is typically sufficient.
