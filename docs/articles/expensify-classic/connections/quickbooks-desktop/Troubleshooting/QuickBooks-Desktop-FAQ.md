---
title: QuickBooks Desktop FAQ
description: Learn how to troubleshoot common QuickBooks Desktop export issues, including failed exports, manual export restrictions, company card mapping, and disconnecting the integration.
keywords: QuickBooks Desktop export FAQ, report not exporting QuickBooks Desktop, manually export report, company card exporting to wrong account, disconnect QuickBooks Desktop, negative expense export, Expensify QuickBooks Desktop troubleshooting, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers common export and configuration questions. Does not cover specific QuickBooks Online errors.
---

# QuickBooks Desktop FAQ

## Why Is My Report Not Exporting to QuickBooks Desktop?

An error is preventing the report from exporting.

You can find the error in several places:

- The preferred exporter (as set in Workspace accounting settings) receives an email with error details.
- The error appears in the report’s comment section.
- Automatic exports are paused until the issue is resolved.

### How to Resolve Export Errors

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. Once resolved, a Workspace Admin can manually export the report.

Automatic exports will resume after errors are cleared.

---

## Why Am I Unable to Manually Export a Report to QuickBooks Desktop?

Only reports in one of the following statuses can be exported:

- Approved
- Done
- Paid

If the report is in Draft status, the export button may load an empty screen.

### How to Resolve Manual Export Issues

1. Submit the report if it is in Draft status.
2. Have an approver approve the report if it is Outstanding.
3. Once the report is Approved, Done, or Paid, a Workspace Admin can manually export it.

---

## Why Are Company Card Expenses Exporting to the Wrong Account?

This usually means the company card export account is not configured correctly.

### How to Confirm the Company Card Export Account

1. Go to **Settings**.
2. Select **Domains**.
3. Click **Company Cards**.
4. Click **Edit export** for the affected card.
5. Confirm the correct QuickBooks Desktop account is selected.
6. Click **Save**.

Also confirm:

- Expenses display the **Card + Lock** icon.
- The preferred exporter is a **Domain Admin**.

If the preferred exporter is not a Domain Admin, exports may default to the fallback company card account.

To check the exporter role:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.

---

## How Do I Disconnect the QuickBooks Desktop Connection?

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click the gray **Disconnect** button under the connection.
6. Confirm to disconnect.

Note: Disconnecting clears all imported options from Expensify.

---

## Can I Export Negative Expenses to QuickBooks Desktop?

Yes. QuickBooks Desktop accepts negative expenses across all export types.
