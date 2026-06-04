---
title: NS0085 Export Error in NetSuite Integration
description: Learn how to fix the NS0085 export error in NetSuite when the Exchange Rate field is not visible on the preferred transaction form.
keywords: NS0085, NetSuite exchange rate permission error, cannot set exchange rate NetSuite, exchange rate field not visible NetSuite, NetSuite transaction form visibility, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0085 export error caused by the Exchange Rate field not being visible on the preferred NetSuite form. Does not cover other NetSuite error codes.
---

# NS0085 Export Error in NetSuite Integration

If you see the error:

NS0085: Expenses do not have appropriate permissions for setting an exchange rate in NetSuite.

This means the **Exchange Rate** field is not visible on the preferred transaction form in NetSuite.

---

## Why the NS0085 Export Error Happens in NetSuite

The NS0085 error occurs when:

- The **Exchange Rate** field is hidden on the preferred export form.
- The form does not allow the integration to set the exchange rate.
- Multi-currency is enabled and the form restricts exchange rate visibility.

Expensify must be able to write to the Exchange Rate field when exporting transactions with foreign currency.

---

## How to Fix the NS0085 Export Error

### Step One: Update the Preferred Transaction Form in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the form marked as **Preferred** for the export type (Vendor Bill, Journal Entry, etc.).
6. Locate the **Exchange Rate** field.
7. Ensure the field is marked as **Show**.
8. Save the form.

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

Once the Exchange Rate field is visible on the preferred form, the export should complete successfully.

---

# FAQ

## Does NS0085 Only Occur With Multi-Currency Enabled?

Yes. This error typically appears when exporting foreign currency transactions and the Exchange Rate field is hidden.

## Do I Need to Reconnect NetSuite?

No. Updating the form visibility and running **Sync** is usually sufficient.
