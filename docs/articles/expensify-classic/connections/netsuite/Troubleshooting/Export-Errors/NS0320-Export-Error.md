---
title: NS0320 Export Error in NetSuite Integration
description: Learn how to fix the NS0320 export error in NetSuite when a transaction falls within a closed accounting period.
keywords: NS0320, NetSuite closed accounting period error, transaction falls in closed period NetSuite, export to next open period Expensify, change export date Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0320 export error caused by closed accounting periods. Does not cover other NetSuite error codes.
---

# NS0320 Export Error in NetSuite Integration

If you see the error:

NS0320: The transaction falls in a closed accounting period. Please change date selection for export or enable 'Export to Next Open Period' in the Expensify configurations.

This means the report is attempting to export into a closed accounting period in NetSuite.

---

## Why the NS0320 Export Error Happens in NetSuite

The NS0320 error occurs when:

- The export date falls within a closed reporting or accounting period.
- NetSuite is configured to block transactions in closed periods.
- The Workspace export settings are using a date that falls in a closed period.

NetSuite does not allow transactions to post to closed accounting periods unless they are reopened.

---

## How to Fix the NS0320 Export Error

### Option One: Change the Export Date in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Export** tab.
7. Confirm the date selected for export:
   - **Submitted Date** (date the report was submitted)
   - **Exported Date** (date the report was exported to NetSuite)
   - **Date of Last Expense** (date of the most recent expense on the report)
8. Choose the date option that falls within an open accounting period.
9. Click **Save**.

Retry exporting the report.

---

### Option Two: Enable Export to Next Open Period

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.
7. Enable **Export to Next Open Period**.
8. Click **Save**.

This setting automatically exports transactions into the next available open accounting period.

Retry exporting the report.

---

### Option Three: Reopen the Accounting Period in NetSuite

If you prefer to keep the original transaction date:

1. Log in to **NetSuite** as an Administrator.
2. Navigate to the accounting period settings.
3. Reopen the closed accounting period.
4. Retry exporting the report from Expensify.

---

# FAQ

## Can I Export Into a Closed Period?

Not unless the period is reopened in NetSuite or you enable **Export to Next Open Period**.

## Does NS0320 Mean My Integration Is Broken?

No. This error simply indicates that the selected export date falls within a closed accounting period.
