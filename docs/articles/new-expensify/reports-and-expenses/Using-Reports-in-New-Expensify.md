---
title: Using Reports in New Expensify
description: Learn how to use Reports in New Expensify to search, filter, customize columns, and save reports for expenses, invoices, trips, and chats.
keywords: [Reports, New Expensify, report filters, search commands, custom columns, saved reports, invoices, expenses, chats, trips, reimbursement tracking, view expenses, customize report view, reporting table columns]
---

<div id="new-expensify" markdown="1">

Use **Reports** in New Expensify to view and manage expenses, invoices, trips, and chats. You can search with keywords, apply filters, customize columns, and save reports to reuse later.

---

# Where to find Reports in New Expensify

- **Web:** Go to the **Reports** tab in the navigation on the left.
- **Mobile:** Tap **Reports** in the navigation tabs on the bottom.

You can also open Reports from the search icon in the top-right corner.

---

# What you can view in Reports

Reports includes the following types of data:

- **Expenses**
- **Invoices**
- **Trips**
- **Chats**

Each type has its own filters and search options.

---

# How to filter Reports

Use filters to narrow down results by type, status, category, or date.

1. Go to the **Reports** tab.
2. (Optional) Enter a keyword in the search bar.
3. Choose a type tab—**Expenses**, **Invoices**, **Trips**, or **Chats**.
4. Tap **Filters**.
5. Select filters such as:
   - **Expenses:** Draft, Approved, Paid
   - **Invoices:** Outstanding, Paid
   - **Trips:** Draft, Upcoming, In Progress, Past
6. Tap **Apply** to see the filtered results.

---

# How to customize columns in Reports

On web, you can choose which columns are visible when viewing Reports. This allows you to focus on the data that matters and reduces the need for CSV exports.

1. Go to the **Reports** tab on web.
2. Run a search or apply filters (optional).
3. Click the **Columns** icon (next to Filters).
4. Use checkboxes to show or hide columns.
5. Drag and drop columns to change their order.
6. Close the column picker to update the view.

Column settings are saved automatically:
- They persist per search and saved report
- They carry over to shareable report links
- At least one column must remain selected

You can choose from column options such as:

- **Expense-level columns:** Merchant, Card type, Posted date, Expense date
- **Report-level columns:** Status, Report name, Workspace
- **Available for both:** Reimbursement, Amount, Tax

**Note:** Custom columns are available on **web only**. On mobile, Reports display in card view.

---

# How to use search commands in Reports

You can enter search commands in the search bar to run more advanced queries.

## Examples for employees

- Draft expenses:  
  `type:expense status:drafts from:"you@domain.com"`

- Approved cash expenses:  
  `type:expense status:approved expense-type:cash from:"you@domain.com"`

## Examples for Workspace Admins

- All Meals & Entertainment expenses:  
  `type:expense category:"Meals & Entertainment"`

- Unapproved expenses:  
  `type:expense status:unapproved`

- Approved expenses not reimbursed:  
  `type:expense status:approved`

- Card spend from December 2024:  
  `type:expense expense-type:card posted>=2024-12-01 posted<=2024-12-31`

---

# How to save a report

1. Run a search with filters or search commands.
2. Tap **Filters**, then select **Save Report**.
3. Enter a name, or use the suggested one.

To view saved reports:
- **Web:** Go to the **Saved** section in the left-hand sidebar.
- **Mobile:** Tap the **Type** dropdown at the top and select **Saved**.

To rename or delete a saved report, tap the ⋮ menu next to it.

---

# Report types

## Expenses

- Filter by status (Draft, Approved, Paid)
- Search by merchant or category
- Use to find unsubmitted or reimbursed expenses

## Invoices

- Filter by status (Outstanding, Paid)
- Search by client, due date, or amount
- View invoice history and payment status

## Trips

- Filter by status (Draft, Upcoming, In Progress, Past)
- Search by location, dates, or traveler
- View trip details and related expenses

## Chats

- Filter by Unread, Draft, or All
- Search by participant or keyword
- Locate messages that reference expenses or reports

---

# FAQ

## Why can’t I see some advanced filters?
Advanced filters are enabled incrementally. If a filter isn’t visible, ensure that your workspace or account settings support the relevant feature (e.g., categories, statuses).

## Why are my mobile and desktop report experiences slightly different?
Expensify ensures cross-platform consistency where possible. However, certain features — like customizable columns — are only available on web to support larger screen layouts.

## How do I find unsubmitted reports?
1. Go to the **Reports** page.
2. Select **Expenses** from the Type-based filter.
3. Apply the **Draft** contextual filter to view all unsubmitted reports.

## Can I change which columns appear in my reports?
Yes! You can choose which columns to show or hide in the **Reports** and **Expenses** views on web. Use the **Columns** icon to customize your table layout.

## Can I reorder the columns?
Absolutely. Just drag and drop the columns in the order you prefer within the **Columns** settings panel.

## Can I save different column views?
Yes. Each saved search stores your column layout, filters, and sorting preferences. You can save multiple versions for different workflows.

## What happens if I hide all columns?
You must keep at least one column visible. If you try to hide all columns, the app will keep one selected to avoid rendering an empty table.

## Are custom columns available on mobile?
No. The mobile experience uses a simplified card layout and does not support customizable columns.
