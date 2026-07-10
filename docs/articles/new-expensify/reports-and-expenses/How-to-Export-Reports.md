---
title: How to Export Reports
description: Learn how to export reports to CSV or download them as PDFs.
keywords: [New Expensify, export reports, CSV export, PDF download, download report, report export template, bulk export reports, bulk PDF download, report data]
internalScope: Audience is all members. Covers exporting reports to CSV using export templates (individually and in bulk), and downloading reports as PDF (individually and in bulk). Does not cover exporting individual expenses from the Expenses page (see Export-Expenses.md), exporting to an accounting integration, or company card reconciliation.
---

# How to export reports 

Export reports to a CSV file using export templates, and download reports as PDFs.

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

## How to export the columns currently displayed using Export current view

Use **Export current view** to download a CSV that matches the columns currently shown on the **Reports** page, instead of a fixed export template.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Select **Display**, then select **Edit columns** to choose which columns appear on the page.
3. Select the checkbox next to each report you want to export, or use the top checkbox to select all.
4. Select **Selected** at the top.
5. Select **Export**.
6. Select **Export current view**.

The CSV uses the same columns displayed on the page. **Export current view** is not available when a **Group by** filter is applied.

## What export templates can I choose from? 

Expensify offers pre-built export templates, or you can build your own custom export template. All available templates will appear in the menu when you export a report. 

   - **Basic export** - Essential fields including date, amount, merchant, category, and receipt URL.
   - **All Data - expense level** - One row per expense on the report with all available data fields.
   - **All Data - report level** - One row per report with all available data fields.
   - **Custom templates** - Any custom template created by you or your Workspace Admin, if available.

**Note** Currently, it's not possible to build custom export templates on New Expensify, they can only be created on Expensify Classic. However, once built they will be available on New Expensify when exporting reports. [Learn how to build a custom export template in Expensify Classic](/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#create-a-custom-export-template).  

## How to download a single report as a PDF

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**. 
2. Open the report you want to download.
3. Select **More**.
4. Select **Download as PDF**.

The PDF includes all expenses, attached receipts, and report notes.

## How to download multiple reports as PDFs

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**. 
2. Select the checkbox next to each report you want to download, or use the top checkbox to select all.
3. Select **Selected** at the top.
4. Select **Download as PDF**.
5. Wait for the files to finish preparing, then select **Download file** to save them to your device. You can also select **Send me the file when it's ready** to have Concierge send the files to you in a chat message instead.

Each report downloads as its own PDF, including all expenses, attached receipts, and report notes.

---

# FAQ

## Where do I find the exported CSV file?

For the Basic Export template, the file downloads directly to your device. For all other templates, Concierge sends the file to you in a direct message. Open your Concierge chat in the **Inbox** to find it.

## What happens if some reports fail to download as PDFs?

When you download multiple reports as PDFs, a message tells you how many of the selected reports were exported. If any reports could not be generated, open your Concierge chat in the **Inbox** to see which reports failed.

## What is the difference between expense-level and report-level export templates?

- **Expense-level templates** (Basic Export, All Data - Expense Level Export) create one row per expense. Use these when you need detailed data for each individual expense.
- **Report-level templates** (All Data - Report Level Export) create one row per report with summary data. Use these when you need an overview of each report as a whole.

## Can I customize which columns appear in the CSV export?

Yes. Select **Export current view** to download a CSV that matches the columns currently shown on the **Reports** page. Adjust which columns appear by selecting **Display** > **Edit columns**. You can also select a custom export template during export, if your Workspace Admin has created one.

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
