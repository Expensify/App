---
title: Use Search Operators to Filter and Analyze
description: Learn how to use search operators, filters, and grouping to find, organize, and analyze expenses, chats, reports, and tasks in Expensify.
keywords: [New Expensify, search operators, advanced filters, search rules, expense search, report search, chat filters, advanced search, group-by, view, chart, search syntax]
internalScope: Audience is all Expensify members. Covers search operator syntax for filtering, grouping, and chart views. Does not cover saved search management or Search page UI navigation.
---

# Use Search Operators to Filter and Analyze

Search operators let you quickly filter, sort, and group results across expenses, chats, reports, and tasks using powerful text-based queries. These operators work like advanced filters, helping you narrow results, combine conditions, and analyze data directly from the search bar.

This guide walks you through the supported syntax, available filters, and usage tips.

---

## Who can use search operators in Expensify

Anyone can use search operators when filtering data in features like expenses, reports, chats, and tasks. This is especially helpful for Workspace Admins, accountants, and finance teams looking to analyze or export targeted data.

---

## How to build a search query with search operators

Use these core rules to create your searches:

- Use `field:value` as the basic format.
- Use commas for **OR** conditions: `status:drafts,outstanding`.
- Combine fields for **AND** conditions: `amount>50 status:approved`.
- Use `-` to exclude results: `-has:receipt`.
- Use quotes for exact phrases: `description:"team lunch"`.
- Relative dates are supported: `date:this-week`.
- Start typing after `:` to see autocomplete suggestions.

---

## How to filter results across expenses, chats, reports, and tasks

Use these operators to refine results across different types:

| **Syntax**       | **Description**                                                               | **Example**                  |
|------------------|-------------------------------------------------------------------------------|------------------------------|
| `type:`          | Filter by object type (`expense`, `chat`, `trip`, `task`)       | `type:expense`               |
| `workspace:`     | Filter by workspace name (wrap in quotes if the name has spaces)             | `workspace:"Acme Inc."`      |
| `from:`          | Filter by sender (email, phone, display name, or `me`)          | `from:alice@acme.com`        |
| `to:`            | Filter by recipient (email, phone, display name, or `me`)       | `to:me`                      |

**Note:** Quotes are required when filtering by names with spaces, such as `workspace:"Sales Team"`.

---

## How to filter expenses using search operators

You can use the following operators to filter expenses:

- `merchant:` – expense merchant name
- `category:` – expense category label
- `tag:` – tag or multiple tags
- `amount:` / `purchase-amount:` – supports `=`, `>`, `<`, `>=`, `<=`
- `status:` – unreported, draft, outstanding, approved, paid, done
- `date:` – expense date, supports relative dates like `date:this-month`, `date:last-month`, `date:year-to-date`, `date:this-week`. Also supports comparisons (`date>=2024-01-01 date<=2024-01-31`) for date ranges
- `has:` – attachment, receipt, category, tag
- `expense-type:` – cash, card, distance, per-diem
- `reimbursable:` and `billable:` – yes or no
- `attendee:` – expense attendees, e.g. `attendee:"Jason Mills"`
- `posted:` – credit card posted date, e.g. `posted:last-statement`

**Example query:**
`type:expense merchant:Starbucks category:Meals amount>20 has:receipt`

---

## How to filter reports using search operators

You can use the following operators to filter reports:

- `report-id:` – unique report reference
- `status:` – draft, outstanding, approved, paid, done
- `submitted:` / `approved:` / `paid:` / `exported:` – supports absolute or relative dates, and comparisons for date ranges (e.g., `submitted>=2024-01-01 submitted<=2024-01-31`)
- `title:` – report title
- `total:` – total amount with relative comparisons
- `withdrawn:` – ACH withdrawal date
- `withdrawal-type:` – reimbursement or expensify-card
- `action:` – blocking report action, e.g. `action:approve`

**Example query:**
`status:paid exported<=2026-01-01`

---

## How to filter chats using search operators

You can use the following operators to filter chats:

- `in:` – channel name or DM
- `has:` – attachment, link
- `is:` – unread, read, pinned
- `date:` – message timestamp

**Example query:**
`type:chat in:"Concierge" is:unread`

---

## How to filter tasks using search operators

You can use the following operators to filter tasks:

- `assignee:` – assigned member
- `status:` – outstanding, completed
- `description:` – task description
- `title:` – task title
- `in:` – channel name or DM for tasks

**Example query:**
`type:task assignee:"Charlie Brown" status:outstanding`

---

## How to group and visualize results using search operators

Use these operators to analyze and visualize your results:

- `group-by:` groups results by a specific dimension  
- `view:` controls how grouped results are displayed  
- `group-currency:` converts totals into a single currency  

**Normalize totals using `group-currency:`**

Use `group-currency:` to convert all grouped amounts into a single currency for easier comparison. This is helpful when your data includes multiple currencies.

Supported values include standard ISO currency codes such as:
- `USD`
- `EUR`
- `GBP`
- `CAD`
- `AUD`

**Example search:**  
`type:expense group-by:category group-currency:USD`

---

**Group results by dimension**

Supported grouping options include:

- `group-by:report` – Group by report  
- `group-by:from` – Group by submitter  
- `group-by:card` – Group by card  
- `group-by:withdrawal-id` – Group by withdrawal ID  
- `group-by:merchant` – Group by merchant  
- `group-by:category` – Group by category  
- `group-by:tag` – Group by tag  
- `group-by:month` – Group by month  
- `group-by:week` – Group by week  
- `group-by:quarter` – Group by quarter  
- `group-by:year` – Group by year
  
---

## How to choose a chart view for grouped results

When using `group-by:`, you can add `view:` to control the visualization type.

Supported views:

- `view:table` - table (default)
- `view:bar` - bar chart
- `view:pie` - pie chart
- `view:line` - line chart

> **Note:** The `view:` operator only applies when `group-by:` is also used. Without `group-by:`, the `view:` value is ignored.

---
## How to build reports using search operators

You can create report-style views similar to Insights by combining filters, grouping, date ranges, and chart views.

Here are some common examples:

- **Top categories (bar chart)**  
  `type:expense group-by:category date:last-month view:bar`

- **Top spenders (table)**  
  `type:expense group-by:from date:last-month view:table`

- **Spend over time (line chart)**  
  `type:expense group-by:month date:year-to-date view:line`

- **Last month category breakdown (pie chart)**  
  `type:expense group-by:category date:last-month view:pie`

- **Custom date range (table)**  
  `type:expense date>=2026-01-01 date<=2026-01-31 group-by:category view:table`

These searches update in real time and can be refined further using additional filters. You can save frequently used searches to reuse them later by clicking **Save search** in the search bar.

For more advanced dashboards and exports, learn how to use [Insights in Expensify](/articles/new-expensify/insights/How-to-Use-Insights-in-Expensify).

---
# FAQ

## Can I combine filters from different types?

Yes, but only when they make sense together. For example, combining `type:expense` with `merchant:` and `amount:` works, but mixing in `assignee:` (a task filter) won’t return results.

## What happens if I enter an invalid operator?

If the search operator isn’t recognized, the system will ignore it and return results based on any valid parts of the query.

## Do I need to use quotes for everything?

Only use quotes for values that include spaces or exact phrases, like `description:"client lunch"` or `in:"#general"`.

