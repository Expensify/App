---
title: INT088 Export Error in Sage Intacct Integration
description: Learn what the INT088 export error means in Sage Intacct and how to reopen the Cash Management subledger to complete your export.
keywords: INT088, Sage Intacct Cash Management subledger closed, Sage Intacct export error, open Cash Management subledger Intacct, close Cash Management subledger Intacct, Sync Now Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT088 export error caused by the Cash Management subledger being closed. Does not cover accounting period closures or permission configuration errors.
---

# INT088 Export Error in Sage Intacct Integration

If you see the error:

INT088 Export Error: Cash Management subledger is closed in Sage Intacct. Please open the subledger, export the report, then close the subledger again.

This means the **Cash Management subledger** in Sage Intacct is currently closed, preventing the export from completing.

When the subledger is closed, Sage Intacct blocks new transactions from being posted.

---

## Why the INT088 Export Error Happens in Sage Intacct

The INT088 error occurs when the Cash Management subledger is closed in Sage Intacct.

Since exporting a report creates a transaction in Cash Management, Sage Intacct blocks the export while the subledger is closed.

This is a subledger status issue, not an accounting period closure or permission configuration error.

---

## How to Fix the INT088 Export Error

You must temporarily open the Cash Management subledger in Sage Intacct, complete the export, and then close it again if needed.

### Open the Cash Management Subledger in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Applications > Cash Management > All > Subledger > Open**.
3. Open the Cash Management subledger.

### Sync the Workspace in Expensify

After opening the subledger:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

The export should complete successfully while the subledger is open.

### Close the Cash Management Subledger in Sage Intacct (Optional)

After the export is complete:

1. Log in to Sage Intacct.
2. Go to **Applications > Cash Management > All > Subledger > Close**.
3. Close the Cash Management subledger if required by your accounting process.

---

# FAQ

## Do I Need to Leave the Subledger Open Permanently?

No. You only need to open it long enough to complete the export. You can close it again afterward if required by your accounting process.

## Does This Error Mean the Integration Is Broken?

No. The integration is functioning correctly. The export fails only because Sage Intacct prevents transactions when the Cash Management subledger is closed.

## Do I Need Special Permissions to Open or Close the Subledger?

You need sufficient permissions in Sage Intacct to open or close subledgers.
