---
title: Export Reports to Zoho Books
description: Learn how to export individual reports or multiple reports to Zoho Books and mark reports as exported without sending them again.
keywords: [New Expensify, export Zoho Books reports, bulk export Zoho Books, mark as exported, Zoho Books vendor bills, Zoho Books export error]
internalScope: Audience is workspace admins and preferred exporters using a configured Zoho Books connection. Covers manual single-report and bulk exports, marking reports as exported, and export prerequisites. Does not cover connection setup, export configuration, or CSV exports.
order: 3
---

# Export Reports to Zoho Books

Export reports to Zoho Books individually or in bulk. If you already entered a report in Zoho Books, mark it as exported instead of sending it again.

If **Auto-sync** is enabled, reports export automatically according to your **Export method**. Manual export actions are still available.

## Who can export reports to Zoho Books

You must have permission to export reports, such as being a workspace admin or the preferred exporter, and use a workspace with a configured Zoho Books connection. Reports must be approved, paid, or closed before they can export.

Before exporting, select the appropriate company card accounts and make sure employees submitting reimbursable expenses have matching vendors in Zoho Books.

Learn how to [configure Zoho Books export settings](/articles/new-expensify/connections/zoho-books/Configure-Zoho-Books).

## How to export a report to Zoho Books

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports**.
2. Open the report you want to export.
3. Select **More (⋮) > Export**.
4. Select **Export to Zoho Books**.

Review the report history for the export result. Resolve any reported error before retrying.

## How to export multiple reports to Zoho Books

1. Select **Spend > Reports**.
2. Select the checkbox next to each report you want to export.
3. In the selection bar, select **Export**.
4. Select **Zoho Books**.
5. Review any warnings about reports that aren't eligible or were already exported before continuing.

Review each report's history for its export result. An export problem on one report may need a different correction from another report.

## How to mark reports as exported to Zoho Books

Marking a report as exported records that it was handled outside the integration. It doesn't create bills, expenses, or payments in Zoho Books.

For one report:

1. Select **Spend > Reports** and open the report.
2. Select **More (⋮) > Export**.
3. Select **Mark as exported**.

For multiple reports:

1. Select **Spend > Reports**.
2. Select the checkbox next to each report.
3. In the selection bar, select **Export**.
4. Select **Mark as exported**.

## What records report exports create in Zoho Books

- Reimbursable expenses are grouped by report as a vendor bill using the employee's vendor. Reports with a zero or negative reimbursable total can create a vendor credit for refunds and a bill for any positive expenses.
- Company card expenses create individual Zoho Books expenses using the configured card account and vendor settings.

Don't export a report again just to change its export status. Re-exporting can create duplicate accounting records. Review the existing records in Zoho Books first.

# FAQ

## Why can't I export a report to Zoho Books?

Check that the report is approved, paid, or closed, that you have export permission, and that the Zoho Books connection is configured. Review the report history for the specific error.

## Why can't Zoho Books find an employee vendor?

Reimbursable exports match the employee to an existing Zoho Books vendor by email address. Add or update that vendor in Zoho Books so its email matches the employee's Expensify email, sync the connection, and retry. The employee vendor must also use the bill's currency.

## Why do company card expenses need an account?

Zoho Books needs an account to record how the expense was paid. Select a **Company card account** in the Zoho Books export settings, or configure an account for the card program or individual card.
