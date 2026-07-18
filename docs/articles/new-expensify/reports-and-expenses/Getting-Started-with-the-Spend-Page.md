---
title: Getting Started with the Spend Page
description: Learn how to use the Spend page in New Expensify to view, filter, and manage your expense data using report previews, tables, filters, and smart suggestions.
keywords: [New Expensify, Spend page, report preview, report table, filters, advanced filters, smart suggestions, expense management, add expenses, bulk actions, date range, search, expenses missing, Spend navigation, inline editing, edit expense inline, filter popover, apply filters, reset filters]
---

The Spend page in New Expensify gives you a full list of your reports and related expenses. From the Spend page you can explore, filter, and export your expense data.

---

# Report Previews

Report previews are summaries shown directly in your workspace chat in the **Inbox**. They let you quickly check a report’s status without opening it.

## Visibility of Report Previews
- Visible to **all members** in the workspace chat.
- Only the **report creator** sees interactive options like **Add expense**.  
- **Workspace admins** can approve and pay reports, as well as reject and hold reports.

## Preview Details
- Report title and status (e.g., Approved, Paid)  
- Up to 10 expense previews with:
  - Date, category, tag
  - Merchant or description
  - Receipt thumbnail  
- Carousel navigation  
- **+X more** link if there are over 10 expenses  
- Action button: Submit, Approve, Pay, etc., depending on the role

## Preview Behavior and Updates

  - Updates in **real time** as expenses are added.
  - If a report is deleted, the preview is removed.
  - Comments on a report create a **Comments** section within the preview, and the layout will adjust to include room for the discussion.

---

# Report Tables

The **Report table** is the list view inside a report. It works like a built-in spreadsheet for all expenses on that report.

## Table structure and fields
Each row represents an expense and includes:
- Merchant name
- Date
- Amount
- Category
- Description
- Tags (if enabled)

## Available Actions on the Table
- **Click an expense** to view or edit it in the right-hand panel  
- **Edit a cell directly (desktop only):** Hover over a **date**, **merchant**, **description**, **category**, **tag**, or **amount** cell (or use the Tab key to move to it), then click the pencil edit icon that appears to edit the value inline without opening the expense details. Click outside the cell or press Enter to save. Clicking anywhere else in the cell opens the expense instead.
- **Select multiple expenses** using checkboxes, then apply bulk actions such as:
  - **Move to another report:** When you need to have multiple reports or need to break up expenses across multiple weeks or months.
  - **Download:** For exporting to a CSV file for analysis or to share with your accountant.
  - **Hold:** Use this when you need to temporarily pause the approval of an expense until all required information is provided.
  - **Delete:** To remove expenses from the expense report.

**Note:** The bulk action menu appears after selecting at least one expense.

## How to move expenses between reports

**From the report table**

1. Select the expense(s) using checkboxes.
2. Click **Move to report** from the bulk action menu.
3. In the right-hand panel, select from the following options:
   - Create report
   - An existing draft report
   - Remove from report 
5. Expenses are moved, and a system message logs the action.

**From the expense details**

1. Click the expense to edit it in the right-hand panel.
2. Click **Move to report** from the bulk action menu.
3. In the right-hand panel, select from the following options:
   - Create report
   - An existing draft report
   - Remove from report 
5. Expense is moved, and a system message logs the action.

## How to add a new expense to the table
- The expense appears in the table.  
- Its row is briefly highlighted as new.  
- Once added, the **Submit** button appears in the header (replacing **Add expense**, which moves to the **More** menu).

---

# Filters

## How to apply filters in New Expensify

Web:

1. In the navigation tabs on the left, click **Spend**.
2. Click **Filters**.
3. Click **Type** and select **Expense**, **Expense Report**, **Chat**, **Invoice**, **Trip**, or **Task**.
5. Select the filters you want to apply. Available filters vary based on the selected **Type**.

Selected filter values are applied to the list immediately.

Mobile:

1. In the navigation tabs on the bottom, tap **Spend**. 
2. Tap the **Filters** icon next to the search box. 
3. Tap **Type** and select **Expense**, **Expense Report**, **Chat**, **Invoice**, **Trip**, or **Task**.
4. Tap **Save**.
5. Select the filters you want to apply. Available filters vary based on the selected **Type**.
6. Tap **Save** after selecting each filter.
7. Tap **View Results**. 

For more advanced filtering, you can enter search operators directly into the search box on the **Spend** page. [Learn how to use search operators to filter and analyze](/articles/new-expensify/reports-and-expenses/Use-Search-Operators-to-Filter-and-Analyze).

## How filtering works on the Spend page

1. Apply filters to view only the results that match your criteria.
2. Once filters are applied:
   - The list updates in real time  
   - The **Select all** option applies *only* to the filtered results—not everything

You can also combine filters with a keyword search for even more precision. For example, searching **"Uber in March"** will show only Uber rides from March.

**Note**: If no filters are applied, the page defaults to showing all your unreported expenses.

## How to export from the Spend page

The **Current view** option within the **Export** menu lets you download a CSV of exactly what you're currently seeing on the Spend page—your active filters, column configuration, and ordering are all preserved. The exported file is named `Expensify_<current_view>_<unique id>.csv`. Once you initiate the export, you can choose to wait for the download to finish or have **Concierge** send it to you once it's ready.

For more detail on every export method, see [how to export from the Spend page](/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses).

---

# Smart Suggestions

## How to use Smart Suggestions

Smart suggestions recommend the next best action based on your activity.

## Where Smart Suggestions appear

- **SelfDM**: Suggests unreported expenses to add to a report.
- **Empty draft reports**: Prompts you to add recent unreported expenses.
- **Global create/quick actions**: Suggests creating a report if you frequently submit grouped expenses.

## How Smart Suggestions help you report faster

If you create a draft report and have unreported expenses in your SelfDM, a prompt may appear to add those expenses quickly. Smart Suggestions also: 

- Reduce manual effort  
- Encourage on-time reporting  
- Help new members take the right actions

---

# FAQ

## Can I export reports from the Spend page?
Yes! Choose the **Current view** option within the **Export** menu to download a CSV of exactly what you're seeing—your active filters, columns, and ordering are all preserved. You can also use a template-based export for a standard set of columns. Learn more about [exporting from the Spend page](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses).

## Do smart suggestions work on mobile?
Yes, smart suggestions also appear in the mobile Inbox and draft reports.

## When do report previews update?
Previews update **in real time** as expenses are added or removed. Deleted reports are removed from the chat preview.

## Can someone comment on a report?
Yes. When someone comments, a Comments section appears in the preview, and the layout adjusts to accommodate the discussion.

