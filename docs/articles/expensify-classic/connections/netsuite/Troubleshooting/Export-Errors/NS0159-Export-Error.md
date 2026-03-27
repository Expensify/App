---
title: NS0159 Export Error in NetSuite Integration
description: Learn how to fix the NS0159 export error in NetSuite when the Expensify Integration role does not have sufficient Pay Bills permissions.
keywords: NS0159, NetSuite insufficient bills permissions, Pay Bills full access NetSuite, Expensify Integration role permissions, NetSuite vendor bill permission error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0159 export error caused by insufficient Pay Bills permissions. Does not cover other NetSuite error codes.
---

# NS0159 Export Error in NetSuite Integration

If you see the error:

NS0159: Your NetSuite role doesn’t have sufficient Bills permissions. Update the Expensify Integration role to grant 'Pay Bills' full access.

This means the NetSuite role used for the Expensify integration does not have full permission to process bill payments.

---

## Why the NS0159 Export Error Happens in NetSuite

The NS0159 error occurs when:

- The **Pay Bills** permission is not set to **Full** in the Expensify Integration role.
- The NetSuite role used for the integration has limited transaction permissions.
- The export process requires bill-related access that the role does not have.

NetSuite requires Full access to the Pay Bills permission for certain export actions involving vendor bills.

---

## How to Fix the NS0159 Export Error

### Step One: Update the Expensify Integration Role in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate and select the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to **Permissions**.
8. Open the **Transactions** subtab.
9. Locate **Pay Bills**.
10. Confirm the permission level is set to **Full**.
11. Save the changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the Pay Bills permission is set to Full and the Workspace is synced, the export should complete successfully.

---

# FAQ

## Does NS0159 Mean My Integration Is Broken?

No. This error indicates a role permission issue in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the role permission and running **Sync** is typically sufficient.
