---
title: NS0938 Sync Error in NetSuite Integration
description: Learn what the NS0938 sync error means and how to update the Expensify Integration role to allow access to Custom Records in NetSuite.
keywords: NS0938, NetSuite CustomRecord permission error, Expensify Integration role Custom Record access, NetSuite role permissions Custom Record, NetSuite sync error CustomRecord, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0938 sync error caused by missing Custom Record permissions on the Expensify Integration role. Does not cover ScriptID formatting or bundle reinstall steps.
---

# NS0938 Sync Error in NetSuite Integration

If you see the error:

NS0938 Sync Error: Permission error querying NetSuite for 'CustomRecord'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role used for the integration does not have permission to access **Custom Records**.

Without Custom Record access, the Workspace cannot query or sync custom data from NetSuite.

---

## Why the NS0938 Sync Error Happens in NetSuite

The NS0938 error typically occurs when:

- The **Expensify Integration** role does not include permissions for **Custom Records**.
- The role does not have access to specific Custom Record Types required by your configuration.
- The access token is tied to a role missing Custom Record permissions.

If the role cannot access Custom Records, NetSuite blocks the query during sync.

This is a role permission issue, not a ScriptID formatting or bundle reinstall issue.

---

## How to Fix the NS0938 Sync Error

Follow the steps below to confirm Custom Record permissions are enabled.

---

## Confirm Custom Record Permissions on the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to **Permissions**.
6. Confirm that the required **Custom Record Types** are listed.
7. Ensure the permission level is set to **View** or **Full**, depending on your configuration.
8. Click **Save**.

If your configuration relies on specific Custom Record Types, confirm each required record type is included.

---

## Sync the Workspace and Retry

After updating permissions:

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

## Does the NS0938 Sync Error Affect Custom Fields?

Yes. If Custom Record permissions are missing, any related custom fields or custom record mappings may fail to sync.

## Do I Need NetSuite Admin Access to Fix the NS0938 Sync Error?

Yes. Updating role permissions for Custom Records requires NetSuite administrator access.

## Do I Need to Reconnect the Integration?

No. Updating the role permissions and selecting **Sync Now** is typically sufficient.
