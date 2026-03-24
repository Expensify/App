---
title: NS0037 Export Error in NetSuite Integration
description: Learn what the NS0037 export error means and how to make the Receipt URL field visible in NetSuite to allow successful exports.
keywords: NS0037, NetSuite Receipt URL error, Receipt URL field not visible NetSuite, permission to set Receipt URL, NetSuite transaction form field visibility, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0037 export error caused by the Receipt URL field not being visible on the preferred NetSuite transaction form. Does not cover role permission or token configuration issues.
---

# NS0037 Export Error in NetSuite Integration

If you see the error:

NS0037 Export Error: You do not have permission to set value for element — 'Receipt URL'. Please make sure the receipt URL field is visible in NetSuite.

This means the **Receipt URL** field is not visible on the preferred export form in NetSuite.

The Workspace must be able to access and populate the Receipt URL field during export.

---

## Why the NS0037 Export Error Happens in NetSuite

The NS0037 error typically occurs when:

- The **Receipt URL** field is hidden on the NetSuite transaction form used for exports.
- The preferred transaction form does not allow the field to be displayed.
- NetSuite blocks the integration from setting the field value because it is not visible.

If the field is hidden, NetSuite prevents the integration from setting its value and the export fails.

This is a transaction form configuration issue, not a role permission or token configuration issue.

---

## How to Fix the NS0037 Export Error

Follow the steps below to make the Receipt URL field visible.

---

## Make the Receipt URL Field Visible in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Locate the transaction form marked as **Preferred** for your export type.
4. Click **Edit**.
5. Navigate to the section that contains the **Receipt URL** field.
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

If the Receipt URL field is visible on the preferred form, the export should complete successfully.

---

# FAQ

## Does the NS0037 Export Error Affect All Exports?

It affects exports that attempt to populate the **Receipt URL** field on the selected NetSuite transaction form.

## Do I Need NetSuite Admin Access to Fix the NS0037 Export Error?

Yes. Updating transaction form field visibility in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Making the Receipt URL field visible and selecting **Sync Now** is typically sufficient.
