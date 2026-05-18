---
title: QuickBooks Online Integration FAQ and Export Troubleshooting
description: Learn why reports may not export to QuickBooks Online, how to manually export, fix company card mapping issues, disconnect the integration, and handle negative expenses.
keywords: QuickBooks export not working, automatic export failed QuickBooks, manual export QuickBooks Online, company card wrong account QuickBooks, preferred exporter domain admin, disconnect QuickBooks Online, negative expense export QuickBooks, Workspace Admin
internalScope: Audience is Workspace Admins and Domain Admins using the QuickBooks Online integration. Covers common export failures, manual export restrictions, company card mapping issues, disconnecting the integration, and negative expense exports. Does not cover specific QuickBooks error codes.
---

# QuickBooks Online FAQ

## Why is my report not automatically exporting to QuickBooks Online?

An error is preventing the report from exporting automatically.

You can find the error in several ways:

- The **preferred exporter** (as configured in Expensify) receives an email with error details.
- The error appears in the report’s comments section.
- Automatic exports will continue to fail until the error is resolved.

### How to resolve automatic export failures

1. Open the affected report in Expensify.
2. Review the error message in the comments section.
3. Make the required corrections.
4. Have a Workspace Admin manually export the report.

---

## Why am I unable to manually export a report to QuickBooks Online?

Only reports in **Approved**, **Done**, or **Paid** status can be exported.

If the report is in **Draft** status, selecting export may result in an empty screen.

### How to resolve manual export issues

1. Submit the report if it is in Draft status.
2. Have an approver approve the report if it is Outstanding.
3. Once the report is Approved, Done, or Paid, a Workspace Admin can manually export it.

---

## Why are company card expenses exporting to the wrong account?

Company card expenses may export to the wrong account if the card export mapping is incorrect or if the exporter does not have proper permissions.

### How to verify company card export mapping

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Domains**.
4. Select **Company Cards**.
5. Click **Edit Export** for the affected card.
6. Confirm the correct export account is selected.

Also confirm:

- The expenses display the **Card + Lock icon**, which ensures they are mapped correctly.
- The preferred exporter is a **Domain Admin**.

If the preferred exporter is not a Domain Admin, exports will default to the fallback company card account set in the Workspace configuration.

### How to check the preferred exporter

1. Go to the navigation tabs on the left.
2. Click **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Export** tab.
7. Review the preferred exporter settings.

---

## How do I disconnect the QuickBooks Online connection?

Disconnecting removes the active integration and clears imported options.

### How to disconnect QuickBooks Online

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click the gray **Disconnect** button under the QuickBooks Online connection.
7. Confirm to disconnect.

Note: Disconnecting clears all imported options from Expensify.

---

## Can I export negative expenses to QuickBooks Online?

Yes.

QuickBooks Online accepts negative expenses across all export types.
