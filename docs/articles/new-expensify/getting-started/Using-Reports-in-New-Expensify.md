---
title: Using Reports in New Expensify
description: Discover how to leverage New Expensify's advanced Reports feature for financial data management and expense tracking.
---
<div id="new-expensify" markdown="1">

Expensify's Reports feature introduces a powerful way to access and manage financial data across the platform. Focusing on resolving previous inefficiencies, Reports offers enhanced filtering, expanded search capabilities, and improved user experience across devices.

## Main Uses

- **Find specific transactions or expenses** - Easily locate individual expenses or invoices, such as a Starbucks receipt or unpaid invoices.
- **Analyze spending patterns** - Use Reports to search by categories like "Meals & Entertainment" to review spending over a specific period.
- **Streamline accounting processes** - Simplify month-end tasks by locating unsubmitted or unapproved reports.

## Core Users

- **Sole proprietors and employees** - Access personal transaction data quickly.
- **Managers and finance teams** - Review team expenses and monitor unapproved reports.
- **Accountants** - Simplify data discovery and improve efficiency in managing financial records.

## Key Advantages

- **Advanced filtering options** - Customize report results with filters for categories, statuses, and dates.
- **Cross-platform consistency** - Enjoy a seamless experience across desktop and mobile platforms.
- **Saved reports** - Save and revisit frequently used report queries for recurring tasks.

![A photo of the Reports page]({{site.url}}/assets/images/ExpensifyHelp-Reports-1-v2.png){:width="100%"}

---

# Report Filters

Expensify’s report filters help users narrow down results to find specific data. Filters include:

- **Type-based filters** - Categorize data by expenses, invoices, trips, and chats.
- **Contextual filters** - Further refine results based on the selected type. For example:
  - Expenses: Outstanding, Approved, Paid
  - Invoices: Outstanding, Paid
  - Trips: Drafts, Upcoming, In Progress, Past
- **Advanced filters** - Enable precise reports using query syntax (e.g., `type:expenses status:approved`).

![A photo of common report filter]({{site.url}}/assets/images/ExpensifyHelp-SearchFormat.png){:width="100%"}

---

# Search Format

Using this search format allows you to define complex report parameters using simple text commands. 

## Popular Searches for Employees

- **Reports I need to submit:** `type:expense status:drafts from:"employee@yourdomain.com"`
- **Expenses that haven’t been paid back yet:** `type:expense status:approved from:"employee@yourdomain.com" expense-type:cash`

## Popular Searches for Admins

- **Search by category (e.g., all "Meals & Entertainment" expenses):** `type:expenses category:"Meals & Entertainment"`
- **Locate unapproved reports:** `status:unapproved`
- **Unapproved employee expenses:** `type:expense status:outstanding`
- **Unpaid employee expenses:** `type:expense status:approved`
- **All card spend from December 2024:** `type:expense status:all expense-type:card posted<=2024-12-31 posted>=2024-12-01`

## Access Search Commands:
- **Option 1:** Click Reports at the bottom of the left-hand navigation bar.
- **Option 2:** Click the magnifying glass in the upper-right corner.

---

# Reports Overview by Type

## Expenses – Quickly Locate Your Expense Details
Advanced filtering options in the Reports feature allow you to locate specific expenses without unnecessary scrolling or manual searches.

**Use Filters To:**
- View expenses by status, such as **Drafts**, **Outstanding**, or **Paid**.
- Search for expenses by category (e.g., "Meals & Entertainment") or merchant (e.g., "Starbucks").
- Analyze unapproved expenses to manage pending reimbursements or approvals efficiently.

---

## Chats – Access Specific Conversations Instantly
Your communication history is always accessible in one place, helping you stay organized and responsive.

**Features Include:**
- Search for specific messages by keyword or participant.
- Filter chats by **Unread**, **Drafts**, or **All** to focus on relevant discussions.
- Quickly locate conversations with links, attachments, or references to expenses and reports.

---

## Invoices – View and Manage Invoices Effortlessly
The Invoices section of Reports provides a streamlined way to handle billing. 

**Key Functionalities:**
- View invoices by status, such as **Outstanding** or **Paid**.
- Filter invoices to locate specific client transactions quickly.
- Access detailed invoice data, including amounts, due dates, and payment statuses.

---

## Trips – Navigate to Trip-Related Data with Ease
The Trips section in Reports helps you stay on top of travel-related information:

**Features Include:**
- Filter trips by status, such as **Drafts**, **Upcoming**, **In Progress**, or **Past**.
- Search for trip details using destination, dates, or traveler names.
- Access hybrid reports for trips with multiple bookings to get a complete view of expenses and itineraries.

---

# Using Filters

To refine report results using filters:
1. Press the **Reports** icon (🔍) to open the report router.
2. Enter a keyword or phrase in the search bar.
3. Select a **Type-based filter** (e.g., Expenses, Invoices) from the tab bar.
4. Tap **Filters** to view advanced filtering options.
5. Customize your report by applying filters such as category, status, or date.
6. Press **Apply** to see the refined results.

---

# Saving Reports

Save frequently used report queries for quick access:
1. Perform a report query using the report router and filters.
2. Tap **Save Report** in the Filters menu.
3. Name the report or use the default name based on the query syntax.
4. Access saved reports:
   - On desktop: In the **Saved** section of the left-hand menu.
   - On mobile: In the **Type** button menu at the top of the page.
5. Rename or delete a saved report using the three-dot menu next to the report.

---

# FAQ

## Why can’t I see some advanced filters?
Advanced filters are enabled incrementally. If a filter isn’t visible, ensure that your workspace or account settings support the relevant feature (e.g., categories, statuses).

## Why are my mobile and desktop report experiences slightly different?
Expensify ensures cross-platform consistency where possible. However, certain features, like the layout of filters or saved reports, are optimized for device-specific usability.

## How do I find unsubmitted reports?
Use the following steps to locate unsubmitted reports:
1. Go to the **Reports** page.
2. Select **Expenses** from the Type-based filter.
3. Apply the **Drafts** contextual filter to view all unsubmitted reports.
