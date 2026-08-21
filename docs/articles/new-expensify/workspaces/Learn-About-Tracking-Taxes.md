---
title: Learn about Tracking Taxes
description: Learn how tax tracking works in Expensify, including how tax rates are applied to expenses and what information is recorded for VAT, GST, HST, and other taxes.
keywords: [tax tracking, VAT, GST, HST, expense tax, tax rates, how tax works, tax amount, tax on expenses]
internalScope: Audience is Workspace Admins and Members. Covers how tax tracking works in Expensify, including tax rates, default tax settings, category-based tax rules, and receipt scanning. Does not cover setup, configuration, troubleshooting, or accounting integrations.
contentType: topic
platform: new-expensify
---

# Learn about Tracking Taxes

Tracking Taxes helps organizations record taxes such as VAT, GST, and HST on expenses. When Taxes is enabled in a Workspace, Expensify applies tax rates to expenses and tracks the tax amount included in each expense.

Tax in Expensify is always included in the expense total rather than added on top.

To configure Taxes on a workspace, [learn how to enable Taxes](/articles/new-expensify/workspaces/Track-Taxes). 

## How tax tracking works in Expensify

Taxes uses Workspace tax settings to determine which tax rate should apply to an expense.

When an expense is created, Expensify determines which tax rate should apply and calculates the tax amount associated with that expense. The selected tax rate and tax amount are shown on the expense and can be used for reporting and accounting exports.

For example, if a receipt total is £120 and includes £20 VAT, the expense amount remains £120 while the tax amount is recorded separately as £20.

## How tax rates are applied to expenses

When Taxes is enabled, Expensify automatically applies a tax rate to each expense.

Workspace Admins can define:

- A **Workspace currency default** tax rate, which applies to expenses in the Workspace currency
- A **Foreign currency default** tax rate, which applies to expenses in other currencies

Workspaces can also create more specific rules to apply tax rates based on expense details.

These include:

- **Category default tax rates**, which apply a tax rate when an expense is coded with a specific category
- **Workspace merchant rules**, which apply a tax rate when an expense matches a particular merchant
- **Distance tax rates**, which apply a tax rate when a specific Distance rate is used

When a rule applies, it overrides the Workspace default tax rate.

## Related articles

 - [Learn how to configure Category tax rules](/articles/new-expensify/workspaces/Create-expense-categories#how-to-configure-category-rules). 
 - [Learn how to configure tax rates for Distance expenses](/articles/new-expensify/reports-and-expenses/Distance-Expenses)
 - [Learn how to configure Workspace Merchant Rules for tax rates](/articles/new-expensify/workspaces/Workspace-Merchant-Rules#how-to-create-workspace-merchant-rules).
