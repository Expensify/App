---
title: NS0565 Sync Error in NetSuite Integration
description: Learn what the NS0565 sync error means and how to assign the correct Expensify Integration role and permissions to your NetSuite access token.
keywords: NS0565, NetSuite access token role error, Expensify Integration role NetSuite, NetSuite Account records permission error, Access Token Management NetSuite, User Access Tokens NetSuite, NetSuite sync error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0565 sync error caused by incorrect NetSuite access token role assignment or missing Account record permissions. Does not cover bundle updates or general NetSuite login credential issues.
---

# NS0565 Sync Error in NetSuite Integration

If you see the error:

NS0565 Sync Error: The role linked to your NetSuite access token doesn’t have permission to access Account records. Please confirm the token is assigned to the Expensify Integration role by viewing the 'Access Token' in NetSuite.

This means the NetSuite access token is tied to a role that does not have permission to access **Account** records.

When the access token is linked to the wrong role or a role missing required permissions, syncing and exports will fail.

---

## Why the NS0565 Sync Error Happens in NetSuite

The NS0565 error typically occurs when:

- The **NetSuite Access Token** is assigned to the wrong role.
- The token is not linked to the **Expensify Integration** role.
- The assigned role does not have permission to access **Account** records.
- Global permissions on the user override the role permissions.

Access tokens in NetSuite are tied to both a specific **User** and **Role**. If the role does not include the required permissions, NetSuite blocks the sync.

This is a token and role configuration issue, not a bundle update or general login issue.

---

## How to Fix the NS0565 Sync Error

Follow the steps below to confirm the correct role and permissions are configured.

---

## Confirm the Role Assigned to the NetSuite Access Token

1. Log in to NetSuite as an administrator.
2. Search for **Access Tokens**.
3. Locate the token used for the Workspace connection.
4. Click **View** next to the token.
5. Confirm the **Role** listed is **Expensify Integration**.

If the token is tied to a different role:

- Generate a new token using the correct **User** and **Expensify Integration** role.
- Update the credentials in the Workspace.

---

## Assign the Expensify Integration Role to the User

If the **Expensify Integration** role is not assigned to the user:

1. Go to **Lists > Employees**.
2. Open the employee record used for the NetSuite connection.
3. Click **Edit**.
4. Select the **Access** tab.
5. Add the **Expensify Integration** role.
6. Click **Save**.

---

## Review Global Permissions on the Employee Record

After assigning the correct role:

1. Open the employee record.
2. Review the **Global Permissions** section.
3. Confirm:
   - **Web Services** permissions are either removed or set to **Full**.
   - **Access Tokens** permissions are either removed or set to **Full**.

Restricted global permissions can override role permissions and cause this error.

---

## Sync the Workspace and Retry

After confirming role and token configuration:

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

Retry the sync once complete.

---

# FAQ

## Does the NS0565 Sync Error Affect All Exports?

Yes. If the access token role does not have permission to access Account records, syncing and exports will fail.

## Do I Need NetSuite Admin Access to Fix the NS0565 Sync Error?

Yes. You must have administrator permissions to manage roles, users, and access tokens in NetSuite.

## Do I Need to Reconnect the Integration?

Only if the access token was created with the wrong role. In that case, generate a new token and update the connection.
