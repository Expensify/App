---
title: NS0748 Export Error in NetSuite Integration
description: Learn how to fix the NS0748 export error in NetSuite when an expense category requires a rate.
keywords: NS0748, NetSuite require rate expense category, uncheck require rate NetSuite, expense category rate required error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0748 export error caused by the "Require Rate" setting on expense categories. Does not cover other NetSuite error codes.
---

# NS0748 Export Error in NetSuite Integration

If you see the error:

NS0748: The selected expense category requires a rate in NetSuite. Uncheck 'Require Rate' on the expense category in NetSuite to continue.

This means the expense category in NetSuite is configured to require a rate, but Expensify does not pass a rate value during export.

---

## Why the NS0748 Export Error Happens in NetSuite

The NS0748 error occurs when:

- The **Require Rate** option is enabled on an expense category in NetSuite.
- Expensify exports the expense without a rate value.
- NetSuite blocks the transaction because the rate field is mandatory.

Expensify does not support setting a rate on expense categories during export.

---

## How to Fix the NS0748 Export Error

### Step One: Update the Expense Category in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Accounting**.
4. Click **Expense Categories**.
5. Locate the expense category used on the report.
6. Click **Edit**.
7. Uncheck **Require Rate**.
8. Click **Save**.

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

Once the **Require Rate** setting is disabled, the export should complete successfully.

---

# FAQ

## Does NS0748 Mean the Category Is Invalid?

No. The category is valid, but the configuration requires a rate value that Expensify does not provide.

## Do I Need to Reconnect NetSuite?

No. Updating the expense category setting and running **Sync** is typically sufficient.
