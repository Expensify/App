---
title: NS0079 Export Error in NetSuite Integration
description: Learn how to fix the NS0079 export error in NetSuite when transactions fall outside an open posting period.
keywords: NS0079, NetSuite transaction date outside posting period, allow transaction date outside posting period warn, export to next open period Expensify, closed accounting period NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0079 export error caused by closed posting periods. Does not cover other NetSuite error codes.
---

# NS0079 Export Error in NetSuite Integration

If you see the error:

NS0079: The transaction date is outside the posting period. In NetSuite, set 'Allow Transaction Date Outside of the Posting Period' to 'Warn,' then enable 'Export to Next Open Period' in Expensify and sync.

This means the report is attempting to export into a closed posting period in NetSuite.

---

## Why the NS0079 Export Error Happens in NetSuite

The NS0079 error occurs when:

- The transaction date falls within a closed accounting period.
- NetSuite is configured to block transactions outside open posting periods.
- The Workspace is not set to export transactions to the next open period.

NetSuite prevents transactions from being created in closed periods unless configured otherwise.

---

## How to Fix the NS0079 Export Error

### Step One: Update Posting Period Preferences in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Accounting**.
4. Click **Accounting Preferences**.
5. Locate **Allow Transaction Date Outside of the Posting Period**.
6. Set it to **Warn**.
7. Save your changes.

---

### Step Two: Enable Export to Next Open Period in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.
7. Enable **Export to Next Open Period**.
8. Click **Save**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

With these settings enabled, Expensify will automatically export the transaction to the next open posting period.

---

# FAQ

## Can I Export Into a Closed Posting Period?

Not unless NetSuite is configured to allow it. Otherwise, the transaction must be moved to the next open period.

## Does NS0079 Mean My Integration Is Broken?

No. This error indicates the transaction date falls within a closed accounting period.
