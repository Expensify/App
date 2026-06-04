---
title: Sage Intacct FAQ
description: Learn why reports may fail to export to Sage Intacct, how to manually export reports, and how to disconnect the Sage Intacct integration.
keywords: Sage Intacct export FAQ, automatic export failure, manual export Sage Intacct, report not exporting, disconnect Sage Intacct integration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers export failures, manual export requirements, and disconnecting the Sage Intacct integration. Does not cover specific Sage Intacct error codes.
---

# Sage Intacct FAQ

## Why Is My Report Not Automatically Exporting to Sage Intacct?

If your report is not automatically exporting, an error is preventing the export from completing.

You can find export errors in several places:

- The **preferred exporter** (as set in the Workspace accounting configuration) receives an email with error details  
- The error appears in the **report comments section**  
- Automatic export remains paused until the error is resolved  

### How to Resolve Automatic Export Failures

1. Open the report in Expensify.  
2. Review the error message in the comments.  
3. Make the required corrections.  
4. A Workspace Admin can then manually export the report.  

Once the issue is resolved, future reports can export automatically.

---

## Why Am I Unable to Manually Export a Report to Sage Intacct?

Only reports in **Approved**, **Done**, or **Paid** status can be exported.

If a report is in **Draft** status, clicking the export button may load an empty screen.

### How to Resolve Manual Export Issues

1. If the report is in **Draft**, submit the report.  
2. If the report is **Outstanding**, have an approver approve it.  
3. Once the report is **Approved**, **Done**, or **Paid**, a Workspace Admin can manually export the report.  

---

## How Do I Disconnect the Sage Intacct Integration?

If you need to disconnect the integration:

1. Go to **Settings > Workspaces**.  
2. Select your Workspace.  
3. Click **Accounting**.  
4. Click the gray **Disconnect** button.  
5. Confirm the disconnection.  

Note: Disconnecting clears all imported options from the Workspace.
