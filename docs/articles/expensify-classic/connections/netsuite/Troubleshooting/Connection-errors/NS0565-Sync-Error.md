---
title: NS0565 Sync Error in NetSuite Integration
description: Learn how to fix the NS0565 sync error in NetSuite when the access token role does not have permission to access Account records.
keywords: NS0565, NetSuite access token role error, role does not have permission to access Account records, Expensify Integration role NetSuite, update NetSuite token role, Web Services permission override, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0565 sync error caused by incorrect role assignment or token permissions. Does not cover other NetSuite error codes.
---

# NS0565 Sync Error in NetSuite Integration

If you see the error:

NS0565: The role linked to your NetSuite access token doesn’t have permission to access Account records. Please confirm the token is assigned to the Expensify Integration role by viewing the 'Access Token' in NetSuite.

This means the NetSuite access token used by Expensify is assigned to a role that does not have permission to access Account records.

---

## Why the NS0565 Sync Error Happens in NetSuite

The NS0565 error occurs when:

- The NetSuite Access Token is assigned to the wrong role.
- The role assigned to the token does not include the required permissions.
- Global permissions on the employee record override role-level permissions.
- The Expensify Integration role is not properly assigned to the employee.

Expensify requires the Access Token to be tied to the correct role with the appropriate permissions.

---

## How to Fix the NS0565 Sync Error

### Step One: Confirm the Role Assigned to the Access Token

1. Log in to **NetSuite** as an Administrator.
2. Search for **Access Tokens**.
3. Click **View** next to the token used for the Expensify integration.
4. Confirm the token is assigned to the **Expensify Integration** role.

If the token is not assigned to the correct role, continue to Step Two.

---

### Step Two: Assign the Expensify Integration Role to the Employee

1. Search for the NetSuite **Employee** record used to create the access token.
2. Click **Edit**.
3. Go to the **Access** tab.
4. Add the **Expensify Integration** role.
5. Save the changes.

---

### Step Three: Review Global Permissions on the Employee Record

1. On the same employee record, review **Global Permissions**.
2. If the following permissions are listed, either remove them or set them to **Full**:
   - **Web Services**
   - **Access Tokens**

These global permissions can override role-level permissions and cause conflicts.

---

### Step Four: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

After updating the role and permissions, the sync should complete successfully.

---

# FAQ

## Do I Need to Create a New Access Token?

Not usually. Updating the role assignment and permissions typically resolves the issue. If the problem persists, generate a new token tied to the correct role.

## Does NS0565 Mean My Integration Is Broken?

No. This error indicates a role or permission configuration issue in NetSuite.
