---
title: Track Taxes
description: How to track taxes and apply them to expenses
---
Expensify's tax tracking allows you to create tax rates and codes for domestic and foreign currencies, and even for different expense categories. Once you've enabled tax tracking, your default tax rate is automatically applied to all expenses. 

# Tax Tracking - Connected to an accounting integration

If your Workspace is connected to Xero, QuickBooks Online, Sage Intacct, or NetSuite, you can run through the following steps to set up tax tracking:
1. Hover over **Settings**, then click **Workspaces**.
2. Click the desired workspace name.
3. Click the **Connections** tab on the left.
4. Click **Configure**.
5. Click **Sync Connection**. 

Your tax rates will be imported from the accounting system and indicated by its logo.

# Tax Tracking - Not connected to an accounting integration

If your Workspace is not connected to an accounting system, you can run through the following steps to set up tax tracking:
1. Hover over **Settings**, then click **Workspaces**.
2. Click the desired workspace name.
3. Click the **Tax** tab on the left.
4. Enable the toggle to allow taxes to be added to expenses.
5. You can modify the existing tax rate, or you can click New Option to add a new tax rate. For each tax rate, you can enable/disable them individually, add a specific name for the rate, add a percent value, and (if desired) add a unique tax code. 
6. Once you have your tax codes added, go to the top of the screen to enter the name that taxes will appear as on expenses. You'll also select which of your tax rates you will use as your defaults for expenses submitted under your workspace currency and foreign currency. 

## Track tax by expense category

You can also set tax rates for specific expense categories:
1. Hover over **Settings**, then click **Workspaces**.
2. Click the desired workspace name.
3. Click the **Categories** tab on the left.
4. Click **Edit** next to the desired category.
5. Click the Default Tax dropdown and select the desired tax rate.

This rate will be applied to all new expenses under this category, overriding the workspace's default currency tax rate.

{% include faq-begin.md %}

## How do I set up multiple taxes (GST/PST/QST) for indirect connections?

Expenses sometimes have more than one tax applied to them (for example in Canada, expenses can have both a Federal GST and a provincial PST or QST). 

To handle multiple tax rates, you can create a new tax rate that combines both into a single rate. For example, if you have a GST of 5% and PST of 7%, you can add them together and create a new tax rate of 12%.

From the Reports page, you can generate a CSV containing all the expense information, including the split-out taxes, by going to the Reports tab, clicking **Export To**, and selecting **Tax Report**. 

## How do I handle the taxes for a receipt that includes more than one tax rate?

If your receipt includes more than one tax rate, there are two ways you can handle the tax rate:

- Many tax authorities do not require the reporting of tax amounts by rate; therefore, you can apply the highest rate on the receipt and then modify the tax amount on the receipt if necessary. Please check with your tax advisor to determine if this approach is appropriate for you.
- Alternatively, you can apply each specific tax rate by splitting the expense by the applicable expenses for each rate. To do this, open the expense and click **Split Expense**. Then apply the correct tax rate to each.

## What if my workspace has multiple tax rates?

You'll have the option to change the tax rate from within the expense as needed.

## What should I do if the tax amount for my expense does not show up, or is it showing as a different amount than what I expected? 

In Expensify, tax is *inclusive*, meaning it's already part of the total amount shown. If the tax amount doesn't show up on your receipt or is different than the calculated amount, you can manually type in the correct tax amount.

To determine the inclusive tax from a total price that already includes tax, you can use the following formula:

**Tax amount = (Total price x Tax rate) ÷ (1 + Tax Rate)**

For example, if an item costs $100  and the tax rate is 20%:
Tax amount = (**$100** x .20) ÷ (1 + .**20**) = **$16.67**
This means the tax amount of $16.67 is included in the total.

If you are simply trying to calculate the price before tax, you can use the formula: 

**Price before tax = (Total price) ÷ (1 + Tax rate)**

{% include faq-end.md %}
