---
title: DESK15 Sync Error in QuickBooks Desktop Integration
description: Learn what the DESK15 sync error means and how to retrieve QuickBooks Web Connector logs for troubleshooting.
keywords: DESK15, QuickBooks Desktop request error, could not execute QuickBooks request, Web Connector log file, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK15 sync error related to connection issues and collecting Web Connector logs. Does not cover mapping or export configuration errors.
---

# DESK15 Sync Error in QuickBooks Desktop Integration

If you see the error:

DESK15 Sync Error: Could not execute QuickBooks Desktop request.

This means there is a connection issue between the Workspace and QuickBooks Desktop.

The integration attempted to send a request to QuickBooks, but QuickBooks could not process it.

---

## Why the DESK15 Sync Error Happens in QuickBooks Desktop

The DESK15 error typically occurs when:

- QuickBooks Desktop is not responding to the Web Connector.
- The QuickBooks company file is not open.
- There is a permissions issue.
- The Web Connector cannot execute the request.
- There is a system-level or hosting environment issue.

This is a connection or execution issue, not a report data issue.

---

# How to Fix the DESK15 Sync Error

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
3. Reference the **DESK15 Sync Error**.

Concierge will review the log file to identify the root cause and provide next steps.

---

# FAQ

## Can I Fix the DESK15 Error Without the Log File?

In most cases, no. The log file is required to identify the specific QuickBooks request failure.

## Does This Mean My Integration Is Disconnected?

Not necessarily. It means QuickBooks could not execute the request. Reviewing the Web Connector log file will help determine the exact cause.
