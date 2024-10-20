---
title: Apply Tax
description: How to apply taxes to expenses
---

{% include info.html %}
Before you can apply taxes to expenses, you must first [enable tax tracking](https://help.expensify.com/articles/expensify-classic/expenses/Track-taxes) for your workspace and set your default rates. 
{% include end-info.html %}

Once you've enabled tax tracking, your default tax rate is automatically applied to all expenses. 

- **If your workspace has multiple tax rates**, you'll have the option to change the tax rate from within the expense as needed.
- **If the tax amount doesn't show up on your receipt or is different** than the calculated amount, you can  manually type in the correct tax amount.

{% include faq-begin.md %}

## How do I set up multiple taxes (GST/PST/QST) for indirect connections?

Expenses sometimes have more than one tax applied to them (for example in Canada, expenses can have both a Federal GST and a provincial PST or QST). 

To handle multiple tax rates, you can create a new tax rate that combines both into a single rate. For example, if you have a GST of 5% and PST of 7%, you can add them together and create a new tax rate of 12%.

From the Reports page, you can generate a CSV containing all the expense information, including the split-out taxes by going to the Reports tab, clicking **Export To** and selecting **Tax Report**. 

# How do I handle the taxes for a receipt that includes more than one tax rate?

If your receipt includes more than one tax rate, there are two ways you can handle the tax rate:

- Many tax authorities do not require the reporting of tax amounts by rate; therefore, you can apply the highest rate on the receipt and then modify the tax amount on the receipt if necessary. Please check with your tax advisor to determine if this approach is appropriate for you.
- Alternatively, you can apply each specific tax rate by splitting the expense by the applicable expenses for each rate. To do this, open the expense and click **Split Expense**. Then apply the correct tax rate to each.

{% include faq-end.md %}
