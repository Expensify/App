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

1. In the navigation tabs on the left, select **Spend**.
2. Choose **Expenses** or **Reports**.
3. Select the expenses or reports you want to export, or **Select all**.
4. Click **Selected**.
5. Select **Export** from the dropdown.
6. Choose an export template.

What happens next depends on how you selected the items:
- **If you used Select all to select every matching item:** A **Preparing download** window appears while your file is generated, and the file downloads automatically to your device when it’s ready. If you’d rather not wait, select **Send me the file when it's ready**, and Concierge will message you the file in chat.
- **If you selected specific expenses or reports:** The file downloads to your device immediately, without the **Preparing download** window.

## Mobile

1. In the navigation tabs on the bottom, tap **Spend**.
2. Choose **Expenses** or **Reports**.
3. Long-press any expense or report, then tap **Select**.
4. Select the expenses or reports you want to export, or tap **Select all**.
5. Tap **Selected**, then choose **Export**.
6. Choose an export template.

# Export grouped expenses

When you group expenses on the **Spend** page, you can export the grouped results and the exported file keeps each group intact.

1. In the navigation tabs (on the left on web, and on the bottom on mobile), select **Spend** > **Expenses**.
2. Click **Display**, then select **Group by** and choose how to group your expenses (for example, **Category**, **Merchant**, **Tag**, or **Card**).
3. Click **Apply**.
4. Check the box next to the groups you want to export, or use the top checkbox to select all.
5. Click the selection button at the top (for example, **1 selected**).
6. Select **Basic export**.

In the exported file:
- Each group appears as its own section with a header row.
- The expenses in each group are listed below their group header.

> **Note:** If you expand the groups and select the individual expenses instead of the groups, each expense is exported as its own row without grouping.

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

It depends on how you selected the items:
- **Selected all matching items:** A **Preparing download** window appears while Expensify generates your file. The file downloads automatically when it’s ready, or select **Send me the file when it's ready** to have Concierge message it to you in chat instead.
- **Selected specific expenses or reports:** The file downloads to your device immediately, without the **Preparing download** window.

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

