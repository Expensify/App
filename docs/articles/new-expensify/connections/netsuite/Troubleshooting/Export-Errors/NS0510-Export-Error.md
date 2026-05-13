---
title: NS0510 Export Error in NetSuite Integration
description: Learn what the NS0510 export error means and how to update the Expensify Connect bundle and NetSuite role token permissions to restore exports.
keywords: NS0510, NetSuite role access error, Expensify Connect bundle update, NetSuite token permissions, Access Token Management NetSuite, User Access Tokens NetSuite, Multi-Currency NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0510 export error caused by outdated Expensify Connect bundle or missing NetSuite role token permissions. Does not cover general NetSuite login errors or full integration setup.
---

# NS0510 Export Error in NetSuite Integration

If you see the error:

NS0510 Export Error: Your NetSuite role doesn’t have access to this record. Please ensure the Expensify bundle is up to date and that your role has the required token permissions.

This means there is a permissions issue in NetSuite.

This is usually caused by:

- An outdated **Expensify Connect bundle**, or  
- Missing token-related permissions in the connected NetSuite role  

---

## Why the NS0510 Export Error Happens in NetSuite

The NS0510 error typically occurs when:

- The **Expensify Connect bundle** in NetSuite is not updated to the latest version.
- The NetSuite role used for the integration does not have required token permissions.
- The integration role lacks access to certain records needed during export.
- Multi-Currency settings restrict certain permissions.

When the role does not have proper access, NetSuite blocks the record during export.

This is a bundle or role permission issue, not a general NetSuite login issue.

---

## How to Fix the NS0510 Export Error

Follow the steps below to resolve the issue.

---

## Update the Expensify Connect Bundle in NetSuite

First, confirm the bundle is up to date.

1. Log in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Locate the **Expensify Connect bundle**.
4. Click **Update** and install the latest version.
5. Confirm the update completes successfully.

After updating the bundle:

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

---

## Update NetSuite Role Token Permissions

If the error continues, verify the role permissions in NetSuite.

1. Log in to NetSuite.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select the role used for the Expensify integration.
4. Click **Edit**.
5. Navigate to **Permissions > Setup**.
6. Confirm the following permissions are added:
   - **Access Token Management**
   - **User Access Tokens**
7. Click **Save**.

Note: In some environments, these permissions may be restricted if **Multi-Currency** is enabled.

After updating permissions:

On web:

1. Go to **Workspaces** from the navigation tabs on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap **Workspaces** from the navigation tabs on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry exporting the report once the sync completes.

---

# FAQ

## Does the NS0510 Export Error Affect All Exports?

It can. If the connected NetSuite role lacks required permissions, any export that requires access to restricted records may fail.

## Do I Need NetSuite Admin Access to Fix the NS0510 Export Error?

Yes. Updating bundles and modifying role permissions requires NetSuite administrator access.

## Do I Need to Reconnect the Integration?

No. Updating the bundle and correcting role permissions is typically sufficient.
