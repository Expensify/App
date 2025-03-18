---
title: Setting Up Report Currency
description: Define a currency in your workspace's settings
---

# Overview
As a workspace admin, you can choose a default currency for your employees' expense reports, and we’ll automatically convert any expenses into that currency. 

Here are a few things to remember:
- Currency settings for a workspace apply to all expenses under that workspace. If you need different default currencies for certain employees, creating separate workspaces and configuring the currency settings is best.
- As an admin, the currency settings you establish in the workspace will take precedence over any currency settings individual users may have in their accounts.
- Currency is a workspace-level setting, meaning the currency you set will determine the currency for all expenses submitted on that workspace. 

# Select the currency on a workspace

## As an admin on a group workspace

1. Sign into your Expensify web account
2. Go to **Settings > Workspaces > Group > _[Workspace Name]_> Reports > Report Basics**
3. Adjust the **Report Output Currency**

## On an individual workspace

1. Sign into your Expensify web account
2. Go to **Settings > Workspaces > Individual >_[Workspace Name]_> Reports > Report Basics**
3. Adjust the **Report Output Currency**

Please note the currency setting on an individual workspace is overridden when you submit a report on a group workspace.

## Conversion Rates

Using data from Open Exchange Rates, Expensify converts expenses from one currency to another using the average rate on the day the expense occurred. The conversion rate can vary depending on when the expense occurred since it is determined after the market closes on that specific date.

If the markets aren’t open on the day the expense takes place (i.e., on a Saturday), Expensify will use the daily average rate from the last available market day before the purchase took place. 

When an expense is logged for a future date, possibly to anticipate a purchase that has yet to occur, we'll use the most recent available data. This means the report's value may change up to the day of that expense.

## Managing expenses for employees in several different countries 

If you have employees scattered across the globe who submit expense reports in various currencies, the best way to manage those expenses is to create separate group workspaces for each location or region where your employees are based. 

Then, set the default currency for that workspace to match the currency in which the employees are reimbursed. 

For example, if you have employees in the US, France, Japan, and India, you’d want to create four separate workspaces, add the employees to each, and then set the corresponding currency for each workspace. 

{% include faq-begin.md %}

## I have expenses in several different currencies. How will this show up on a report?

If you're traveling to foreign countries during a reporting period and making purchases in various currencies, each expense is imported with the currency of the purchase.

On your expense report, Expensify will automatically convert each expense to the default currency set for the group workspace. 

## How does the currency of an expense impact the conversion rate?

Expenses entered in a foreign currency are automatically converted to the default currency on your workspace. The conversion uses the day’s average trading rate pulled from [Open Exchange Rates](https://openexchangerates.org/). 

If you want to bypass the exchange rate conversion, you can manually enter an expense in your default currency instead.

{% include faq-end.md %}
