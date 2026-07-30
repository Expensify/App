---
title: NS0756 Export Error in NetSuite Integration
description: Learn what the NS0756 export error means and how to update the Expensify Integration role to allow access to all required subsidiaries in NetSuite.
keywords: NS0756, NetSuite transaction nexus invalid, nexus not valid for subsidiary NetSuite, Expensify Integration role subsidiary access, NetSuite role subsidiary permissions, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0756 export error caused by subsidiary access restrictions on the Expensify Integration role. Does not cover tax rate mapping or currency configuration issues.
---

# NS0756 Export Error in NetSuite Integration

If you see the error:

NS0756 Export Error: The transaction nexus isn’t valid for the selected subsidiary. Update the Expensify Integration role to allow access to all subsidiaries in NetSuite.

This means the integration role does not have access to the subsidiary associated with the transaction nexus.

NetSuite blocks transactions when the connected role is restricted from accessing the required subsidiary.

---

## Why the NS0756 Export Error Happens in NetSuite

The NS0756 error typically occurs when:

- The transaction **Nexus** is tied to a specific subsidiary.
- The **Expensify Integration role** is restricted to certain subsidiaries.
- The integration role does not include the subsidiary required for the transaction.

If the role cannot access the subsidiary associated with the nexus, NetSuite rejects the export.

This is a subsidiary access permission issue, not a tax rate mapping or currency configuration issue.

---

## How to Fix the NS0756 Export Error

Follow the steps below to update subsidiary access for the integration role.

---

## Update Subsidiary Access on the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. In the **Subsidiary Restrictions** section:
   - Select **All** subsidiaries, or  
   - Select **Selected** and ensure all required subsidiaries are highlighted.
6. Click **Save**.

This ensures the integration role can access all subsidiaries required for export.

---

## Sync the Workspace and Retry the Export

After updating subsidiary access:

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

If the integration role has access to the required subsidiary, the export should complete successfully.

---

# FAQ

## Does the NS0756 Export Error Affect Only One Subsidiary?

Yes. It affects exports tied to subsidiaries the integration role cannot access.

## Do I Need NetSuite Admin Access to Fix the NS0756 Export Error?

Yes. Updating subsidiary access on roles requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Updating the role’s subsidiary access and selecting **Sync Now** is typically sufficient.
