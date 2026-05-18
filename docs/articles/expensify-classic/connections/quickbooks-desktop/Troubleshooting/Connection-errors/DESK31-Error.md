---
title: DESK31 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK31 error in QuickBooks Desktop when the connection to the company file cannot be completed.
keywords: DESK31, QuickBooks Desktop connection error, connection could not be completed, Web Connector log file, QBWC error, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK31 error by retrieving Web Connector logs. Does not cover QuickBooks Online errors.
---

# DESK31 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK31: The connection to QuickBooks Desktop could not be completed.

This means QuickBooks Web Connector was unable to establish a connection between Expensify and the QuickBooks Desktop company file.

---

## Why the DESK31 Error Happens in QuickBooks Desktop

The DESK31 error occurs when:

- There is a communication issue between Expensify and QuickBooks Desktop.
- QuickBooks Web Connector encounters an internal error.
- The company file is not accessible.
- Server, hosting, or permission issues interrupt the connection.

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
   - Any recent changes made to QuickBooks Desktop or the server environment.

Concierge will review the log file to determine the root cause and provide next steps.

---

# FAQ

## Can I Fix DESK31 Without the Log File?

In most cases, no. The log file is required to identify the specific cause of the connection failure.

## Does DESK31 Mean My Data Is Lost?

No. This error indicates a failed connection attempt. Your data remains intact in both Expensify and QuickBooks Desktop.
