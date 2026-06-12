---
title: NS0844 Sync Error in NetSuite Integration
description: Learn how to fix the NS0844 sync error in NetSuite when the Expensify Integration role does not have permission to access Vendor records.
keywords: NS0844, NetSuite permission error querying Vendor, Expensify Integration role vendor permission, NetSuite access token role mismatch, vendor record permission error, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0844 sync error caused by missing Vendor record permissions. Does not cover other NetSuite error codes.
---

# NS0844 Sync Error in NetSuite Integration

If you see the error:

NS0844: Permission error querying NetSuite for 'Vendor'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role associated with the Expensify access token does not have permission to access Vendor records.

---

## Why the NS0844 Sync Error Happens in NetSuite

The NS0844 error occurs when:

- The NetSuite access token is assigned to the wrong role.
- The **Expensify Integration** role does not have Vendor permissions.
- The role’s List permissions were modified after the token was created.
- The token is tied to a user-role combination that lacks access to Vendor records.

Access tokens in NetSuite are linked to both a **User** and a **Role**. If the role lacks required permissions, the sync will fail.

---

## How to Fix the NS0844 Sync Error

### Step One: Confirm the Token Is Assigned to the Expensify Integration Role

1. Log in to **NetSuite** as an Administrator.
2. Search for **Access Tokens**.
3. Click **View** next to the token used for the Expensify integration.
4. Confirm the token is assigned to the **Expensify Integration** role.

If the token is not assigned to the correct role, create a new token tied to the correct user and role, then reconnect in Expensify.

---

### Step Two: Update Vendor Permissions on the Expensify Integration Role

1. In NetSuite, go to **Setup**.
2. Select **Users/Roles**.
3. Click **Manage Roles**.
4. Select **Expensify Integration**.
5. Click **Edit**.
6. Scroll to **Permissions**.
7. Open the **Lists** tab.
8. Locate **Vendors**.
9. Set the permission level to **Full**.
10. Click **Save**.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Sync or Export

Once the Vendor permission is set to Full and the Workspace is synced, the sync should complete successfully.

---

# FAQ

## Does NS0844 Mean My Vendor Records Are Missing?

No. This error indicates a role permission issue, not missing vendor records.

## Do I Need to Reconnect NetSuite?

Not usually. Updating the role permissions and running **Sync** is typically sufficient unless the token is tied to the wrong role.
