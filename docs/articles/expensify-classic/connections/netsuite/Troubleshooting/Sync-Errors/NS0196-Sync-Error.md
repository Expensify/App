---
title: NS0196 Sync Error in NetSuite Integration
description: Learn how to fix the NS0196 sync error in NetSuite when expense reports cannot be marked as paid.
keywords: NS0196, NetSuite could not mark expense reports as paid, bill payment form NetSuite, default department employee NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0196 sync error caused by configuration or required field issues preventing expense reports from being marked as paid. Does not cover other NetSuite error codes.
---

# NS0196 Sync Error in NetSuite Integration

If you see the error:

NS0196: Could not mark expense reports as paid.

This means NetSuite could not complete the bill payment process due to missing or misconfigured required fields.

---

## Why the NS0196 Sync Error Happens in NetSuite

The NS0196 error occurs when:

- Required fields on the Bill Payment form are hidden or mandatory.
- The Workspace accounting configuration references an invalid account.
- The employee record has a default department that conflicts with payment settings.
- NetSuite blocks the transaction due to form or role configuration.

NetSuite must allow the Bill Payment transaction to complete before the expense report can be marked as paid.

---

# How to Fix the NS0196 Sync Error

## Option One: Confirm Expensify Accounting Configuration

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.
7. Confirm the correct payment account is selected.
8. Click **Save** if changes are made.

Retry the sync.

---

## Option Two: Confirm Bill Payment Form Settings in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the preferred **Bill Payment** form.
6. Confirm that all relevant required fields are:
   - Visible.
   - Not blocking payment processing.
7. Save the form.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry marking the expense report as paid.

---

## Option Three: Confirm Employee Default Department

1. In NetSuite, go to **Lists**.
2. Select **Employees**.
3. Open the employee record associated with the report submitter.
4. Check if a default **Department** is listed.
5. If present, remove the default Department.
6. Save the employee record.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry the export or payment sync.

---

# FAQ

## Does NS0196 Mean the Payment Failed in NetSuite?

Yes. The expense report could not be marked as paid due to a configuration or required field issue in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating form settings, role permissions, or employee defaults and running **Sync** is typically sufficient.
