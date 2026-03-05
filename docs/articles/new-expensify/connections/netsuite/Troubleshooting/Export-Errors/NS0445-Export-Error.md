---
title: NS0445 Export Error in NetSuite Integration
description: Learn what the NS0445 export error means and how to grant Invoice transaction permissions to the Expensify Integration role in NetSuite.
keywords: NS0445, NetSuite missing Invoice permissions, Expensify Integration role Invoice access, Transactions Invoice Full permission NetSuite, NetSuite export error Invoice, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0445 export error caused by missing Invoice transaction permissions in NetSuite. Does not cover vendor record mismatches or posting period errors.
---

# NS0445 Export Error in NetSuite Integration

If you see the error:

NS0445 Export Error: Your NetSuite role is missing Invoice permissions. Update the Expensify Integration role to include Transactions > Invoice access in NetSuite.

This means the **Expensify Integration role** does not have permission to create or manage **Invoices** in NetSuite.

Without Invoice permissions, invoice exports will fail.

---

## Why the NS0445 Export Error Happens in NetSuite

The NS0445 error typically occurs when the Expensify Integration role does not have sufficient permissions for:

- **Transactions > Invoice**

If Invoice access is missing or limited, NetSuite blocks the export.

This is a role permission issue in NetSuite, not a vendor record mismatch or posting period issue.

---

## How to Fix the NS0445 Export Error

Follow the steps below to grant the required Invoice permissions.

---

## Grant Invoice Permissions to the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to **Permissions > Transactions**.
6. Locate **Invoice**.
7. Set the permission level to **Full**.
8. Click **Save**.

Confirm the permission change is saved before proceeding.

---

## Sync the Workspace and Retry the Export

After updating the role permissions:

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

Then retry exporting the invoice.

---

## If Invoice Is Not Available in the Permissions List

If **Invoice** does not appear under Transactions:

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Select **Expensify Integration**.
3. Click **Edit**.
4. Confirm the role has **Full** access for:

Under **Transactions**:
- **Bills and Transactions**
- **Vendor Bill Approval**

Under **Lists**:
- **Vendors**

5. Click **Save**.

Then return to the Workspace, select **Sync Now**, and retry the export.

---

# FAQ

## Does the NS0445 Export Error Affect Only Invoice Exports?

Yes. This error specifically affects exports that require Invoice permissions.

## Do I Need NetSuite Admin Access to Fix the NS0445 Export Error?

Yes. Updating role permissions in NetSuite requires administrator-level access.

## Do I Need to Reconnect the Integration?

No. Updating the role permission and selecting **Sync Now** is typically sufficient.
