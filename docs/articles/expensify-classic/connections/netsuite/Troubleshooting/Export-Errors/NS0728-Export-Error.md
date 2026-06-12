---
title: NS0728 Export Error in NetSuite Integration
description: Learn how to fix the NS0728 export error in NetSuite when a customer is not associated with the selected subsidiary.
keywords: NS0728, NetSuite invalid customer reference key, customer not listed under subsidiary, cross-subsidiary customer NetSuite, enable intercompany time and expense NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0728 export error caused by customer and subsidiary mismatches. Does not cover other NetSuite error codes.
---

# NS0728 Export Error in NetSuite Integration

If you see the error:

NS0728: Invalid customer reference key [XXX] for subsidiary [YYY]. Please confirm customer is listed under subsidiary in NetSuite.

This means the customer selected in Expensify is not associated with the subsidiary connected in NetSuite.

---

## Why the NS0728 Export Error Happens in NetSuite

The NS0728 error occurs when:

- The selected customer exists in NetSuite but is assigned to a different subsidiary.
- The customer is not active under the connected subsidiary.
- Cross-subsidiary customer creation is expected but not supported.
- Intercompany settings are not enabled in NetSuite.

Expensify does not support cross-subsidiary customer creation. The selected customer must belong to the same subsidiary configured in the Workspace.

---

## How to Fix the NS0728 Export Error

### Step One: Enable Internal IDs in NetSuite

1. Log in to **NetSuite**.
2. Go to **Home**.
3. Click **Set Preferences**.
4. Enable **Show Internal IDs**.
5. Save your changes.

This helps identify the exact customer referenced in the error.

---

### Step Two: Confirm Intercompany Features Are Enabled (If Applicable)

1. In NetSuite, go to **Setup**.
2. Select **Company**.
3. Click **Enable Features**.
4. Open the **Advanced Features** tab.
5. Enable **Intercompany Time and Expense**.
6. Save changes.

---

### Step Three: Confirm Customer Is Assigned to the Correct Subsidiary

1. Go to **Lists** > **Relationships** > **Customers**.
2. Open the customer referenced in the error.
3. Confirm:
   - The customer is active.
   - The customer is assigned to the same subsidiary connected in Expensify.

If the customer is not assigned to the correct subsidiary:

- Update the customer record to include the appropriate subsidiary, or  
- Select a different customer in Expensify that belongs to the connected subsidiary.

---

### Step Four: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Five: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct customer is selected.
3. Retry exporting to NetSuite.

Once the customer is properly assigned to the connected subsidiary, the export should complete successfully.

---

# FAQ

## Does NS0728 Mean the Customer Was Deleted?

Not necessarily. The customer may exist but is assigned to a different subsidiary.

## Can Expensify Create Customers Across Subsidiaries?

No. Expensify does not support cross-subsidiary customer creation. The customer must already exist under the connected subsidiary.
