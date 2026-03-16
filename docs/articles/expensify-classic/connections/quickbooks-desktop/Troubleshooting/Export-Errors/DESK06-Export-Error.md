---
title: DESK06 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK06 export error in QuickBooks Desktop when a referenced record does not exist in the list.
keywords: DESK06, QuickBooks Desktop invalid argument error, specified record does not exist, vendor name changed QuickBooks, Web Connector log file, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK06 export error by retrieving Web Connector logs. Does not cover QuickBooks Online errors.
---

# DESK06 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK06: Invalid argument for QuickBooks Desktop. The specified record does not exist in the list.

This means QuickBooks Desktop cannot find a record referenced during export.

---

## Why the DESK06 Export Error Happens in QuickBooks Desktop

The DESK06 error most commonly occurs when:

- A vendor name was edited in QuickBooks Desktop after the last sync.
- A customer, account, or other record was renamed or deleted.
- The Expensify connection has not been synced since changes were made in QuickBooks Desktop.

If a record changes in QuickBooks Desktop without syncing the connection, Expensify may reference an outdated name during export.

---

## How to Fix the DESK06 Export Error

To identify the exact record causing the issue, review the QuickBooks Web Connector log file.

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
   - The approximate time the export failed.
   - Any recent changes made to vendor names, accounts, or other records in QuickBooks Desktop.

Concierge will review the log file to determine which record is missing or mismatched and provide next steps.

---

# FAQ

## Can I Fix This by Running a Sync?

If a record was renamed or edited, running a sync may help refresh the connection. However, if the export continues to fail, the log file is required to identify the exact record causing the issue.

## Does DESK06 Mean My Data Was Deleted?

No. This error indicates a reference mismatch. Your data remains intact in both Expensify and QuickBooks Desktop.
