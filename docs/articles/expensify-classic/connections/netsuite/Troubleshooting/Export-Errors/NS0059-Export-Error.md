---
title: NS0059 Export Error in NetSuite Integration
description: Learn how to fix the NS0059 export error in NetSuite when no default corporate card account is set for a subsidiary.
keywords: NS0059, NetSuite no credit card account set, default corporate card account NetSuite, subsidiary corporate card settings, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0059 export error caused by missing default corporate card account settings at the subsidiary level. Does not cover other NetSuite error codes.
---

# NS0059 Export Error in NetSuite Integration

If you see the error:

NS0059: No credit card account is set for corporate card expenses. Please select a default corporate card account in NetSuite under 'Subsidiaries'.

This means a default corporate card account has not been configured for the subsidiary in NetSuite.

---

## Why the NS0059 Export Error Happens in NetSuite

The NS0059 error occurs when:

- Corporate card expenses are being exported from Expensify.
- No default corporate card account is set at the subsidiary level in NetSuite.
- NetSuite does not know which account to use for the transaction.

Each subsidiary must have a default corporate card account configured to process corporate card transactions.

---

## How to Fix the NS0059 Export Error

### Step One: Set the Default Corporate Card Account in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Navigate to **Setup**.
3. Select **Company**.
4. Click **Subsidiaries**.
5. Open the relevant subsidiary.
6. Locate the field for **Default Account for Corporate Card Expenses**.
7. Select the appropriate credit card account.
8. Save the changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the default corporate card account is set at the subsidiary level, the export should complete successfully.

---

# FAQ

## Does NS0059 Only Apply to Corporate Card Expenses?

Yes. This error specifically affects exports of corporate card transactions.

## Do I Need to Reconnect NetSuite?

No. Setting the default corporate card account and running **Sync** is usually sufficient.
