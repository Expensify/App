---
title: NS0012 Export Error in NetSuite Integration
description: Learn how to fix the NS0012 export error in NetSuite when the report currency does not exist in the selected subsidiary.
keywords: NS0012, NetSuite currency does not exist, report currency not available subsidiary, enable multiple currencies NetSuite, OneWorld currency error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0012 export error caused by missing subsidiary currencies. Does not cover other NetSuite error codes.
---

# NS0012 Export Error in NetSuite Integration

If you see the error:

NS0012: Currency does not exist in NetSuite.

This means the report currency in Expensify is not available in the selected NetSuite subsidiary.

---

## Why the NS0012 Export Error Happens in NetSuite

The NS0012 error occurs when:

- The report currency in Expensify is not enabled in NetSuite.
- The selected subsidiary does not support the report currency.
- Multi-currency is not enabled in NetSuite (for Non-OneWorld accounts).
- The Workspace has not been synced after currency changes.

NetSuite only allows transactions in currencies that are enabled for the subsidiary.

---

## How to Fix the NS0012 Export Error

### Step One: Confirm Available Currencies in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Open the **Subsidiary** record.
3. Review the currencies enabled for that subsidiary.
4. Confirm the report currency is listed.

If the currency is missing, enable it in NetSuite.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

# Additional Steps for Non-OneWorld Users

Non-OneWorld NetSuite instances only support:

- EUR  
- GBP  
- USD  
- CAD  

If you need additional currencies:

1. In NetSuite, go to **Setup**.
2. Click **Enable Features**.
3. Enable **Multiple Currencies**.
4. Use the global search bar to add the required currency.
5. Save your changes.

Then:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

# FAQ

## Does NS0012 Mean My Integration Is Broken?

No. This error indicates the report currency is not enabled in NetSuite.

## Do I Need to Reconnect NetSuite?

Not usually. Enabling the currency and running **Sync** in Expensify typically resolves the issue.
