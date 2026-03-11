---
title: QuickBooks Desktop FAQ
description: Learn how to troubleshoot common QuickBooks Desktop export issues, including automatic export failures, manual export restrictions, company card mapping, and disconnecting the integration.
keywords: QuickBooks Desktop export FAQ, automatic export failed QuickBooks Desktop, manually export report QuickBooks Desktop, company card exporting to wrong account, disconnect QuickBooks Desktop, negative expense export, Expensify QuickBooks Desktop troubleshooting, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration. Covers common export and sync questions. Does not cover specific QuickBooks Desktop error codes.
---

# QuickBooks Desktop FAQ

## Why Is My Report Not Automatically Exporting to QuickBooks Desktop?

An error is preventing the report from exporting automatically.

You can find the error in several places:

- The preferred exporter (set in Workspace accounting settings) receives an email with error details.
- The error appears in the report’s comment section.
- Automatic export is paused until the issue is resolved.

### How to Resolve Automatic Export Errors

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

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Click **Edit export** for the affected card.
5. Confirm the correct QuickBooks Desktop account is selected.
6. Click **Save**.

Verify that:

- The expense shows the **Card + Lock icon**, ensuring it is mapped correctly.

After updating the mapping, future exports will use the correct account.

---

## How Do I Disconnect the QuickBooks Desktop Connection?

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Desktop connection.
5. Select **Disconnect**.
6. Confirm to disconnect.

Note: Disconnecting clears all imported options from Expensify.

---

## Can I Export Negative Expenses to QuickBooks Desktop?

Yes. QuickBooks Desktop accepts negative expenses across all export types.
