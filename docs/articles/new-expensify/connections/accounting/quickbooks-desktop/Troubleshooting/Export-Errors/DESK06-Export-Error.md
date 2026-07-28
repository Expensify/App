---
title: DESK06 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK06 export error means and how to retrieve QuickBooks Web Connector logs when a record does not exist in QuickBooks Desktop.
keywords: DESK06, invalid argument QuickBooks Desktop, specified record does not exist, vendor name changed QuickBooks, QuickBooks Web Connector log file, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK06 export error related to missing or renamed records and collecting Web Connector logs. Does not cover mapping or connection configuration errors.
---

# DESK06 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK06 Export Error: Invalid argument for QuickBooks Desktop. The specified record does not exist in the list.

This means QuickBooks Desktop cannot find a referenced record, such as a vendor, employee, customer, or account.

This error most commonly occurs when a vendor name has been edited in QuickBooks Desktop after the most recent sync.

---

## Why the DESK06 Export Error Happens in QuickBooks Desktop

The DESK06 error typically occurs when:

- A vendor name was edited in QuickBooks Desktop after the last sync.
- A referenced record was deleted in QuickBooks.
- The Web Connector is attempting to export using outdated list data.
- The integration is referencing a record that no longer exists.

QuickBooks rejects the export if the referenced record cannot be found.

This is a record mismatch issue between QuickBooks Desktop and the Workspace.

---

# How to Fix the DESK06 Export Error

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
3. Reference the **DESK06 Export Error**.

Concierge will review the log file to identify the missing or renamed record and provide next steps.

---

# FAQ

## Does This Error Usually Mean a Vendor Was Renamed?

Yes. This error most commonly occurs when a vendor name was edited in QuickBooks Desktop after the last sync.

## Can I Fix This by Running Sync Again?

In some cases, running **Sync now** may resolve minor mismatches. However, reviewing the Web Connector log file is usually required to confirm the exact record causing the issue.

## Does This Mean My Integration Is Disconnected?

No. It means QuickBooks cannot find a referenced record during export.
