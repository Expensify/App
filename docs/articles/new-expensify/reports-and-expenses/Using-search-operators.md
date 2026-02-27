---
title: "How to use search operators in Expensify"
description: "Learn how to use advanced search filters, comparisons, and groupings to find exactly what you need across expenses, chats, reports, and more."
keywords: "search operators, filters, search rules, expense search, report search, chat filters, advanced search, group-by, search syntax"
---

<div id="new-expensify" markdown="1">

The search operator framework lets you quickly filter, sort, and group items like expenses, chats, reports, and tasks using powerful text-based rules. This guide walks you through the supported syntax, available filters, and usage tips.

---

# Who can use search operators in Expensify

Anyone can use search operators when filtering data in features like Expenses, Reports, Chats, and Tasks. This is especially helpful for Workspace Admins, accountants, and finance teams looking to analyze or export targeted data.

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
- `has:` – attachment, receipt, category, tag
- `expense-type:` – cash, card, distance, per-diem
- `reimbursable:` and `billable:` – yes or no
- `attendee:` – expense attendees, e.g. `attendee:"Jason Mills"`
- `posted:` – credit card posted date, e.g. `posted:last-statement`

## Available filters for Reports

```
type:expense-report status:paid exported:never
```

- `report-id:` – unique report reference
- `status:` – draft, outstanding, approved, paid, done
- `submitted:` / `approved:` / `paid:` / `exported:` – supports absolute or relative dates
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

# Available filters for grouping and currency conversion

Use `group-by:` to analyze data by dimension, and `group-currency:` to normalize totals.

```
group-by:merchant group-currency:USD
```

Supported groupings include:

- `group-by:report`
- `group-by:from`
- `group-by:card`
- `group-by:withdrawal-id`
- `group-by:category` 

---

# FAQ

## Can I combine filters from different types?

Yes, but only when they make sense together. For example, combining `type:expense` with `merchant:` and `amount:` works, but mixing in `assignee:` (a task filter) won’t return results.

## What happens if I enter an invalid operator?

If the search operator isn’t recognized, the system will ignore it and return results based on any valid parts of the query.

## Do I need to use quotes for everything?

Only use quotes for values that include spaces or exact phrases, like `description:"client lunch"` or `in:"#general"`.

</div>
