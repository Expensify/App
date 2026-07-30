---
title: NS0748 Export Error in NetSuite Integration
description: Learn what the NS0748 export error means and how to disable the Require Rate setting on NetSuite expense categories before exporting.
keywords: NS0748, NetSuite expense category Require Rate error, Rate is Required NetSuite expense category, expense category rate required NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0748 export error caused by the Require Rate setting on NetSuite expense categories. Does not cover tax configuration or subsidiary mapping issues.
---

# NS0748 Export Error in NetSuite Integration

If you see the error:

NS0748 Export Error: The selected expense category requires a rate in NetSuite. Uncheck 'Require Rate' on the expense category in NetSuite to continue.

This means the expense category in NetSuite is configured to require a rate.

The Workspace does not send a rate value during export. If **Rate is Required** is enabled, NetSuite blocks the transaction.

---

## Why the NS0748 Export Error Happens in NetSuite

The NS0748 error typically occurs when:

- The **Rate is Required** option is enabled on an expense category in NetSuite.
- NetSuite expects a rate value for that category.
- No rate is provided during export.

If **Rate is Required** is checked, NetSuite requires a rate value for the expense category. Since the Workspace does not provide one, the export fails.

This is an expense category configuration issue, not a tax configuration or subsidiary mapping issue.

---

## How to Fix the NS0748 Export Error

Follow the steps below to disable the Require Rate setting.

---

## Disable Rate Is Required on the Expense Category in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Accounting > Expense Categories**.
3. Locate the expense category referenced in the error.
4. Click **Edit**.
5. Uncheck **Rate is Required**.
6. Click **Save**.

Confirm the setting is saved before proceeding.

---

## Sync the Workspace and Retry the Export

After updating the expense category:

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

Then retry exporting the report.

If **Rate is Required** is disabled, the export should complete successfully.

---

# FAQ

## Does the NS0748 Export Error Affect Only One Category?

Yes. The error applies to the specific expense category where **Rate is Required** is enabled.

## Do I Need NetSuite Admin Access to Fix the NS0748 Export Error?

Yes. Updating expense category settings in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Disabling **Rate is Required** and selecting **Sync Now** is typically sufficient.
