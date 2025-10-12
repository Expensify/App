---
title: QuickBooks Desktop Troubleshooting
description: Resolve common QuickBooks Desktop integration issues with Expensify, including Web Connector, authentication, import, and export errors.
keywords: [New Expensify, QuickBooks Desktop, Web Connector, export error, sync issues, import missing categories, authentication issues]
order: 3
---


This guide provides step-by-step solutions for the most common issues, including Web Connector errors, authentication problems, and data import/export failures.

---

# Web Connector cannot be reached

If you're seeing connection errors, it's likely due to an issue between QuickBooks and the Web Connector.

## Steps to Fix

1. Make sure both QuickBooks Desktop and the Web Connector are running.
2. Confirm that the Web Connector is installed in the same environment as QuickBooks (either local desktop or remote server).
3. If the error persists:
   - Close the Web Connector completely (use Task Manager if necessary).
   - Right-click the Web Connector and choose **Run as administrator**.
   - Try syncing your Expensify workspace again.
4. Still not working?
   - Quit and reopen QuickBooks Desktop.
   - From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**.
   - Click the three dots next to **QuickBooks Desktop**, then select **Sync now**.
   - If none of the above works, reinstall the Web Connector using the official link from QuickBooks.

---

# Connection or authentication issues

These typically occur when QuickBooks can't authenticate the Web Connector or Expensify.

## Steps to Fix

1. Open QuickBooks Desktop with the correct company file.
2. Make sure the QuickBooks Web Connector is online.
3. Close any open dialog boxes in QuickBooks and try syncing again.
4. Log in as Admin in single-user mode.
5. Go to **Edit > Preferences > Integrated Applications > Company Preferences**.
6. Select **Web Connector**, then click **Properties**.
7. Enable **Allow this application to login automatically**, then click **OK**.
8. Close all QuickBooks windows.

**If issues persist, contact Concierge with the following details:**
- QuickBooks Desktop version
- Location of QuickBooks and company file (local or remote)
- Location of Web Connector
- Name of hosting provider (if remote, e.g., RightNetworks)

---

# Import issues or missing categories, or tags

These issues usually signal that the integration is outdated or not fully compatible.

## Steps to Fix

1. Re-sync from **Workspaces > [Workspace Name] > Accounting**.
2. Check your QuickBooks configuration:
   - Chart of accounts = categories/export accounts
   - Projects, customers, and classes = tags in Expensify

If issues persist, contact Concierge support with screenshots of your QuickBooks setup and error details.

---

# Export errors or missing categories, classes, or accounts

These errors often show up in Expense Chat during report export.

## Steps to Fix

1. Re-sync from **Workspaces > [Workspace Name] > Accounting > QuickBooks Desktop**.
2. Re-apply the coding on your expenses and re-export the report.
3. Make sure your QuickBooks Desktop version supports the export feature you’re using ([check compatibility](https://quickbooks.intuit.com/desktop/)).

**If issues persist, contact Concierge support with the following details:**
- The Report ID
- Screenshot of the error in Expensify
- Details about the export issue

---

# Error: “Oops!” error when syncing or exporting

This message may appear even if the sync or export worked.

## Steps to Fix

1. Check whether the action actually succeeded.
2. Retry syncing or exporting if needed.

If the error keeps showing:
- Open the Web Connector
- Click **View Log** to download the QuickBooks Desktop logs
- Contact Concierge and share the logs

**Note:** If you're using a remote server (e.g., RightNetworks), contact their support for help retrieving logs.

---

# Reports not exporting to QuickBooks Desktop

This usually means QuickBooks or the Web Connector was closed during the export attempt.

## Steps to Fix

1. Ensure QuickBooks Desktop and the Web Connector are both open.
2. In Web Connector, confirm the **Last Status** reads “Ok”.
3. Check the associated Expense Chat in Expensify to verify if the export was successful.

Still not exporting? Share the Report ID and a screenshot of your Web Connector with Concierge.
