---
title: NS0938 Sync Error in NetSuite Integration
description: Learn how to fix the NS0938 sync error in NetSuite when the Expensify Integration role does not have permission to access CustomRecord types.
keywords: NS0938, NetSuite permission error querying CustomRecord, Expensify Integration role custom record permission, NetSuite custom record access error, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0938 sync error caused by missing Custom Record permissions. Does not cover other NetSuite error codes.
---

# NS0938 Sync Error in NetSuite Integration

If you see the error:

NS0938: Permissions error querying NetSuite for 'CustomRecord'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role used for the Expensify integration does not have permission to access Custom Record types.

---

## Why the NS0938 Sync Error Happens in NetSuite

The NS0938 error occurs when:

- The **Expensify Integration** role does not have access to Custom Record types.
- Custom Record permissions were removed or modified.
- The access token is tied to a role missing required permissions.
- The Workspace attempts to sync custom fields or custom segments.

Expensify must be able to query Custom Records to sync certain configuration data.

---

## How to Fix the NS0938 Sync Error

### Step One: Update Custom Record Permissions in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate and select the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to **Permissions**.
8. Confirm that **Custom Record** appears as a tab option.
9. Ensure appropriate permissions (typically **View** or **Full**, depending on configuration) are assigned.
10. Click **Save**.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once Custom Record permissions are enabled and the Workspace is synced, the sync should complete successfully.

---

# FAQ

## Does NS0938 Mean My Custom Records Were Deleted?

No. This error indicates a role permission issue, not that the records were removed.

## Do I Need to Create a New Access Token?

Not usually. Updating the role permissions and running **Sync** is typically sufficient unless the token is tied to the wrong role.
