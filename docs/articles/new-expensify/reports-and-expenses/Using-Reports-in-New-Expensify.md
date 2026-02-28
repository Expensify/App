---
title: Using Reports in New Expensify
description: Learn how to use Reports in New Expensify to search, filter, customize columns, and save reports for expenses, invoices, trips, and chats.
keywords: [Reports, New Expensify, report filters, search commands, custom columns, saved reports, group expenses, invoices, expenses, chats, trips, reimbursement tracking, view expenses, customize report view, reporting table columns]
---

<div id="new-expensify" markdown="1">

Use the **Reports** tab in New Expensify to view and manage expenses, invoices, trips, chats, and more. You can search with keywords, apply filters, customize columns, and save searches to reuse later.

---

# Where to find Reports in New Expensify

- **Web:** Go to the **Reports** tab in the navigation on the left.
- **Mobile:** Tap **Reports** in the navigation tabs at the bottom.

You can also open **Reports** by clicking the magnifying glass icon in the top-right corner.

---

# What you can view in Reports

Reports includes the following types of data:

- **Expenses**
- **Expense Reports**
- **Chats**
- **Invoices**
- **Trips**
- **Tasks**

Each type has its own filters and search options.

---

# How to filter Reports

Filter reports by type, status, category, or date to find specific information.

1. Go to the **Reports** tab.
2. Enter a keyword in the search bar (optional). 
3. Choose a type tab - **Expense**, **Expense Report**, **Chat**, **Invoice**, **Trip**, or **Task**.
4. Click **Filters**.
5. Select filters such as:
   - **Date:** This month, last month
   - **Status:** Outstanding, Paid
   - **From:** You, or someone else
6. Click **View Results** to see the filtered results.

![Reports page showing available report filtering options]({{site.url}}/assets/images/Filter-reports.png){:width="100%"}
---

## How to customize the Reports column view 

On the web, you can customize which columns appear when viewing **Reports** or **Expenses**. This helps surface key details and tailor the view to your workflow.

To customize columns:

1. Go to the **Reports** tab on the left (web only).
2. Run a search or apply filters if needed.
3. Click the **Columns** icon (next to **Filters**).
4. Use the checkboxes to show or hide specific columns.
5. Drag and drop columns to rearrange their order.
6. Click **Save** to save your column layout.

You can choose from a wide range of columns, including:

- **Date** – When the report or expense was created
- **Submitted** – The date the report was submitted for approval
- **Total** – The total amount of the report or expense
- **Workspace** – The workspace the report belongs to
- **Action** – Shows available actions like approve or reject

To view the full list of available columns, click the **Columns** icon in the **Reports** tab.

---

# How to group expenses by category or tag using Report Layout

Report Layout lets you group expenses inside a report to make reviews faster and easier.

To group expenses:

1. Open a report that contains more than one expense.
2. Click the **More** icon (three dots) in the top-right corner of the report.
3. Select **Group by category**, **Group by tag**, or **Don’t group**.

Your selected layout will be remembered and applied to other reports you view.

# How to use Reports search query commands

Use search commands in the search bar to run advanced queries based on specific fields. 

## Examples for employees

Below are some example queries you can use depending on your role:

- Draft expenses:  
  `type:expense status:draft from:you@domain.com`

- Approved cash expenses:  
  `type:expense status:approved expense-type:cash from:you@domain.com`

## Examples for Workspace Admins

- All Meals & Entertainment expenses:  
  `type:expense category:Meals & Entertainment`

- Unapproved expenses:  
  `type:expense status:unapproved`

- Approved expenses not reimbursed:  
  `type:expense status:approved`

- Card spend from December 2024:  
  `type:expense expense-type:card posted>=2024-12-01 posted<=2024-12-31`

---

# How to save a search

1. Run a search with filters or search commands.
2. Click **Filters**, then select **Save report**.
3. Enter a name, or use the suggested one.

To view saved searches:

- **Web:** Go to the **Saved** section in the left-hand sidebar.
- **Mobile:** Tap the **Type** dropdown at the top and select **Saved**.

To rename or delete a saved search, click the three dots next to it.

---

# Report types

Each report type has specific filters and search tools for finding the information you need. 

## Expenses

- Filter by status: Unreported, Draft, Outstanding, Approved, Paid, or Done
- Search by merchant, category, or tag
- Helpful for tracking unsubmitted or reimbursed expenses

## Expense Reports

- Filter by status: Draft, Outstanding, Approved, Paid, or Done
- Search by submitter or workspace
- Ideal for surfacing reports that need approval or reimbursement

## Chats

- Filter by: Unread, Draft, or All
- Search by participant or keyword
- Helps you find conversations linked to expenses, reports, or actions

## Invoices

- Filter by status: Outstanding or Paid
- Search by client, due date, or amount
- Great for reviewing invoice history and payment status

## Trips

- Filter by status: Current or Past
- Search by location, travel dates, or traveler
- Use to view trip details, scheduled travel, and related expenses

## Tasks

- Filter by: Outstanding or Completed
- Search by assignee or keyword
- Use for tracking open setup steps or action items

---

# FAQ

## Why can’t I see some filters?
Filters are enabled incrementally. If a filter isn’t visible, ensure that your workspace or account settings support the relevant feature (e.g., categories, statuses).

## Why are my mobile and desktop report experiences slightly different?
Expensify ensures cross-platform consistency where possible. However, certain features (like customizable columns) are only available on web for larger screen layouts.

## How do I find unsubmitted reports?
1. Go to the **Reports** tab.
2. Select **Expense** from the Type filter.
3. Apply the **Draft** filter to view all unsubmitted reports.

## Can I change which columns appear in my reports?
Yes! You can choose which columns to show or hide in the **Reports** and **Expenses** views on web. Use the **Columns** icon to customize your table layout.

## Can I reorder the columns?
Absolutely. Just drag and drop the columns in the order you prefer within the **Columns** settings panel.

## Can I save different column views?
Yes. Each saved search stores your column layout, filters, and sorting preferences. You can save multiple versions for different workflows.

## Are custom columns available on mobile?
No. The mobile experience uses a simplified card layout and does not support customizable columns.
