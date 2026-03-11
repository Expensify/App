---
title: DESK15 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK15 sync error in QuickBooks Desktop by downloading and sharing Web Connector logs for review.
keywords: DESK15, QuickBooks Desktop sync error, could not execute request, Web Connector log file, QBWC error log, Expensify QuickBooks Desktop connection issue, Workspace Admin, accounting sync error
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK15 sync error by retrieving Web Connector logs. Does not cover QuickBooks Online errors.
---

# DESK15 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK15: Could not execute QuickBooks Desktop request.

This means QuickBooks Web Connector was unable to process a request from Expensify, typically due to a connection or configuration issue.

---

## Why the DESK15 Sync Error Happens in QuickBooks Desktop

The DESK15 error occurs when:

- There is a communication issue between Expensify and QuickBooks Desktop.
- QuickBooks Web Connector encounters an internal processing error.
- The company file is not responding as expected.
- Permission or hosting restrictions block the request.

Further troubleshooting requires reviewing the QuickBooks Web Connector log file.

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
   - Any recent changes made to QuickBooks or the server environment.

Concierge will review the log file to identify the root cause and provide next steps.

---

# FAQ

## Can I Fix DESK15 Without the Log File?

In most cases, no. The log file is required to determine the specific cause of the failure.

## Does DESK15 Mean My Data Is Corrupted?

No. This error indicates a failed request, not data loss. Your data remains intact in both Expensify and QuickBooks Desktop.
