---
title: QuickBooks Desktop Troubleshooting
description: Troubleshoot common QuickBooks Desktop issues, including connection problems, import/export errors, and sync failures.
keywords: [Expensify Classic, troubleshooting QuickBooks Desktop]
---

<div id="expensify-classic" markdown="1">

QuickBooks Desktop integration issues can sometimes disrupt your workflow. This guide walks you through the most common connection, sync, and export problems and how to quickly resolve them to keep your Workspace connection running smoothly.

---

# The Web Connector Cannot Be Reached

These errors indicate a connection issue between Expensify and QuickBooks.

## How to Resolve

1. Ensure both the Web Connector and QuickBooks Desktop are running.
2. Verify that the Web Connector is installed in the same location as QuickBooks:
   - If QuickBooks is on your local desktop, the Web Connector should be too.
   - If QuickBooks is on a remote server, install the Web Connector there as well.

If the error persists:

1. Close the Web Connector completely using Task Manager if needed.
2. Right-click the Web Connector icon and select **Run as administrator**.
3. Sync your Workspace again.

Final troubleshooting steps:

1. Restart QuickBooks Desktop.
2. In Expensify, go to **Settings** > **Workspaces**.
3. Select the connected Workspace.
4. Click the **Accounting** tab and select **QuickBooks Desktop**.
5. Click **Sync Now**.
6. If the issue persists, reinstall the Web Connector.

---

# Connection or Authentication Issues

These errors indicate a credentials issue.

## How to Resolve

1. Ensure QuickBooks Desktop is open with the correct company file.
2. Confirm that the QuickBooks Web Connector is online.
3. Close any open dialogue boxes in QuickBooks that may interfere with syncing.
4. Check that you have the correct permissions:
   - Log in to QuickBooks Desktop as an Admin in single-user mode.
   - Go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**.

   ![QuickBooks Desktop Company Preferences](https://help.expensify.com/assets/images/quickbooks-desktop-company-preferences.png){:width="100%"}

5. Select the Web Connector and click **Properties**.

   ![QuickBooks Desktop Web Connector Access Rights](https://help.expensify.com/assets/images/quickbooks-desktop-access-rights.png){:width="100%"}

6. Check **Allow this application to login automatically** and click **OK**.

If the issue persists, contact Concierge with:
- QuickBooks Desktop version (e.g., Enterprise 2016, Pro 2014)
- Installation details (local or remote)
- Web Connector installation location
- Remote environment provider (if applicable)

---

# Import Issues or Missing Categories/Tags

If the data is not importing, the integration may need updating.

## How to Resolve

1. Resync Expensify and QuickBooks Desktop.
2. Check your QuickBooks Desktop configuration:
   - The Chart of Accounts imports as categories.
   - Projects, customers, and jobs are imported as tags.

---

# Export or "Can't Find Category/Class/Location/Account" Issues

Errors during export are noted in the **Report Comments** section.

## How to Resolve

1. Resync Expensify and QuickBooks Desktop.
2. Reapply coding to expenses and re-export the report.
3. Verify that your QuickBooks Desktop version supports the selected export option.

If the issue persists, contact Concierge with the Report ID and a screenshot of the error message.

---

# "Oops!" Error When Syncing or Exporting

This error may be temporary or a false flag.

## How to Resolve

1. Check if the sync or export was successful.
2. If not, attempt to sync or export again.

If the problem persists, download the QuickBooks Desktop log file from the Web Connector and contact Concierge.

**Note:** If you use a remote server (e.g., RightNetworks), you may need to contact their support team for logs.

---

# Reports Not Exporting to QuickBooks Desktop

This usually occurs when the QuickBooks Web Connector or Company File is not open during export.

## How to Resolve

1. Ensure both the Web Connector and QuickBooks Desktop Company File are open.
2. In the Web Connector, check that the **Last Status** is "Ok".

   ![QuickBooks Web Connector Status OK](https://help.expensify.com/assets/images/quickbooks-desktop-web-connector.png){:width="100%"}

3. Check **Report Comments** in Expensify to confirm successful export.

   ![Expensify Exported Report](https://help.expensify.com/assets/images/quickbooks-desktop-exported-report-comments.png){:width="100%"}

</div>
