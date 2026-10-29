---
title: NS0085 Export Error in NetSuite Integration
description: Learn what the NS0085 export error means and how to make the Exchange Rate field visible in NetSuite to allow successful exports.
keywords: NS0085, NetSuite exchange rate permission error, Exchange Rate field not visible NetSuite, transaction form Exchange Rate NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0085 export error caused by the Exchange Rate field not being visible on NetSuite transaction forms. Does not cover currency enablement or subsidiary configuration issues.
---

# NS0085 Export Error in NetSuite Integration

If you see the error:

NS0085 Export Error: Expenses do not have appropriate permissions for setting an exchange rate in NetSuite.

This means the **Exchange Rate** field is not visible on the preferred export form in NetSuite.

The Workspace must be able to access and populate the Exchange Rate field during export.

---

## Why the NS0085 Export Error Happens in NetSuite

The NS0085 error typically occurs when:

- The **Exchange Rate** field is hidden on the NetSuite transaction form used for exports.
- The preferred transaction form does not allow the field to be displayed.
- NetSuite blocks the integration from setting the exchange rate value.

If the field is hidden, NetSuite prevents the integration from setting its value and the export fails.

This is a transaction form visibility issue, not a currency enablement or subsidiary configuration issue.

---

## How to Fix the NS0085 Export Error

Follow the steps below to make the Exchange Rate field visible.

---

## Make the Exchange Rate Field Visible in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Locate the transaction form marked as **Preferred** for your export type.
4. Click **Edit**.
5. Locate the **Exchange Rate** field.
6. Ensure the field is marked as **Show**.
7. Click **Save**.

Confirm the Exchange Rate field is visible on the preferred form before proceeding.

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

If the Exchange Rate field is visible on the preferred form, the export should complete successfully.

---

# FAQ

## Does the NS0085 Export Error Affect Multi-Currency Reports Only?

Yes. This error typically appears when exporting transactions that require an exchange rate.

## Do I Need NetSuite Admin Access to Fix the NS0085 Export Error?

Yes. Updating transaction form field visibility in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Making the Exchange Rate field visible and selecting **Sync Now** is typically sufficient.
