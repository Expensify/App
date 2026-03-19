---
title: NS0012 Export Error in NetSuite Integration
description: Learn what the NS0012 export error means and how to enable or sync currencies between the Workspace and NetSuite subsidiaries.
keywords: NS0012, NetSuite currency does not exist, currency not available in subsidiary NetSuite, enable Multiple Currencies NetSuite, OneWorld currency error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0012 export error caused by missing currencies in NetSuite subsidiaries. Does not cover role permissions or token authentication issues.
---

# NS0012 Export Error in NetSuite Integration

If you see the error:

NS0012 Export Error: Currency does not exist in NetSuite.

This means the currency used on the report in the Workspace is not available in the connected NetSuite subsidiary.

NetSuite must support the report currency for the export to succeed.

---

## Why the NS0012 Export Error Happens in NetSuite

The NS0012 error typically occurs when:

- The report currency is not enabled in the selected NetSuite subsidiary.
- The currency is not available in your NetSuite instance.
- Multi-currency is not enabled in NetSuite.
- The subsidiary does not support the transaction currency.

Exports will fail if NetSuite does not recognize the report currency.

This is a currency configuration issue in NetSuite, not a role permission or token authentication issue.

---

## How to Fix the NS0012 Export Error

Follow the steps below to confirm and enable the required currency.

### Confirm Available Currencies in NetSuite

1. Log in to NetSuite as an administrator.
2. Navigate to the subsidiary associated with the export.
3. Review which currencies are enabled for that subsidiary.
4. Confirm the report currency is listed and active.

If the required currency is not enabled:

- Enable or add the currency in NetSuite.
- Click **Save**.

### Sync the Workspace in Expensify

After updating currencies in NetSuite:

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

Retry exporting the report after the sync completes.

---

## Additional Steps for Non-OneWorld NetSuite Accounts

Non-OneWorld NetSuite instances support a limited number of currencies by default.

If your required currency is not available:

1. Log in to NetSuite.
2. Go to **Setup > Enable Features**.
3. Enable **Multiple Currencies**.
4. Save your changes.
5. Use the global search bar to add the required currency.
6. Save the currency configuration.

After enabling the currency:

1. Return to the Workspace.
2. Go to **Settings > Workspaces > Accounting**.
3. Click **Sync Now**.
4. Retry exporting the report.

---

# FAQ

## Does the NS0012 Export Error Affect All Subsidiaries?

No. It affects the specific subsidiary tied to the export. Each subsidiary must have the required currency enabled.

## Do I Need NetSuite Admin Access to Fix the NS0012 Export Error?

Yes. Enabling features and adding currencies in NetSuite requires administrator-level permissions.

## Do I Need to Reconnect the Integration?

No. Enabling the currency and selecting **Sync Now** is typically sufficient.
