---
title: DESK39 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK39 export error means and how to retrieve QuickBooks Web Connector logs for troubleshooting connection issues.
keywords: DESK39, could not post data to QuickBooks Desktop, QuickBooks Web Connector log file, QBWC export error, Expensify QuickBooks Desktop connection issue, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK39 export error related to connection issues and collecting Web Connector logs. Does not cover mapping or export configuration errors.
---

# DESK39 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK39 Export Error: Could not post data to QuickBooks Desktop.

This means there is a connection issue between the Workspace and QuickBooks Desktop.

The integration attempted to send data to QuickBooks, but QuickBooks could not process the request.

---

## Why the DESK39 Export Error Happens in QuickBooks Desktop

The DESK39 error typically occurs when:

- QuickBooks Desktop is not responding to the Web Connector.
- The QuickBooks company file is not open.
- The Web Connector cannot execute the export request.
- There is a permissions issue.
- There is a hosting or environment-related issue.

This is a connection or execution issue, not a report data issue.

---

# How to Fix the DESK39 Export Error

The next step is to retrieve the QuickBooks Web Connector log file for review.

---

## Download the QuickBooks Web Connector Log File

1. Open **QuickBooks Web Connector**.
2. Click **View Logs**.
3. This will download a log file to your computer.

If you are using a hosted QuickBooks server:

- Contact your hosting provider.
- Ask them to download the QuickBooks Web Connector log file.

---

## Share the Log File With Concierge

After downloading the log file:

1. Go to **Concierge** in the Workspace.
2. Attach the log file.
3. Reference the **DESK39 Export Error**.

Concierge will review the log file to identify the root cause and provide next steps.

---

# FAQ

## Can I Fix the DESK39 Error Without the Log File?

In most cases, no. The Web Connector log file is required to determine why QuickBooks rejected the request.

## Does This Mean My Integration Is Disconnected?

Not necessarily. It means QuickBooks could not process the export request. Reviewing the log file will help determine the exact cause.
