---
title: NS0059 Export Error in NetSuite Integration
description: Learn what the NS0059 export error means and how to set a default corporate card account at the subsidiary level in NetSuite before exporting.
keywords: NS0059, NetSuite corporate card account error, default corporate card account NetSuite, subsidiary corporate card setting NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0059 export error caused by missing default corporate card account settings at the subsidiary level. Does not cover company card mapping in Domain settings.
---

# NS0059 Export Error in NetSuite Integration

If you see the error:

NS0059 Export Error: No credit card account is set for corporate card expenses. Please select a default corporate card account in NetSuite under 'Subsidiaries'.

This means a default corporate card account has not been configured in NetSuite.

NetSuite requires a default corporate card account at the subsidiary level to export corporate card expenses.

---

## Why the NS0059 Export Error Happens in NetSuite

The NS0059 error typically occurs when:

- Corporate card expenses are being exported.
- No **Default Account for Corporate Card Expenses** is set for the subsidiary in NetSuite.
- NetSuite cannot determine which credit card account to use for the transaction.

Without this setting, NetSuite blocks the export.

This is a subsidiary-level configuration issue in NetSuite, not a company card mapping issue in Domain settings.

---

## How to Fix the NS0059 Export Error

Follow the steps below to configure the default corporate card account.

---

## Set the Default Corporate Card Account in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Relationships > Subsidiaries** (or search for **Subsidiaries**).
3. Select the relevant subsidiary used for the export.
4. Locate the field labeled **Default Account for Corporate Card Expenses**.
5. Select the appropriate credit card account.
6. Click **Save**.

Confirm the correct credit card account is selected before proceeding.

---

## Sync the Workspace in Expensify

After updating the subsidiary settings:

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

If a default corporate card account is configured at the subsidiary level, the export should complete successfully.

---

# FAQ

## Does the NS0059 Export Error Affect Only Corporate Card Expenses?

Yes. This error applies specifically to exports that include corporate card transactions.

## Do I Need NetSuite Admin Access to Fix the NS0059 Export Error?

Yes. Updating subsidiary account settings requires appropriate NetSuite administrator permissions.

## Do I Need to Update Company Card Mapping in Domain Settings?

No. This error is caused by a missing default corporate card account in NetSuite, not by company card mapping in Domain settings.
