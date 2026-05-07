---
title: NS0565 Sync Error in NetSuite Integration
description: Learn what the NS0565 sync error means and how to assign the correct Expensify Integration role to your NetSuite access token.
keywords: NS0565, NetSuite access token error, Expensify Integration role, NetSuite Account records permission, Access Token role, NetSuite sync error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0565 sync error caused by incorrect NetSuite access token role configuration. Does not cover bundle updates or general NetSuite credential setup.
---

# NS0565 Sync Error in NetSuite Integration

If you see the error:

NS0565 Sync Error: The role linked to your NetSuite access token doesn’t have permission to access Account records. Please confirm the token is assigned to the Expensify Integration role by viewing the "Access Token" in NetSuite.

This means the wrong role is assigned to your NetSuite access token.

When the access token is tied to a role without the required permissions, syncing between the Workspace and NetSuite will fail.

---

## Why the NS0565 Sync Error Happens in NetSuite

The NS0565 error typically indicates:

- The NetSuite **Access Token** is assigned to the wrong role.
- The assigned role does not have permission to access **Account records**.
- Global permissions on the employee record are overriding the role permissions.

The access token must be linked to the **Expensify Integration role**. If it is linked to another role without proper access, NetSuite blocks the sync.

This is an access token role configuration issue, not a bundle or general credential setup issue.

---

## How to Fix the NS0565 Sync Error

Follow the steps below to confirm the correct role is assigned and properly configured.

---

## Confirm the Role Assigned to the NetSuite Access Token

1. Log in to NetSuite as an administrator.
2. Search for **Access Tokens**.
3. Locate the token used for the Expensify connection.
4. Click **View** next to the token.
5. Confirm that the **Expensify Integration role** is assigned to the token.

If the Expensify Integration role is already assigned, continue to the next section.

---

## Assign the Expensify Integration Role to the Employee Record

If the Expensify Integration role is not assigned:

1. Search for the NetSuite employee record used to create the access token.
2. Click **Edit**.
3. Select the **Access** tab.
4. Add the **Expensify Integration role** to the employee.
5. Click **Save**.

After assigning the role, confirm the access token is linked to that role.

---

## Review Global Permissions on the Employee Record

Global permissions can override role permissions.

1. Open the same employee record in NetSuite.
2. Review the **Global Permissions** section.

Make sure:

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

If the access token is correctly configured, syncing should resume successfully.

---

# FAQ

## Does the NS0565 Sync Error Affect All Exports?

Yes. If the access token role does not have permission to access Account records, syncing and exports to NetSuite will fail.

## Do I Need NetSuite Admin Access to Fix the NS0565 Sync Error?

Yes. You must have permission to manage roles, employee records, and access tokens in NetSuite.

## Does This Require Reconnecting the Integration?

No. Correcting the access token role and permissions and selecting **Sync Now** is typically sufficient.
