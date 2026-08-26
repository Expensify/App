---
title: Use Search Operators to Filter and Analyze
description: Learn how to use search operators, filters, and grouping to find, organize, and analyze expenses, chats, reports, and tasks in Expensify.
keywords: [New Expensify, search operators, advanced filters, search rules, expense search, report search, chat filters, advanced search, group-by, view, chart, search syntax, bank account filter, custom field, international reimbursement IDs]
internalScope: Audience is all Expensify members. Covers search operator syntax for filtering, grouping, and chart views. Does not cover saved search management or Search page UI navigation.
---

# Use Search Operators to Filter and Analyze

Search operators let you quickly filter, sort, and group results across expenses, chats, reports, and tasks using powerful text-based queries. These operators work like advanced filters, helping you narrow results, combine conditions, and analyze data directly from the search bar.

This guide walks you through the supported syntax, available filters, and usage tips.

---

## Who can use search operators in Expensify

Anyone can use search operators when filtering data in features like expenses, reports, chats, and tasks. This is especially helpful for Workspace Admins, accountants, and finance teams looking to analyze or export targeted data.

---

## Where to enter search operators in Expensify

Enter search operators in the search bar that opens from the **Search** icon.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend**.
2. Select the **Search** icon in the top-right corner.
3. Type your query using search operators. Start typing after `:` to see autocomplete suggestions.

The search bar on the **Spend** page filters your current results by keyword only. Anything you type there is matched as a keyword, even if it looks like an operator. To filter with operators, open the search bar from the **Search** icon.

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

| **Syntax** | **Description** | **Example** |
|---|---|---|
| `merchant:` | Filter by expense merchant name | `merchant:"Delta Air Lines"` |
| `category:` | Filter by expense category label | `category:"Travel"` |
| `tag:` | Filter by one or multiple tags | `tag:"Client A"` |
| `amount:` / `purchase-amount:` | Filter by amount using `=`, `>`, `<`, `>=`, or `<=` | `amount:>100` |
| `status:` | Filter by expense status (`unreported`, `draft`, `outstanding`, `approved`, `paid`, `done`) | `status:approved` |
| `date:` | Filter by expense date using relative dates or comparison operators for a date range | `date:this-month` |
| `has:` | Filter by expenses with an `attachment`, `receipt`, `category`, `tag`, or `submitted-violation` | `has:receipt` |
| `expense-type:` | Filter by expense type (`cash`, `card`, `distance`, `per-diem`) | `expense-type:card` |
| `receipt-type:` | Filter by receipt type (`ereceipt`, `itemized`) | `receipt-type:itemized` |
| `reimbursable:` | Filter by whether an expense is reimbursable (`yes` or `no`) | `reimbursable:yes` |
| `billable:` | Filter by whether an expense is billable (`yes` or `no`) | `billable:no` |
| `attendee:` | Filter by expense attendee using an email, phone number, display name, or `me` | `attendee:"Jason Mills"` |
| `posted:` | Filter by the date a credit card expense was posted | `posted:last-statement` |
| `bank-account:` | Filter by the settlement bank account an expense was reimbursed from. Start typing after the colon to choose an account, shown by bank name and last four digits. Available only when you have at least one bank account. | `bank-account:"Chase xx1234"` |

**Example queries:**
- `type:expense merchant:Starbucks category:Meals amount>20 has:receipt`
- `type:expense -has:tag` – find expenses that have no tag assigned

---

## How to filter reports using search operators

You can use the following operators to filter reports:

| **Syntax** | **Description** | **Example** |
|---|---|---|
| `report-id:` | Filter by unique report reference | `report-id:123456789` |
| `status:` | Filter by report status (`draft`, `outstanding`, `approved`, `paid`, `done`) | `status:approved` |
| `submitted:` / `approved:` / `paid:` / `exported:` | Filter by the corresponding date using absolute or relative dates, or comparison operators for a date range | `submitted>=2024-01-01 submitted<=2024-01-31` |
| `exported-to:` | Filter by where reports or expenses were exported, such as a connected accounting integration | `exported-to:QuickBooks` |
| `title:` | Filter by report title | `title:"January Expenses"` |
| `total:` | Filter by report total using relative comparisons | `total:>1000` |
| `amount-debited:` | Filter by the amount the company was debited when a report was reimbursed across currencies, in the settlement currency. Supports `=`, `>`, `<`, `>=`, `<=` | `amount-debited:>1000` |
| `amount-reimbursed:` | Filter by the amount the member was reimbursed when a report was paid across currencies, in their deposit account's currency. Supports `=`, `>`, `<`, `>=`, `<=` | `amount-reimbursed:>1000` |
| `withdrawn:` | Filter by ACH withdrawal date | `withdrawn:2024-01-15` |
| `withdrawal-type:` | Filter by withdrawal type (`reimbursement`, `expensify-card`, `central-travel-invoicing`) | `withdrawal-type:reimbursement` |
| `paid-status:` | Filter by how the report was paid (`markedAsPaid`, `withdrawing`, `confirmed`). Combine multiple values with commas | `paid-status:markedAsPaid,confirmed` |
| `action:` | Filter by blocking report action | `action:approve` |
| `submitter-user-id:` | Filter by the Custom field 1 value set for the report submitter | `submitter-user-id:12345` |
| `submitter-payroll-id:` | Filter by the Custom field 2 value set for the report submitter | `submitter-payroll-id:67890` |
| `order-deal-numbers:` | Filter by international reimbursement IDs on the report | `order-deal-numbers:123456` |

**Example query:**
`status:paid exported<=2026-01-01 exported-to:xero`

---

## How to filter chats using search operators

You can use the following operators to filter chats:

| **Syntax** | **Description** | **Example** |
|---|---|---|
| `in:` | Filter by channel name or direct message | `in:"General"` |
| `has:` | Filter by chats with an `attachment` or `link` | `has:attachment` |
| `is:` | Filter by chat status (`unread`, `read`, `pinned`) | `is:unread` |
| `date:` | Filter by message timestamp | `date:this-week` |

**Example query:**
`type:chat in:"Concierge" is:unread`

---

## How to filter tasks using search operators

You can use the following operators to filter tasks:

| **Syntax** | **Description** | **Example** |
|---|---|---|
| `assignee:` | Filter by assigned member using an email, phone number, display name, or `me` | `assignee:me` |
| `status:` | Filter by task status (`outstanding`, `completed`) | `status:outstanding` |
| `description:` | Filter by task description | `description:"Submit expenses"` |
| `title:` | Filter by task title | `title:"Review report"` |
| `in:` | Filter by the channel name or direct message associated with a task | `in:"General"` |

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

Use `group-by:` to group results by a specific dimension.

| **Syntax** | **Description** | **Example** |
|---|---|---|
| `group-by:report` | Group results by report | `type:expense group-by:report` |
| `group-by:from` | Group results by submitter | `type:expense group-by:from` |
| `group-by:card` | Group results by card | `type:expense group-by:card` |
| `group-by:withdrawal-id` | Group results by withdrawal ID | `type:expense group-by:withdrawal-id` |
| `group-by:merchant` | Group results by merchant | `type:expense group-by:merchant` |
| `group-by:category` | Group results by category | `type:expense group-by:category` |
| `group-by:tag` | Group results by tag | `type:expense group-by:tag` |
| `group-by:month` | Group results by month | `type:expense group-by:month` |
| `group-by:week` | Group results by week | `type:expense group-by:week` |
| `group-by:quarter` | Group results by quarter | `type:expense group-by:quarter` |
| `group-by:year` | Group results by year | `type:expense group-by:year` |
  
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

- **Violations by submitter (table)**  
  `type:expense group-by:from submitted:last-month has:submitted-violation sort-by:group-expenses sort-order:desc view:table limit:10`

- **Spend over time (line chart)**  
  `type:expense group-by:month date:year-to-date view:line`

- **Last month category breakdown (pie chart)**  
  `type:expense group-by:category date:last-month view:pie`

- **Custom date range (table)**  
  `type:expense date>=2026-01-01 date<=2026-01-31 group-by:category view:table`

These searches update in real time and can be refined further using additional filters. You can save frequently used searches to reuse them later by clicking **Save** in the search bar.

For more advanced dashboards and exports, learn how to use [Insights in Expensify](/articles/new-expensify/insights/How-to-Use-Insights-in-Expensify).

---
# FAQ

## Can I combine filters from different types?

Yes, but only when they make sense together. For example, combining `type:expense` with `merchant:` and `amount:` works, but mixing in `assignee:` (a task filter) won’t return results.

## What happens if I enter an invalid operator?

If the search operator isn’t recognized, the system will ignore it and return results based on any valid parts of the query.

## Do I need to use quotes for everything?

Only use quotes for values that include spaces or exact phrases, like `description:"client lunch"` or `in:"#general"`.
