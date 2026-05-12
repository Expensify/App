---
title: NS0565 Sync Error in NetSuite Integration
description: Learn what the NS0565 sync error means and how to assign the correct Expensify Integration role and permissions to your NetSuite access token.
keywords: NS0565, NetSuite access token error, Expensify Integration role, NetSuite Account records permission, Access Token Management, User Access Tokens, NetSuite sync error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0565 sync error caused by incorrect NetSuite access token role configuration and permissions. Does not cover bundle updates or general NetSuite login credential issues.
---

# NS0565 Sync Error in NetSuite Integration

If you see the error:

NS0565 Sync Error: The role linked to your NetSuite access token doesn’t have permission to access Account records. Please confirm the token is assigned to the Expensify Integration role by viewing the "Access Token" in NetSuite.

This means the NetSuite access token is linked to a role that does not have permission to access **Account records**.

When the access token is tied to a role without the required permissions, syncing and exports to NetSuite will fail.

---

## Why the NS0565 Sync Error Happens in NetSuite

The NS0565 error typically occurs when:

- The **NetSuite Access Token** is assigned to the wrong role.
- The assigned role does not include permissions to access **Account records**.
- The **Expensify Integration role** is not assigned to the employee record used to create the token.
- Global permissions on the employee record override the role’s permissions.

The access token must be linked to the **Expensify Integration role**. If it is assigned to another role without proper permissions, NetSuite blocks the sync.

This is a role and permission configuration issue, not a bundle update or general login credential issue.

---

## How to Fix the NS0565 Sync Error

Follow the steps below to confirm the correct role and permissions are configured.

---

## Confirm the Role Assigned to the NetSuite Access Token

1. Log in to NetSuite as an administrator.
2. Search for **Access Tokens**.
3. Locate the token used for the Expensify connection.
4. Click **View** next to the listed token.
5. Confirm that the **Expensify Integration role** is assigned to the token.

If the Expensify Integration role is already assigned, continue to the next section.

---

## Assign the Expensify Integration Role to the Employee Record

If the Expensify Integration role is not assigned:

1. Search for the NetSuite employee record used to create the access token.
2. Click **Edit**.
3. Select the **Access** tab.
4. Add the **Expensify Integration role**.
5. Click **Save**.

After updating the employee record, confirm the access token is linked to the correct role.

---

## Review Global Permissions on the Employee Record

Global permissions can override role permissions.

1. Open the same employee record in NetSuite.
2. Locate the **Global Permissions** section.
3. Confirm that:
   - Permissions for **Web Services** and **Access Tokens** are removed, or  
   - These permissions are set to **Full**.

If these permissions are restricted, they can override the role permissions and cause the NS0565 sync error.

---

## Retry the Sync in the Workspace

After confirming the role and permissions:

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

If the access token and role permissions are configured correctly, syncing should resume successfully.

---

# FAQ

## Does the NS0565 Sync Error Affect All Exports?

Yes. If the access token role does not have permission to access Account records, syncing and exports to NetSuite will fail.

## Do I Need NetSuite Admin Access to Fix the NS0565 Sync Error?

Yes. You must have permission to manage roles, employee records, and access tokens in NetSuite.

## Do I Need to Reconnect the Integration?

No. Correcting the role assignment and permissions and selecting **Sync Now** is typically sufficient.
