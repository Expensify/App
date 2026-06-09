---
title: Export Expenses and Reports
description: Learn how to export your expenses and reports in CSV or PDF format using default or custom templates in New Expensify.
keywords: [New Expensify, export expenses, export reports, CSV export, PDF export, download reports, accounting integration, report templates, export grouped expenses, group by, grouped export, Basic export]
internalScope: Audience is members and admins. Covers exporting expenses and reports as CSV or PDF, does not cover accounting integration setup.
---


Expensify offers flexible options to search and export expenses and reports in various formats. You can export them directly to an accounting integration, as a CSV, or as a PDF—right from the web or mobile app.

# Export Options

- **Accounting integration**: Export directly to your connected accounting software.
- **CSV export**: Choose a default or custom template.
- **PDF export**: Download full reports, including receipts and notes.

> **Note:** You can export from both the web and mobile apps.

# Export as CSV

## Web

1. In the navigation tabs (on the left on web, and at the bottom on mobile) on the left, select **Spend** > **Reports**.
2. Check the box next to the expenses or reports you want to export, or use the top checkbox to select all.
3. Click **Selected** at the top.
4. Select **Export** from the dropdown.
5. Choose one of the following templates:
   - **Basic Export** – Simplified, essential fields (date, amount, merchant, category, receipt URL).
   - **All Data – Expense Level Export** – One row per expense with full data.
   - **All Data – Report Level Export** – One row per report with summary data.
   - **Custom Templates** – Any template created by you or your Workspace Admin (if available).

You’ll receive a message from **Concierge** with the exported file.

> **Note:** Report-level templates only appear if you select full reports (i.e., all expenses in the report).

## Mobile

1. In the navigation tabs (on the left on web, and at the bottom on mobile) at the bottom, select **Spend** > **Reports**.
2. Tap the three-line icon in the top-right corner.
3. Choose between **Reports** or **Expenses**.
4. Check the box next to the items you want to export, or use the top checkbox to select all.
5. Tap **Selected**, then choose **Export**.
6. Choose a default or custom export template as described above.

You’ll receive the export in a Concierge message.

> **Note:** Report-level templates only appear when full reports are selected.

# Export grouped expenses

When you group expenses on the **Spend** page, you can export the grouped results and the exported file keeps each group intact.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Spend** > **Expenses**.
2. Click **Display**, then select **Group by** and choose how to group your expenses (for example, **Category**, **Merchant**, **Tag**, or **Card**).
3. Click **Apply**.
4. Check the box next to the groups you want to export, or use the top checkbox to select all.
5. Click the selection button at the top (for example, **1 selected**).
6. Select **Basic export**.

In the exported file:
- Each group appears as its own section with a header row.
- The expenses in each group are listed below their group header.

> **Note:** If you expand the groups and select the individual expenses instead of the groups, each expense is exported as its own row without grouping.

<!-- SCREENSHOT:
Suggestion: The Spend > Expenses page with Group by set to Category and the "1 selected" button open showing Basic export
Location: After step 6 in the Export grouped expenses section
Purpose: Show users where the Group by control and the Basic export option appear when exporting grouped results
-->

# Export as PDF

1. Open the individual report you want to export.
2. Click **More** in the top-right corner.
3. Select **Download as PDF**.

The PDF will include:
- All expenses
- Attached receipts
- Report notes

# FAQ

## Can I export one line per report?

Yes, use the **All Data – Report Level Export** template. All other templates will export one line per expense.

## Can I keep my groups when I export?

Yes. Group your expenses using **Display** > **Group by**, select the groups, then choose **Basic export**. The exported file keeps each group as its own section with the expenses listed below their group header.

## Can I export in PDF or XLS format?

- **CSV/XLS** – Available for raw expense data.
- **PDF** – Available for full reports only.

## Can I download individual expenses as a PDF?

No, PDF export is only available for full reports.

## Can I customize the columns in the CSV export?

No, the columns follow a fixed template.

## How do I export to an accounting integration?

Ensure your workspace is connected to a supported accounting platform. [Click here](https://docs.expensify.com) for connection instructions.

## How do I receive my export?

- **Basic Export**: Downloads immediately to your device.
- **All other templates**: Concierge will send the export file to you via direct message.

## Can I export expenses or reports in bulk?

- **CSV export**: Yes, select multiple or all items.
- **PDF export**: Must be downloaded one at a time.

## Why do I see a 404 error when clicking a receipt URL?

Make sure you're logged into your Expensify account in the same browser when clicking the receipt link.

## The data looks wrong in Excel. How can I fix it?

- Long IDs may appear in scientific notation. To avoid this:
  1. Open Excel and go to **File > Import**.
  2. Select your CSV and follow the prompts.
  3. Format the report/transaction ID column as **Text**.

## Why do the numbers look incorrect in the export?

Switch your spreadsheet program's formatting to **Plain Text** or **Number format** to prevent scientific notation (e.g., `1.79e+308`).

## Why are leading zeros missing in my export?

Excel may remove them automatically. To prevent this:
1. Open Excel and go to **File > Import**.
2. Select your CSV.
3. Set columns with leading zeros to **Text format**.

