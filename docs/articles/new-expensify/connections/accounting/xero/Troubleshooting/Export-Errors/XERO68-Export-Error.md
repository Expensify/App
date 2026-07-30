---
title: XERO68 Export Error in Xero Integration
description: Learn what the XERO68 export error means and how to enable additional currencies in Xero before exporting from New Expensify.
keywords: XERO68, Xero currency not enabled, add currency Xero, multi-currency Xero setup, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO68 export error related to missing or disabled currencies in Xero. Does not cover authentication or chart of accounts issues.
---

# XERO68 Export Error in Xero Integration

If you see the error:

XERO68 Export Error: Currency not set up or enabled in Xero. Please add the currency in Xero, and try exporting again.

This means the report currency used in the Workspace is not enabled in Xero.

Xero must have the currency added before transactions can be exported.

---

## Why the XERO68 Export Error Happens in Xero

The XERO68 error typically occurs when:

- An expense or report uses a currency that has not been added in Xero.
- Multi-currency is not enabled in the Xero organization.
- Xero does not recognize the currency during export.

If the currency is not enabled, Xero blocks the transaction.

This is a currency configuration issue in Xero, not a connection issue.

---

# How to Fix the XERO68 Export Error

Follow the steps below to enable the required currency and retry the export.

---

## Add the Currency in Xero

1. Log in to Xero with appropriate admin permissions.
2. Go to **Settings > General Settings > Currencies**.
3. Click **Add Currency**.
4. Select the required currency.
5. Click **Save**.

Note: Enabling additional currencies requires a Xero subscription plan that supports multi-currency.

---

## Run Sync in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the currency is enabled in Xero, the export should complete successfully.

---

# FAQ

## Does the XERO68 Error Affect Only Certain Reports?

Yes. It affects reports that use a currency not yet enabled in Xero.

## Do I Need Xero Admin Access to Add Currencies?

Yes. Enabling additional currencies in Xero requires appropriate admin permissions and a subscription plan that supports multi-currency.
