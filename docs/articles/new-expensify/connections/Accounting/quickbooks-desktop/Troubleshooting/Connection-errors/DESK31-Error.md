---
title: DESK31 Error in QuickBooks Desktop Integration
description: Learn what the DESK31 error means and how to retrieve QuickBooks Web Connector logs for troubleshooting connection issues.
keywords: DESK31, QuickBooks Desktop connection could not be completed, QBWC log file, QuickBooks Web Connector error, Expensify QuickBooks Desktop sync issue, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK31 error related to connection issues and collecting Web Connector logs. Does not cover mapping or export configuration errors.
---

# DESK31 Error in QuickBooks Desktop Integration

If you see the error:

DESK31 Error: The connection to QuickBooks Desktop could not be completed.

This means there is a connection issue between the Workspace and QuickBooks Desktop.

The integration attempted to connect through QuickBooks Web Connector, but the request could not be completed.

---

## Why the DESK31 Error Happens in QuickBooks Desktop

The DESK31 error typically occurs when:

- QuickBooks Desktop is not responding.
- The QuickBooks company file is not open.
- QuickBooks Web Connector cannot execute the request.
- There is a permissions or environment-related issue.
- There is a hosting or server configuration problem.

This is a connection issue, not a report data issue.

---

# How to Fix the DESK31 Error

The next step is to retrieve the QuickBooks Web Connector log file for review.

---

## Download the QuickBooks Web Connector Log File

1. Open **QuickBooks Web Connector**.
2. Click **View Logs**.
3. This will download a log file to your computer.

If you are using a hosted QuickBooks server:

- Contact your hosting provider.
- Ask them to download the QuickBooks Web Connector log file for you.

---

## Share the Log File With Concierge

After downloading the log file:

1. Go to **Concierge** in the Workspace.
2. Attach the log file.
3. Reference the **DESK31 Error**.

Concierge will review the log file to determine the root cause and provide next steps.

---

# FAQ

## Can I Fix the DESK31 Error Without the Log File?

In most cases, no. The Web Connector log file is required to determine why the connection failed.

## Does This Mean My Integration Is Disconnected?

Not necessarily. It means QuickBooks could not complete the connection request. Reviewing the log file will help identify the exact cause.
