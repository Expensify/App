---
title: QuickBooks Desktop troubleshooting
description: Resolve common QuickBooks Desktop integration issues with Expensify, including Web Connector, authentication, import, and export errors.
order: 3
---

This article provides step-by-step solutions for common QuickBooks Desktop issues encountered when syncing with Expensify. Follow these troubleshooting steps to quickly address and resolve connectivity, authentication, import, and export problems.

---

# The Web Connector cannot be reached

These errors usually indicate a connection issue between Expensify and QuickBooks.

## How to resolve

1. Ensure QuickBooks Desktop and the Web Connector are running.
2. Install the Web Connector in the same location as QuickBooks (local desktop or remote server).

If the error persists:

1. Completely close the Web Connector (use Task Manager if needed).
2. Right-click the Web Connector icon and select **Run as administrator**.
3. Sync your Expensify workspace again.

If issues continue:

1. Quit and reopen QuickBooks Desktop.
2. In Expensify, go to **Settings > Workspaces**.
3. Select your workspace connected to QuickBooks Desktop.
4. Click **Accounting**.
5. Click the three vertical dots next to **QuickBooks Desktop**.
6. Click **Sync now**.
7. If unresolved, reinstall the Web Connector using the provided link.

---

# Connection or authentication issues

These errors usually indicate a credential issue.

## How to resolve

1. Ensure QuickBooks Desktop is open with the correct company file.
2. Ensure the QuickBooks Web Connector is open and online.
3. Close any open dialogue boxes in QuickBooks Desktop and retry syncing or exporting.
4. Check permissions: log in to QuickBooks Desktop as Admin (single-user mode).
5. Go to **Edit > Preferences > Integrated Applications > Company Preferences**.

![Company Preferences](https://help.expensify.com/assets/images/quickbooks-desktop-company-preferences.png){:width="100%"}

6. Select the Web Connector and click **Properties**.

![Web Connector Properties](https://help.expensify.com/assets/images/quickbooks-desktop-access-rights.png){:width="100%"}

7. Check **Allow this application to login automatically** and click **OK**.
8. Close all QuickBooks windows.

If unresolved, contact Concierge with:

- QuickBooks Desktop version.
- Location of QuickBooks and company file (local or remote).
- Location of Web Connector (local or remote).
- Provider of remote environment (if applicable, e.g., RightNetworks).

---

# Import issues or missing categories/tags

These issues indicate the integration needs updating or QuickBooks version incompatibility.

## How to resolve

1. Re-sync the connection from **Workspace Accounting** settings.
2. Verify configuration in QuickBooks. Expensify imports chart of accounts as categories or export account options, and imports projects, customers, and tags as tags.

If unresolved, contact Concierge with details and QuickBooks screenshots.

---

# Export or "can't find category/class/location/account" issues

These errors usually generate a system message in Expense Chat indicating the issue.

## How to resolve

1. Re-sync the connection from **Workspace Accounting** settings.
2. Re-apply coding to expenses and re-export reports.
3. Verify your QuickBooks Desktop version supports the selected export option ([check compatibility](https://quickbooks.intuit.com/desktop/)).

If unresolved, contact Concierge with Report ID, context, and Expensify error screenshot.

---

# “Oops!” error when syncing or exporting

These errors can often be temporary or false alarms.

## How to resolve

1. Check if the sync/export was successful.
2. Retry syncing or exporting if unsuccessful.

If persistent, download QuickBooks Desktop logs via Web Connector (**View Logs**) and contact Concierge.

{% include info.html %}
If using a remote server (e.g., RightNetworks), contact their support for logs.
{% include end-info.html %}

---

# Reports not exporting to QuickBooks Desktop

Usually caused by the Web Connector or QuickBooks company file being closed during export.

## How to resolve

1. Ensure the Web Connector and QuickBooks Desktop company file are open.
2. In Web Connector, verify **Last Status** is "Ok".

![Web Connector Status](https://help.expensify.com/assets/images/quickbooks-desktop-web-connector.png){:width="100%"}

3. Check Expense Chat in Expensify to confirm successful export.

If unresolved, contact Concierge with Expensify Report ID and Web Connector screenshot.
