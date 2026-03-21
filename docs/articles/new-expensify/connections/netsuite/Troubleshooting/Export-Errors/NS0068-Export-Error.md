---
title: NS0068 Export Error in NetSuite Integration
description: Learn what the NS0068 export error means and how to make the Created From field visible on NetSuite transaction forms before exporting.
keywords: NS0068, NetSuite Created From field error, permission to set Created From NetSuite, transaction form visibility NetSuite, Expensify Card journal entry error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0068 export error caused by the Created From field not being visible on NetSuite transaction forms. Does not cover role permission or token configuration issues.
---

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068 Export Error: You do not have permission to set value for element — 'Created From'.

This means the **Created From** field is not visible on the preferred export form in NetSuite.

The Workspace must be able to access and populate the Created From field during export.

---

## Why the NS0068 Export Error Happens in NetSuite

The NS0068 error typically occurs when:

- The **Created From** field is hidden on the NetSuite transaction form used for exports.
- The preferred transaction form does not allow the field to be displayed.
- NetSuite blocks the integration from setting the field value because it is not visible.

If the field is hidden, NetSuite prevents the integration from setting its value and the export fails.

This is a transaction form visibility issue, not a role permission or token configuration issue.

---

## How to Fix the NS0068 Export Error

Follow the steps below to make the Created From field visible.

---

## Make the Created From Field Visible in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Locate the transaction form marked as **Preferred** for your export type.
4. Click **Edit**.
5. Locate the **Created From** field.
6. Ensure the field is marked as **Show**.
7. Click **Save**.

Confirm the field is visible on the preferred form before proceeding.

---

## Sync the Workspace in Expensify

After updating the form:

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

If the Created From field is visible on the preferred form, the export should complete successfully.

---

# Additional Steps for Expensify Card Journal Entries

If you are exporting **Expensify Card transactions as journal entries**, confirm the Created From field is visible on the journal entry form.

1. Go to **Customization > Forms > Transaction Forms**.
2. Click **Edit** next to the preferred journal entry form.
3. Go to **Screen Fields > Main**.
4. Confirm **Created From** is marked as **Show**.
5. Click **Save**.

Then return to the Workspace and select **Sync Now** before retrying the export.

---

# FAQ

## Does the NS0068 Export Error Affect All Export Types?

It affects exports using a transaction form where the Created From field is hidden.

## Do I Need NetSuite Admin Access to Fix the NS0068 Export Error?

Yes. Updating transaction form field visibility requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Making the Created From field visible and selecting **Sync Now** is typically sufficient.
