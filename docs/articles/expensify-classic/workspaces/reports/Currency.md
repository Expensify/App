---
title: Currency
description: How currency works in Expensify and how to change the default currency in your Expensify workspace
---
# Overview

In this article, we’ll outline how to change the default currency in your account and how currency works in Expensify.
Expensify supports expenses in almost every currency in the world. Group workspace admins and individual workspace users can specify the desired output currency for employee reports. Expensify handles the currency conversion process.

# How to change your default currency

The default currency for all expenses added to your account is set by the primary company workspace. Just head to **Settings > Workspaces > Group > *[Workspace Name]* > Reports > Report Basics** and select your desired Report Currency.

If you are not using a group workspace, you can change your default currency under **Settings > Workspaces > Individual > *[Workspace Name]* > Reports** and then choose your desired Report Currency. Please note that the currency selected here will be overridden should you begin reporting on a group workspace.

# How currency works in Expensify

When totaling expenses across multiple currencies, we convert them to a single currency, which is the "report currency" of the report's expense workspace, or your personal output currency if no workspace is in use.

**Important notes:**

- Currency settings on a workspace are all-or-nothing. To reflect a different output currency in reports, create a new workspace for those employees and adjust the currency settings accordingly.
- Currency settings in the workspace take precedence over a user's individual account settings.

# How the conversion rate is determined
When converting expenses between currencies, we rely on [Open Exchange Rates](https://openexchangerates.org/) to determine the average bid and ask rate on the expense date. This rate becomes available after the market closes for that day, resulting in varying conversion rates depending on when the expense occurred and how the currencies were trading.

If the markets were closed on the expense date (e.g., weekends), we use the daily average rate from the last open market day prior to the purchase. For future-dated expenses, we use the most recent available data. Consequently, the report's value may fluctuate until the expense date, potentially leading to unexpected results. You cannot submit reports until the markets have closed for all the expense dates on the report.

To bypass exchange rate calculations, manually enter expenses in your default currency. These entries will only be converted when included in a report with a different default currency.

