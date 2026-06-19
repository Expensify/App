---
title: How to Export Reports
description: Learn how to export reports to CSV or download them as PDFs.
keywords: [New Expensify, export reports, CSV export, PDF download, download report, report export template, bulk export reports, report data]
internalScope: Audience is all members. Covers exporting reports to CSV using export templates (individually and in bulk), and downloading individual reports as PDF. Does not cover exporting individual expenses from the Expenses page (see Export-Expenses.md), exporting to an accounting integration, or company card reconciliation.
---

# How to export reports 

Export reports to a CSV file using export templates, and download individual reports as PDFs.

If you’re trying to export a specific type of data, use the guides below:

 - Expensify Card expenses: [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses)
 - Company card expenses: [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation)
 - Specific expenses: [Export Expenses](/articles/new-expensify/reports-and-expenses/How-to-Export-Expenses)

## How to export a single report to CSV

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Open the report you want to export.
3. Select **More**.
4. Select **Export**.
5. Choose an export template from the menu that appears. 

You'll receive the exported CSV file in a message from Concierge.

## How to export multiple reports

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**. 
2. Select the checkbox next to each report you want to export, or use the top checkbox to select all.
3. Select **Selected** at the top.
4. Select **Export**.
5. Choose an export template from the menu that appears. 

You'll receive the exported CSV file in a message from Concierge.

## What export templates can I choose from? 

Expensify offers pre-built export templates, or you can build your own custom export template. All available templates will appear in the menu when you export a report. 

   - **Basic export** - Essential fields including date, amount, merchant, category, and receipt URL.
   - **All Data - expense level** - One row per expense on the report with all available data fields.
   - **All Data - report level** - One row per report with all available data fields.
   - **Custom templates** - Any custom template created by you or your Workspace Admin, if available.

**Note** Currently, it's not possible to build custom export templates on New Expensify, they can only be created on Expensify Classic. However, once built they will be available on New Expensify when exporting reports. [Learn how to build a custom export template in Expensify Classic](/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#create-a-custom-export-template).  

## How to download a report as a PDF

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**. 
2. Open the report you want to download.
3. Select **More**.
4. Select **Download as PDF**.

The PDF includes all expenses, attached receipts, and report notes. PDF downloads are only available for individual reports - they cannot be downloaded in bulk.

---

# FAQ

## Where do I find the exported CSV file?

For the Basic Export template, the file downloads directly to your device. For all other templates, Concierge sends the file to you in a direct message. Open your Concierge chat in the **Inbox** to find it.

## What is the difference between expense-level and report-level export templates?

- **Expense-level templates** (Basic Export, All Data - Expense Level Export) create one row per expense. Use these when you need detailed data for each individual expense.
- **Report-level templates** (All Data - Report Level Export) create one row per report with summary data. Use these when you need an overview of each report as a whole.

## Can I customize which columns appear in the CSV export?

If your Workspace Admin has created custom export templates, you can select one during export. Otherwise, columns follow the selected default template.

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
