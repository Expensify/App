---
title: NS0068 Export Error in NetSuite Integration
description: Learn how to fix the NS0068 export error in NetSuite when the Created From field is not visible on the preferred transaction form.
keywords: NS0068, NetSuite Created From field not visible, permission to set value Created From, NetSuite transaction form visibility, Expensify Card journal entry error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0068 export error caused by the Created From field not being visible on the preferred NetSuite form. Does not cover other NetSuite error codes.
---

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068: You do not have permission to set value for element — 'Created From'.

This means the **Created From** field is not visible on the preferred transaction form in NetSuite.

---

## Why the NS0068 Export Error Happens in NetSuite

The NS0068 error occurs when:

- The **Created From** field is hidden on the preferred export form.
- The form does not allow the integration to populate the Created From field.
- Expensify Card transactions are exported as journal entries and the Journal Entry form does not show the Created From field.

Expensify must be able to write to the Created From field during export.

---

## How to Fix the NS0068 Export Error

### If Exporting Vendor Bills or Standard Transactions

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the form marked as **Preferred** for the export type.
6. Locate the **Created From** field.
7. Ensure the field is marked as **Show**.
8. Save the form.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

### If Exporting Expensify Card Transactions as Journal Entries

1. Log in to **NetSuite**.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the preferred **Journal Entry** form.
6. Go to **Screen Fields**.
7. Open the **Main** tab.
8. Ensure the **Created From** field is marked as **Show**.
9. Save the form.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

# FAQ

## Does NS0068 Mean My Integration Is Broken?

No. This error is caused by form visibility settings in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the form settings and running **Sync** is typically sufficient.
