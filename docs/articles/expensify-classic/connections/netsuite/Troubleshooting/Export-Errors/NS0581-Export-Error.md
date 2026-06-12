---
title: NS0581 Export Error in NetSuite Integration
description: Learn how to fix the NS0581 export error in NetSuite when an invoice item is missing or the report type is incorrect.
keywords: NS0581, NetSuite invoice item not found, non-inventory sales item NetSuite, invoice vs expense report export, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0581 export error caused by missing invoice items or incorrect report type selection. Does not cover other NetSuite error codes.
---

# NS0581 Export Error in NetSuite Integration

If you see the error:

NS0581: NetSuite couldn’t find an invoice item. Please create a 'Non-Inventory Sales Item' for Expensify invoices and confirm this export is intended to be an invoice (not an expense report).

This means NetSuite cannot find a valid invoice item for the transaction being exported.

---

## Why the NS0581 Export Error Happens in NetSuite

The NS0581 error occurs when:

- The export type is set to **Invoice**.
- No **Non-Inventory Sales Item** exists in NetSuite for Expensify invoices.
- The report is intended to be an expense report but is configured as an invoice.
- The integration is attempting to create an invoice without a valid item.

NetSuite requires a valid item when creating invoices.

---

# How to Fix NS0581 for Invoice Exports

If the export is intended to be an **Invoice**:

### Step One: Create a Non-Inventory Sales Item in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Navigate to **Lists** > **Accounting** > **Items**.
3. Click **New**.
4. Select **Non-Inventory Item for Sale**.
5. Configure the item for use with Expensify invoices.
6. Save the item.

---

### Step Two: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

---

# How to Fix NS0581 for Expense Report Exports

If the export is meant to be an **Expense Report**:

### Step One: Change the Report Type in Expensify

1. Open the report in Expensify.
2. Unapprove the report if needed.
3. Click **Details**.
4. Change the **Type** field to **Expense Report**.
5. Save changes.
6. Resubmit the report.

---

### Step Two: Approve and Export

1. Once fully approved, retry exporting the report.

---

# FAQ

## Does NS0581 Mean My Integration Is Broken?

No. This error indicates either a missing invoice item or an incorrect report type.

## Do I Need to Reconnect NetSuite?

No. Creating the required item or correcting the report type and running **Sync** is usually sufficient.
