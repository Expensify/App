---
title: XERO68 Export Error in Xero Integration
description: Learn what the XERO68 export error means and how to enable additional currencies in Xero before retrying your export.
keywords: XERO68, Xero currency not enabled, add currency Xero, multi-currency Xero setup, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO68 export error caused by missing or disabled currencies in Xero. Does not cover authentication or chart of accounts issues.
---

# XERO68 Export Error in Xero Integration

If you see the error:

XERO68 Export Error: Currency not set up or enabled in Xero. Please add the currency in Xero, and try exporting again.

This means the report currency used in the Workspace is not enabled in Xero.

Xero must have the currency added before transactions can be exported.

---

## Why the XERO68 Export Error Happens in Xero

The XERO68 error typically indicates:

- An expense or report is in a currency that has not been added in Xero.
- Multi-currency is not enabled in the Xero organization.
- Xero does not recognize the currency during export.

If the currency is not enabled, Xero blocks the transaction.

This is a currency configuration issue in Xero, not an authentication or chart of accounts error.

---

## How to Fix the XERO68 Export Error

Follow the steps below to enable the required currency.

### Add the Currency in Xero

1. Log in to Xero.
2. Go to **Settings > General Settings > Currencies**.
3. Click **Add Currency**.
4. Select the required currency.
5. Click **Save**.

Note: Adding additional currencies requires a Xero plan that supports multi-currency.

### Sync the Workspace in Expensify

After adding the currency:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the currency is enabled in Xero, the export should complete successfully.

---

# FAQ

## Does the XERO68 Export Error Affect Only Certain Reports?

Yes. It affects reports that use a currency not yet enabled in Xero.

## Do I Need Xero Admin Access to Add Currencies?

You need sufficient permissions in Xero to enable additional currencies.

## Do I Need to Reconnect the Integration?

No. Enabling the currency and selecting **Sync Now** is typically sufficient.
