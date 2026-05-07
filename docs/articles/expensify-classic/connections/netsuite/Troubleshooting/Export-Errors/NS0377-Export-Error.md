---
title: NS0377 Export Error in NetSuite Integration
description: Learn how to fix the NS0377 export error in NetSuite when the Expensify Integration role lacks sufficient Expense Report permissions.
keywords: NS0377, NetSuite insufficient expense report permissions, Expensify Integration role vendors permission, NetSuite role permissions expense report, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0377 export error caused by insufficient role permissions. Does not cover other NetSuite error codes.
---

# NS0377 Export Error in NetSuite Integration

If you see the error:

NS0377: Your NetSuite role doesn’t have sufficient Expense Report permissions. Update the Expensify Integration role to grant the required access.

This means the NetSuite role used for the Expensify integration does not have the required permissions to export expense reports.

---

## Why the NS0377 Export Error Happens in NetSuite

The NS0377 error occurs when:

- The **Expensify Integration** role does not have full access to required records.
- Vendor permissions are not set to Full.
- Expense report-related fields are restricted by role configuration.
- NetSuite blocks the export due to insufficient role permissions.

NetSuite requires the integration role to have the correct permissions to create and manage expense-related transactions.

---

## How to Fix the NS0377 Export Error

### Step One: Update the Expensify Integration Role in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to the **Permissions** section.
8. Open the **Lists** tab.
9. Confirm the permission for **Vendors** is set to **Full**.
10. Save the changes.

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

Once the required permissions are granted and the Workspace is synced, the export should complete successfully.

---

# FAQ

## Does NS0377 Mean My Integration Is Broken?

No. This error indicates a role permission issue in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the role permissions and running **Sync** is typically sufficient.
