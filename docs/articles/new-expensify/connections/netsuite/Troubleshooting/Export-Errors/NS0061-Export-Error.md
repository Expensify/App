---
title: NS0061 Export Error in NetSuite Integration
description: Learn what the NS0061 export error means and how to enable tax import and apply tax codes when a NetSuite subsidiary requires tax tracking.
keywords: NS0061, NetSuite tax tracking required, enable tax import Workspace, apply tax codes expense report NetSuite, subsidiary requires tax NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0061 export error caused by required tax tracking in NetSuite subsidiaries. Does not cover tax group mapping errors.
---

# NS0061 Export Error in NetSuite Integration

If you see the error:

NS0061 Export Error: NetSuite subsidiary requires tax tracking. Please enable tax import within Expensify and apply tax codes to expenses.

This means the subsidiary in NetSuite requires tax tracking, but tax is not enabled or applied in your Workspace.

NetSuite will block exports if tax is required but not included on the transaction.

---

## Why the NS0061 Export Error Happens in NetSuite

The NS0061 error typically occurs when:

- You are exporting to a NetSuite subsidiary that requires tax tracking.
- Tax is not enabled in **Settings > Workspaces > Accounting > Coding**.
- Expenses do not have tax codes applied.
- NetSuite validation fails because required tax data is missing.

If tax is required by the subsidiary but not applied, NetSuite will reject the export.

This is a required tax tracking issue in NetSuite, not a tax group mapping error.

---

## How to Fix the NS0061 Export Error

Follow the steps below to enable tax and apply tax codes.

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

## Apply Tax Codes to All Expenses

1. Open the report.
2. Review each expense.
3. Apply the appropriate **Tax rate** to every expense.
4. Click **Save**.

Every expense must have a valid NetSuite tax code applied if the subsidiary requires tax tracking.

---

## Sync the Workspace and Retry the Export

On web:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

After syncing, retry exporting the report.

---

# FAQ

## Does the NS0061 Export Error Affect All Reports?

It affects reports exported to subsidiaries that require tax tracking when tax has not been enabled or applied.

## Do I Need NetSuite Admin Access to Fix the NS0061 Export Error?

No. You only need Workspace Admin access to enable tax import and apply tax codes.

## Do I Need to Reconnect the Integration?

No. Enabling tax and selecting **Sync Now** is typically sufficient.
