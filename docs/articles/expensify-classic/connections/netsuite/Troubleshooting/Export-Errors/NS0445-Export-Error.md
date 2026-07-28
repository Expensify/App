---
title: NS0445 Export Error in NetSuite Integration
description: Learn how to fix the NS0445 export error in NetSuite when the Expensify Integration role is missing Invoice permissions.
keywords: NS0445, NetSuite missing invoice permissions, Expensify Integration role invoice access, Transactions invoice full permission NetSuite, NetSuite role permissions export error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0445 export error caused by missing Invoice and related role permissions. Does not cover other NetSuite error codes.
---

# NS0445 Export Error in NetSuite Integration

If you see the error:

NS0445: Your NetSuite role is missing Invoice permissions. Update the Expensify integration role to include Transactions > Invoice access in NetSuite.

This means the NetSuite role used for the Expensify integration does not have permission to create or access invoices.

---

## Why the NS0445 Export Error Happens in NetSuite

The NS0445 error occurs when:

- The **Expensify Integration** role does not have Invoice permissions.
- The role is missing required transaction-level permissions.
- Invoice-related permissions are restricted or unavailable in the role configuration.

NetSuite requires Full access to Invoice transactions when exporting invoices from Expensify.

---

## How to Fix the NS0445 Export Error

### Step One: Grant Invoice Permission in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate and select the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to **Permissions**.
8. Open the **Transactions** subtab.
9. Locate **Invoice**.
10. Confirm the permission level is set to **Full**.
11. Save the changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

## If Invoice Is Not Available in the Permissions List

If you do not see **Invoice** in the Transactions permissions list:

1. Go to **Setup** > **Users/Roles** > **Manage Roles**.
2. Edit the **Expensify Integration** role.
3. Scroll to **Permissions**.
4. Confirm the role has **Full** access for:

   - **Transactions**
   - **Bills and Transactions**
   - **Vendor Bill Approval**
   - **Lists**
   - **Vendors**

5. Save the changes.

Then:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

# FAQ

## Does NS0445 Mean My Integration Is Broken?

No. This error indicates a role permission issue in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the role permissions and running **Sync** is typically sufficient.
