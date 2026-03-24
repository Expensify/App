---
title: NS0091 Export Error in NetSuite Integration
description: Learn what the NS0091 export error means and how to enable tax import in the Workspace to restore NetSuite exports.
keywords: NS0091, default Tax ID not found, enable tax import Workspace, NetSuite Tax ID error, tax configuration Workspace, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0091 export error caused by missing default Tax ID configuration in the Workspace. Does not cover tax group mapping errors in NetSuite.
---

# NS0091 Export Error in NetSuite Integration

If you see the error:

NS0091 Export Error: Could not find default Tax ID in Expensify. Please enable tax for import within Expensify configurations.

This means tax import is not enabled in your Workspace.

Without tax enabled, the Workspace cannot reference a default **Tax ID** during export to NetSuite.

---

## Why the NS0091 Export Error Happens in NetSuite

The NS0091 error typically occurs when:

- Tax import is disabled in **Settings > Workspaces > Accounting > Coding**.
- The export requires a default **Tax ID**.
- NetSuite expects tax data but no tax configuration exists in the Workspace.

If tax is not enabled, the Workspace cannot apply or reference tax codes during export.

This is a tax configuration issue in the Workspace, not a tax group mapping issue in NetSuite.

---

## How to Fix the NS0091 Export Error

Follow the steps below to enable tax import and retry the export.

---

## Enable Tax Import in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Coding**.
5. Enable **Tax** to import from NetSuite.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Coding**.
5. Enable **Tax**.
6. Tap **Save**.

---

## Sync the Workspace and Retry the Export

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.
6. Retry exporting the report.

If tax import is enabled, the export should complete successfully.

---

# FAQ

## Does the NS0091 Export Error Affect All Reports?

It affects reports that require a default Tax ID when tax import is not enabled.

## Do I Need NetSuite Admin Access to Fix the NS0091 Export Error?

No. You only need Workspace Admin access to enable tax import.

## Do I Need to Reconnect the Integration?

No. Enabling tax and selecting **Sync Now** is typically sufficient.
