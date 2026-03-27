---
title: Export Reports
description: Learn how to export reports from the Reports page to CSV or download them as PDF in New Expensify.
keywords: [New Expensify, export reports, CSV export, PDF download, download report, report export template, bulk export reports, report data]
internalScope: Audience is all members. Covers exporting reports from the Reports page to CSV using export templates (individually and in bulk), and downloading individual reports as PDF. Does not cover exporting individual expenses from the Expenses page (see Export-Expenses.md), exporting to an accounting integration, or company card reconciliation.
---

This article explains how to export reports from the Reports page to a CSV file using export templates, and how to download individual reports as PDF.

# How to Export a Single Report to CSV

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Reports** > **Expense Reports**.
2. Open the report you want to export.
3. Select **More**.
4. Select **Export**.
5. Choose an export template:
   - **Basic Export** - Essential fields including date, amount, merchant, category, and receipt URL.
   - **All Data - Expense Level Export** - One row per expense with all available data fields.
   - **All Data - Report Level Export** - One row per report with summary data.
   - **Custom Templates** - Any custom template created by you or your Workspace Admin, if available.

You'll receive the exported CSV file in a message from **Concierge**.

# How to Export Multiple Reports in Bulk

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Reports** > **Expense Reports**.
2. Select the checkbox next to each report you want to export, or use the top checkbox to select all.
3. Select **Selected** at the top.
4. Select **Export**.
5. Choose an export template (Basic Export, All Data - Expense Level Export, All Data - Report Level Export, or a custom template).

You'll receive the exported CSV file in a message from **Concierge**.

**Note:** Report-level templates (such as All Data - Report Level Export) only appear when full reports are selected.

# How to Download a Report as PDF

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Reports** > **Expense Reports**.
2. Open the report you want to download.
3. Select **More**.
4. Select **Download as PDF**.

The PDF includes all expenses, attached receipts, and report notes. PDF downloads are only available for individual reports - they cannot be downloaded in bulk.

---

# FAQ

## Where do I find the exported CSV file?

For the Basic Export template, the file downloads directly to your device. For all other templates, Concierge sends the file to you in a direct message. Open your Concierge chat to find it.

## What is the difference between expense-level and report-level export templates?

- **Expense-level templates** (Basic Export, All Data - Expense Level Export) create one row per expense. Use these when you need detailed data for each individual expense.
- **Report-level templates** (All Data - Report Level Export) create one row per report with summary data. Use these when you need an overview of each report as a whole.

## Can I customize which columns appear in the CSV export?

If your Workspace Admin has created custom export templates, you can select one during export. Otherwise, columns follow the selected default template.

## Can I download individual expenses as a PDF?

No, PDF download is only available for full reports. To export individual expense data, use the CSV export from the Expenses page instead. See [Export Expenses](/articles/new-expensify/reports-and-expenses/Export-Expenses).

## The data looks wrong in Excel. How can I fix it?

Long IDs may appear in scientific notation. To fix this:
1. Open Excel and go to **File** > **Import**.
2. Select your CSV file and follow the prompts.
3. Set the report or transaction ID column to **Text** format.

## Why are leading zeros missing in my export?

Excel may remove leading zeros automatically. To prevent this:
1. Open Excel and go to **File** > **Import**.
2. Select your CSV file.
3. Set the relevant columns to **Text** format.

---

# Related Articles

- [Export Expenses](/articles/new-expensify/reports-and-expenses/Export-Expenses) - Export individual expenses to CSV from the Expenses page.
- [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation) - Reconcile company card transactions against your card statement.
- [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses) - Reconcile Expensify Card expenses.
