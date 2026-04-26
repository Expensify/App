---
title: How to use search operators in Expensify
description: Learn how to use advanced search filters, comparisons, and groupings to find exactly what you need across expenses, chats, reports, and more.
keywords: [New Expensify, search operators, filters, search rules, expense search, report search, chat filters, advanced search, group-by, view, chart, search syntax]
internalScope: Audience is all Expensify users. Covers search operator syntax for filtering, grouping, and chart views. Does not cover saved search management or Search page UI navigation.
---

The search operator framework lets you quickly filter, sort, and group items like expenses, chats, reports, and tasks using powerful text-based rules. This guide walks you through the supported syntax, available filters, and usage tips.

---

# Who can use search operators in Expensify

Anyone can use search operators when filtering data in features like expenses, reports, chats, and tasks. This is especially helpful for Workspace Admins, accountants, and finance teams looking to analyze or export targeted data.

---

# Key rules for using search operators

Here are the core rules and behaviors you’ll use across all filters:

- `field:value` is the basic format.
- Use commas for **OR**: `status:drafts,outstanding`.
- Chaining fields means **AND**: `amount>50 status:approved`.
- Use `-` to negate: `-has:receipt`.
- Add quotes for exact phrases: `description:"team lunch"`.
- Supports relative dates: `date:this-week`.
- Autocomplete kicks in after typing `:`.

---

# Type and type-agnostic filters

These filters help you refine searches across object types, workspaces, or user-specific data.

| **Syntax**       | **Description**                                                               | **Example**                  |
|------------------|-------------------------------------------------------------------------------|------------------------------|
| `type:`          | Filter by object type: `expense`, `chat`, `trip`, or `task`       | `type:expense`               |
| `workspace:`     | Filter by workspace name (wrap in quotes if the name has spaces)             | `workspace:"Acme Inc."`      |
| `from:`          | Filter by sender (email, phone, display name, or `me` for yourself)          | `from:alice@acme.com`        |
| `to:`            | Filter by recipient (email, phone, display name, or `me` for yourself)       | `to:me`                      |

**Note:** Quotes are required when filtering by names with spaces, such as `workspace:"Sales Team"`.

---

# Filters by type

## Available filters for Expenses

```
type:expense merchant:Starbucks category:Meals amount>20 has:receipt
```

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

## Available filters for Reports

- `report-id:` – unique report reference
- `status:` – draft, outstanding, approved, paid, done
- `submitted:` / `approved:` / `paid:` / `exported:` – supports absolute or relative dates, and comparisons for date ranges (e.g., `submitted>=2024-01-01 submitted<=2024-01-31`)
- `title:` – report title
- `total:` – total amount with relative comparisons
- `withdrawn:` – ACH withdrawal date
- `withdrawal-type:` – reimbursement or expensify-card
- `action:` – blocking report action, e.g. `action:approve`

## Available filters for Chat

```
type:chat in:"Concierge" is:unread
```

- `in:` – channel name or DM
- `has:` – attachment, link
- `is:` – unread, read, pinned
- `date:` – message timestamp

## Available filters for Tasks

```
type:task assignee:"Charlie Brown" status:outstanding
```

- `assignee:` – assigned member
- `status:` – outstanding, completed
- `description:` – task description
- `title:` – task title
- `in:` – channel name or DM for tasks

---

## How to use grouping, chart views, and currency conversion filters

Use `group-by:` to analyze data by dimension, `view:` to choose how grouped results are displayed, and `group-currency:` to normalize totals.

```
group-by:category view:bar group-currency:USD
```

Supported groupings include:

- `group-by:report` - Group by expense report
- `group-by:from` - Group by expense submitter (employee)
- `group-by:card` - Group by payment card
- `group-by:withdrawal-id` - Group by withdrawal ID
- `group-by:merchant` - Group by merchant or vendor
- `group-by:category` - Group by expense category
- `group-by:tag` - Group by expense tag
- `group-by:month` - Group by calendar month
- `group-by:week` - Group by calendar week
- `group-by:quarter` - Group by fiscal quarter
- `group-by:year` - Group by calendar year

## How to choose a chart view for grouped results

When using `group-by:`, you can add `view:` to control the visualization type. If you save a grouped search with a specific `view:`, that choice is preserved in the saved search label.

Supported views:

- `view:table` - Display grouped results as a table (default)
- `view:bar` - Display grouped results as a bar chart
- `view:pie` - Display grouped results as a pie chart
- `view:line` - Display grouped results as a line chart

> **Note:** The `view:` operator only applies when `group-by:` is also used. Without `group-by:`, the `view:` value is ignored.

---

# FAQ

## Can I combine filters from different types?

Yes, but only when they make sense together. For example, combining `type:expense` with `merchant:` and `amount:` works, but mixing in `assignee:` (a task filter) won’t return results.

## What happens if I enter an invalid operator?

If the search operator isn’t recognized, the system will ignore it and return results based on any valid parts of the query.

## Do I need to use quotes for everything?

Only use quotes for values that include spaces or exact phrases, like `description:"client lunch"` or `in:"#general"`.

