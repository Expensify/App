---
title: NS0159 Export Error in NetSuite Integration
description: Learn what the NS0159 export error means and how to grant Full access to the Pay Bills permission in the Expensify Integration role in NetSuite.
keywords: NS0159, NetSuite Pay Bills permission error, insufficient Bills permissions NetSuite, Expensify Integration role Transactions permission, Pay Bills Full access NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0159 export error caused by insufficient Pay Bills transaction permissions in NetSuite. Does not cover vendor record or approval workflow configuration issues.
---

# NS0159 Export Error in NetSuite Integration

If you see the error:

NS0159 Export Error: Your NetSuite role doesn’t have sufficient Bills permissions. Update the Expensify Integration role to grant 'Pay Bills' full access.

This means the integration role does not have the required **Pay Bills** transaction permission in NetSuite.

Without **Full** access to Pay Bills, NetSuite will block exports related to bill payments.

---

## Why the NS0159 Export Error Happens in NetSuite

The NS0159 error typically occurs when:

- The **Expensify Integration role** does not have **Pay Bills** permission set to **Full**.
- The permission is set to **View**, **Create**, or not enabled at all.
- NetSuite blocks the export because the role cannot create or update bill payments.

If the Pay Bills permission is restricted, vendor bill-related exports may fail.

This is a transaction permission issue in NetSuite, not a vendor record or approval workflow configuration issue.

---

## How to Fix the NS0159 Export Error

Follow the steps below to update the role permissions in NetSuite.

---

## Update the Pay Bills Permission in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to **Permissions > Transactions**.
6. Locate **Pay Bills**.
7. Set the permission level to **Full**.
8. Click **Save**.

Confirm the permission change is saved before proceeding.

---

## Sync the Workspace in Expensify

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

---

## Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the **Pay Bills** permission is set to **Full**, the export should complete successfully.

---

# FAQ

## Does the NS0159 Export Error Affect Vendor Bill Exports?

Yes. If the **Pay Bills** permission is restricted, vendor bill-related exports may fail.

## Do I Need NetSuite Admin Access to Fix the NS0159 Export Error?

Yes. Updating role permissions in NetSuite requires administrator-level access.

## Do I Need to Reconnect the Integration?

No. Updating the role permission and selecting **Sync Now** is typically sufficient.
