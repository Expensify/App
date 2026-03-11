---
title: NS0037 Export Error in NetSuite Integration
description: Learn how to fix the NS0037 export error in NetSuite when the Receipt URL field is not visible on the preferred transaction form.
keywords: NS0037, NetSuite receipt URL field not visible, permission to set value receipt URL, NetSuite transaction form visibility, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0037 export error caused by the Receipt URL field not being visible on the preferred NetSuite form. Does not cover other NetSuite error codes.
---

# NS0037 Export Error in NetSuite Integration

If you see the error:

NS0037: You do not have permission to set value for element — 'Receipt URL'. Please make sure the receipt URL field is visible in NetSuite.

This means the **Receipt URL** field is not visible on the preferred transaction form in NetSuite.

---

## Why the NS0037 Export Error Happens in NetSuite

The NS0037 error occurs when:

- The **Receipt URL** field is hidden on the preferred transaction form.
- The form does not allow the integration to populate the Receipt URL field.
- Form configuration overrides integration permissions.

Expensify must be able to write to the Receipt URL field during export.

---

## How to Fix the NS0037 Export Error

### Step One: Update the Preferred Transaction Form in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the form marked as **Preferred** for the export type (Vendor Bill, Journal Entry, etc.).
6. Locate the **Receipt URL** field.
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

Once the Receipt URL field is visible on the preferred form, the export should complete successfully.

---

# FAQ

## Does NS0037 Mean My Integration Is Broken?

No. This error is caused by form visibility settings in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the form visibility and running **Sync** is typically sufficient.
