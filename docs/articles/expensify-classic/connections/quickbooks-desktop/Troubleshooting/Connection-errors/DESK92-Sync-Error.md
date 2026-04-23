---
title: DESK92 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK92 sync error in QuickBooks Desktop when data cannot be retrieved during sync.
keywords: DESK92, QuickBooks Desktop sync error, could not retrieve data from QuickBooks, Web Connector log file, QBWC error log, Expensify QuickBooks Desktop connection issue, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK92 sync error by retrieving Web Connector logs. Does not cover QuickBooks Online errors.
---

# DESK92 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK92: Could not retrieve data from QuickBooks Desktop.

This means QuickBooks Web Connector was unable to retrieve data from the QuickBooks Desktop company file during a sync.

---

## Why the DESK92 Sync Error Happens in QuickBooks Desktop

The DESK92 error occurs when:

- There is a communication issue between Expensify and QuickBooks Desktop.
- QuickBooks Web Connector encounters an internal processing error.
- The company file is not responding correctly.
- Server, hosting, or permission issues interrupt the data request.

Additional troubleshooting requires reviewing the QuickBooks Web Connector log file.

---

## How to Download the QuickBooks Web Connector Log File

### If QuickBooks Is Installed Locally

1. Open **QuickBooks Web Connector**.
2. Click **View logs**.
3. Save the downloaded log file to your computer.

### If QuickBooks Is Hosted on a Server

1. Contact your hosting provider.
2. Ask them to open **QuickBooks Web Connector**.
3. Have them click **View logs**.
4. Request a copy of the downloaded log file.

---

## What to Do Next

After downloading the log file:

1. Share the log file with **Concierge**.
2. Include:
   - The Workspace name.
   - The approximate time the error occurred.
   - Any recent changes made to QuickBooks Desktop or the server.

Concierge will review the log file to determine the root cause and provide next steps.

---

# FAQ

## Can I Fix DESK92 Without the Log File?

In most cases, no. The log file is required to identify the specific cause of the data retrieval failure.

## Does DESK92 Mean My Data Is Lost?

No. This error indicates a failed retrieval attempt. Your data remains intact in both Expensify and QuickBooks Desktop.
