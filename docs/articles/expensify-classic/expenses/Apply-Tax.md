---
title: Apply Tax
description: This is article shows you how to apply taxes to your expenses!
---

<!-- The lines above are required by Jekyll to process the .md file -->

# About

There are two types of tax in Expensify: Simple Tax (i.e. one tax rate) and Complex Tax (i.e. more than one tax rate). This article shows you how to apply both to your expenses!


# How-to Apply Tax

When Tax Tracking is enabled on a Workspace, the default tax rate is selected under **Settings > Workspace > _Workspace Name_ > Tax**, with the default tax rate applied to all expenses automatically. 

There may be multiple tax rates set up within your Workspace, so if the tax on your receipt is different to the default tax that has been applied, you can select the appropriate rate from the tax drop-down on the web expense editor or the mobile app. 

If the tax amount on your receipt is different to the calculated amount or the tax rate doesn’t show up, you can always manually type in the correct tax amount.


{% include faq-begin.md %}

## How do I set up multiple taxes (GST/PST/QST) on indirect connections?
Expenses sometimes have more than one tax applied to them - for example in Canada, expenses can have both a Federal GST and a provincial PST or QST. 

To handle these, you can create a single tax that combines both taxes into a single effective tax rate. For example, if you have a GST of 5% and PST of 7%, adding the two tax rates together gives you an effective tax rate of 12%.

From the Reports page, you can select Reports and then click **Export To > Tax Report** to generate a CSV containing all the expense information, including the split-out taxes.

## Why is the tax amount different than I expect?

In Expensify, tax is *inclusive*, meaning it's already part of the total amount shown.

To determine the inclusive tax from a total price that already includes tax, you can use the following formula:

### **Tax amount = (Total price x Tax rate) ÷ (1 + Tax Rate)**

For example, if an item costs $100  and the tax rate is 20%:
Tax amount = (**$100** x .20) ÷ (1 + .**20**) = **$16.67**
This means the tax amount $16.67 is included in the total.

If you are simply trying to calculate the price before tax, you can use the formula: 

### **Price before tax = (Total price) ÷ (1 + Tax rate)**

# Deep Dive

If you have a receipt that has more than one tax rate (i.e. Complex Tax) on it, then there are two options for handling this in Expensify!

Many tax authorities do not require the reporting of tax amounts by rate and the easiest approach is to apply the highest rate on the receipt and then modify the tax amount to reflect the amount shown on the receipt if this is less. Please check with your local tax advisor if this approach will be allowed.

Alternatively, you can apply each specific tax rate by splitting the expense into the components that each rate will be applied to. To do this, click on **Split Expense** and apply the correct tax rate to each part.

{% include faq-end.md %}
