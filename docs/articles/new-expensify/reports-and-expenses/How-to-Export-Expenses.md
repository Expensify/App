---
title: How to Export Expenses
description: Learn how to export expenses from the Expenses page to CSV using default or custom export templates in New Expensify.
keywords: [New Expensify, export expenses, CSV export, download expenses, expense export template, bulk export expenses, expense data]
internalScope: Audience is all members. Covers exporting expenses from the Expenses page to CSV using export templates, both individually and in bulk. Does not cover exporting reports to CSV or PDF (see Export-Reports.md), exporting to an accounting integration, or company card reconciliation.
---

# How to export expenses

Export expenses from the Expenses page using export templates to download a CSV file.

If you’re trying to export a specific type of data, use the guides below: 
 - Expensify Card expenses: [View and Reconcile Expensify Card Expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses).
 - Company card expenses: [Statement Matching and Reconciliation](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation).
 - Full expense reports: [How to Export Reports](/articles/new-expensify/reports-and-expenses/How-to-Export-Reports). 

## How to export a single expense

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend** > **Expenses**.
2. Open the expense you want to export.
3. Select **More**.
4. Select **Export**.
5. Choose an export template from the menu that appears. 

You'll receive the exported CSV file in a message from Concierge.

## How to export multiple expenses

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend** > **Expenses**.
2. Select the checkbox next to each expense you want to export, or use the top checkbox to select all.
3. Select **Selected** at the top.
4. Select **Export**.
5. Choose an export template from the menu that appears. 

You'll receive the exported CSV file in a message from Concierge.

---

## What export templates can I choose from? 

Expensify offers pre-built export templates, or you can build your own custom export template. In New Expensify, **any available export template can be used at the expense level** — there is no restriction limiting certain template types to reports only.

   - **Basic export** - Essential fields including date, amount, merchant, category, and receipt URL.
   - **All Data - expense level** - One row per expense with all available data fields.
   - **Custom templates** - Any custom template created by you or your Workspace Admin, if available.

**Note:** This differs from Expensify Classic, where some template types are only available when exporting from a report. In New Expensify, every available template — including templates custom-built by Expensify — appears in the menu when you export an expense, which is useful for flat-file imports into another system such as your accounting software.

**Note:** Currently, it's not possible to build custom export templates on New Expensify, they can only be created on Expensify Classic. However, once built they will be available on New Expensify when exporting expenses. [Learn how to build a custom export template in Expensify Classic](/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#create-a-custom-export-template).

## Where do I find the exported file?

For the Basic Export template, the file downloads directly to your device. For all other templates, Concierge sends the file to you in a direct message. Open your Concierge chat in the **Inbox** to find it.

## Can I customize which columns appear in the export?

If your Workspace Admin has created custom export templates, you can select one during export. Otherwise, columns follow the selected default template.

## Why don't I see certain export templates?

Report-level templates (such as All Data - Report Level Export) only appear when exporting from the **Spend > Reports** page with full reports selected, because those templates produce a row per report. All other template types — including custom export templates built in Expensify Classic — are available from both the **Reports** and **Expenses** views.

If all selected expenses are deleted, only the **Basic export** template is available. Other export templates require a report, and deleted expenses are not associated with any report.

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
