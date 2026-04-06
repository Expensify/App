---
title: NS0510 Export Error in NetSuite Integration
description: Learn how to fix the NS0510 export error in NetSuite when your role lacks access to required records or token permissions.
keywords: NS0510, NetSuite role access error, Expensify Connect bundle update, NetSuite token permissions, Access Token Management permission, User Access Tokens permission, multi-currency NetSuite restriction, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0510 export error caused by outdated bundles or insufficient role/token permissions. Does not cover other NetSuite error codes.
---

# NS0510 Export Error in NetSuite Integration

If you see the error:

NS0510: Your NetSuite role doesn’t have access to this record. Please ensure the Expensify bundle is up to date and that your role has the required token permissions.

This means the NetSuite role connected to Expensify does not have sufficient permissions to access required records.

---

## Why the NS0510 Export Error Happens in NetSuite

The NS0510 error occurs when:

- The **Expensify Connect** bundle in NetSuite is outdated.
- The NetSuite role used for the connection lacks required token permissions.
- Access Token Management permissions are missing.
- Multi-Currency settings restrict required permissions.
- The integration token does not have access to specific record types.

This error is typically related to role configuration or bundle version.

---

# How to Fix the NS0510 Export Error

## Option One: Update the Expensify Connect Bundle

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **SuiteBundler**.
4. Click **Search & Install Bundles**.
5. Open the **List** tab.
6. Locate the **Expensify Connect** bundle.
7. Update it to the latest available version.

After updating the bundle:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

## Option Two: Update NetSuite Role Permissions

If the bundle is already up to date, review the role permissions.

1. In NetSuite, go to **Setup** > **Users/Roles** > **Manage Roles**.
2. Select the role used for the Expensify integration.
3. Go to the **Permissions** tab.
4. Under the **Setup** subtab, confirm the following permissions are added:
   - **Access Token Management**
   - **User Access Tokens**

Note: These permissions can only be added if **Multi-Currency** is not enabled.

After updating permissions:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

# FAQ

## Does NS0510 Mean My Integration Is Broken?

No. This error indicates a permission or bundle configuration issue in NetSuite.

## Does Multi-Currency Affect Token Permissions?

Yes. If Multi-Currency is enabled in NetSuite, certain token-related permissions may be restricted. Review your role configuration carefully.
