---
title: NS0634 Sync Error in NetSuite Integration
description: Learn how to fix the NS0634 sync error in NetSuite when the Expensify Integration role does not have permission to access Employee records.
keywords: NS0634, NetSuite permission error querying Employee, Expensify Integration role employee permission, NetSuite employee record access error, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0634 sync error caused by missing Employee record permissions. Does not cover other NetSuite error codes.
---

# NS0634 Sync Error in NetSuite Integration

If you see the error:

NS0634: Permission error querying NetSuite for 'Employee'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role used for the Expensify integration does not have permission to access Employee records.

---

## Why the NS0634 Sync Error Happens in NetSuite

The NS0634 error occurs when:

- The **Expensify Integration** role does not have access to Employee records.
- The role’s List permissions are restricted.
- The access token is tied to a role missing required Employee permissions.
- Employee permissions were modified after the connection was created.

Expensify must be able to query Employee records to sync and export transactions.

---

## How to Fix the NS0634 Sync Error

### Step One: Update Employee Permissions in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate and select the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to **Permissions**.
8. Open the **Lists** tab.
9. Confirm the permission for **Employees** is set to **Full**.
10. Click **Save**.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once the Employee permission is set to Full and the Workspace is synced, the sync should complete successfully.

---

# FAQ

## Does NS0634 Mean My Integration Is Broken?

No. This error indicates a role permission issue in NetSuite.

## Do I Need to Create a New Access Token?

Not usually. Updating the role permissions and running **Sync** is typically sufficient unless the token is tied to the wrong role.
