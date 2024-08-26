---
title: Quickbooks Desktop Troubleshooting
description: Quickbooks Desktop Troubleshooting
---

# The Web Connector cannot be reached

Generally, these errors indicate that there is a connection issue, where there’s a breakdown between Expensify and QuickBooks.

## How to resolve

1. Make sure that the Web Connector and QuickBooks Desktop are both running.
2. Make sure that the Web Connector is installed in the same location as your QuickBooks application. For example, if QuickBooks is installed on your local desktop, the Web Connector should be too. Or if QuickBooks is installed on a remote server, the Web Connector should be installed there as well.

If the error persists:
 
1. Close the Web Connector completely (you may want to use Task Manager to do this). 
2. Right-click the Web Connector icon on your desktop and select **Run as administrator**. 
3. Sync your Workspace again.  

If this doesn’t work, the final troubleshooting steps should be:

1. Quit QuickBooks Desktop, then reopen it. 
2. In Expensify, hover over **Settings** and select **Workspaces**. 
3. Click the workspace name that is connected to QuickBooks Desktop.
4. Click the **Connections** tab on the left. 
5. Click **QuickBooks Desktop**.
6. Click **Sync Now**.
7. If this still doesn’t resolve the issue, use the link to reinstall the Web Connector. 

# Connection and/or authentication issue

Generally, these errors indicate that there is a credentials issue.

## How to resolve

1. Make sure QuickBooks Desktop is open with the correct company file. This must be the same company file that you have connected to Expensify.
2. Make sure the QuickBooks Web Connector is open and the connector is online.
3. Make sure that there are no dialogue boxes open in QuickBooks that are interfering with attempts to sync or export. To resolve this, close any open windows in QuickBooks Desktop so that you only see a gray screen, then try exporting or syncing again.
4. Check that you have the correct permissions. 
5. Log in to QuickBooks Desktop as an Admin (in single-user mode). 
6. Go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**.
7. Select the Web Connector and click **Properties**. 
8. Make sure that the "Allow this application to login automatically" checkbox is selected and click **OK**.
9. Close all windows in QuickBooks.

If these general troubleshooting steps don’t work, reach out to Concierge and have the following information ready to provide:

1. What version of QuickBooks Desktop do you have (Enterprise 2016, Pro 2014, etc.)?
2. Is your QuickBooks program installed on your computer or a remote network/drive?
3. Is your QuickBooks company file installed on your computer or a remote network/drive?
4. Is your Web Connector installed on your computer or a remote network/drive?
5. If any of the above are on a remote option, is there a company that runs that remote environment? If so, who (ie: RightNetworks, SwissNet, Cloud9, etc.)?

# Import issue or missing categories and/or tags

Generally, if you are having issues importing data from QuickBooks to Expensify, this indicates that the integration needs to be updated or your version of QuickBooks may not support a specific configuration.

## How to resolve

1. Re-sync the connection between Expensify and QuickBooks Desktop. A fresh sync can often resolve any issues, especially if you have recently updated your chart of accounts or projects, customers, or jobs in QuickBooks Desktop.
2. Check your configuration in QuickBooks Desktop. Expensify will import the chart of accounts to be utilized either as categories or export account options, while projects, customers, and tags will be imported as tags.

If these general troubleshooting steps don’t work, reach out to Concierge with context on what is specifically missing in Expensify, as well as screenshots from your QuickBooks Desktop setup.

# Export or "can't find category/class/location/account" issue

Generally, when an export error occurs, we’ll share the reason in the Report Comments section at the bottom of the report. This will give you an indication of how to resolve the error.

## How to resolve

1. Re-sync the connection between Expensify and QuickBooks Desktop. A fresh sync can often resolve any issues, especially if you have recently updated your chart of accounts or projects, customers, or jobs in QuickBooks Desktop.
2. Re-apply coding to expenses and re-export the report. If you’ve recently synced Expensify and QuickBooks or recently made changes to your Workspace category or tags settings, you may need to re-apply coding to expenses. 
3. Make sure that your current version of QuickBooks Desktop supports the selected export option. Different versions of QuickBooks Desktop support different export options and the [version that you own](https://quickbooks.intuit.com/desktop/) may not be compatible with the export type. 

If these general troubleshooting steps don’t work, reach out to Concierge with the Report ID, some context on what you’re trying to do, and a screenshot of the Expensify error message.

# “Oops!” error when syncing or exporting

Generally, an “Oops!” error can often be temporary or a false error. Although you will see a message pop up, there may actually not be an actual issue. 

## How to resolve

1. Check to see if the sync or export was successful.
2. If it wasn't, please attempt to sync or export the connection again.

If the problem persists, download the QuickBooks Desktop log file via the Web Connector (click View Logs to download them) and reach out to Concierge for further assistance.

{% include info.html %}
If you’re using a remote server (e.g. RightNetworks), you may need to contact that support team to request your logs.
{% include end-info.html %}
