---
title: NS0728 Export Error in NetSuite Integration
description: Learn what the NS0728 export error means and how to ensure customers are associated with the correct subsidiary in NetSuite before exporting.
keywords: NS0728, NetSuite invalid customer reference key, customer not associated with subsidiary NetSuite, cross-subsidiary customer NetSuite, enable Intercompany Time and Expense NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0728 export error caused by customer and subsidiary mismatches in NetSuite. Does not cover employee subsidiary mismatches or vendor configuration issues.
---

# NS0728 Export Error in NetSuite Integration

If you see the error:

NS0728 Export Error: Invalid customer reference key [XXX] for subsidiary [YYY]. Please confirm customer is listed under subsidiary in NetSuite.

This means the selected customer is not associated with the connected subsidiary in NetSuite.

NetSuite requires customers to be linked to the correct subsidiary for exports to succeed.

---

## Why the NS0728 Export Error Happens in NetSuite

The NS0728 error typically occurs when:

- A **Customer** selected in the Workspace is not associated with the subsidiary connected to the Workspace.
- The customer is inactive under that subsidiary.
- The customer exists in NetSuite but is assigned to a different subsidiary.
- Cross-subsidiary customer access is not enabled.

Expensify does not support creating cross-subsidiary customers during export. The customer must already exist under the connected subsidiary in NetSuite.

This is a customer-to-subsidiary configuration issue, not an employee subsidiary mismatch or vendor configuration issue.

---

## How to Fix the NS0728 Export Error

Follow the steps below to confirm the correct subsidiary configuration.

---

## Enable Show Internal IDs in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Home > Set Preferences**.
3. Enable **Show Internal IDs**.
4. Click **Save**.

This allows you to confirm the correct customer and subsidiary IDs referenced in the error.

---

## Enable Intercompany Time and Expense (If Needed)

If you use OneWorld and cross-subsidiary transactions:

1. Go to **Setup > Company > Enable Features**.
2. Select the **Advanced Features** tab.
3. Enable **Intercompany Time and Expense**.
4. Click **Save**.

---

## Confirm the Customer Is Associated With the Correct Subsidiary

1. Locate the customer referenced in the error.
2. Open the customer record.
3. Confirm the customer:
   - Is **Active**.
   - Is associated with the subsidiary connected to the Workspace.
4. If the customer is not associated with the correct subsidiary:
   - Add the correct subsidiary to the customer record.
5. Click **Save**.

---

## Sync the Workspace and Retry the Export

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

Then retry exporting the report.

If the customer is active and associated with the correct subsidiary, the export should complete successfully.

---

# FAQ

## Does the NS0728 Export Error Affect Cross-Subsidiary Customers?

Yes. The customer must be active under the connected subsidiary. Cross-subsidiary customer creation during export is not supported.

## Do I Need NetSuite Admin Access to Fix the NS0728 Export Error?

Yes. Updating customer-subsidiary associations and enabling advanced features requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the customer-subsidiary association and selecting **Sync Now** is typically sufficient.
