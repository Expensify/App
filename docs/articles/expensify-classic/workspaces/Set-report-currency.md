---
title: Set report currency
description: Set a currency type for all expenses submitted under a workspace
---
<div id="expensify-classic" markdown="1">

Workspace Admins can choose a default currency for all expense reports submitted under that workspace. 

If you need different default currencies for different employees, you can [create group workspaces](https://help.expensify.com/articles/expensify-classic/workspaces/Create-a-group-workspace) for each location or region where the employees are based and configure different currency defaults for each workspace (in this case, you'll want the default currency to match the currency that the employees are reimbursed with). 

{% include info.html %}
You can set a default currency for group and individual workspaces. However, once a report is submitted to a group workspace, the group workspace's currency default takes precedence over an individual workspace default. 
{% include end-info.html %}

To set the report currency for a workspace, 

1. Hover over Settings and select **Workspaces**.
2. Select the desired workspace.
3. Click the **Reports** tab on the left.
4. Click the Report Output Currency dropdown menu to select the desired currency.

{% include faq-begin.md %}

**I have expenses in several currencies. How will this show up on a report?**

If you're traveling to foreign countries during a reporting period and making purchases in various currencies, each expense is imported with the currency of the purchase. On your expense report, Expensify will automatically convert each expense to the default report currency set for the workspace. 

**How are the expenses converted between different currencies?**

Expensify uses data from [Open Exchange Rates](https://openexchangerates.org/) to take the average rate on the day the expense occurred and convert the expense from one currency to another. The conversion rate can vary depending on when the expense was made, as the rate is determined after the market closes on that specific date. 

If the markets aren’t open on the day the expense takes place, Expensify uses the daily average rate from the last available market day before the purchase took place. When an expense is logged for a future date, we'll use the most recent available data. This means the report's value may change until the day the expense is made.

If you want to bypass the exchange rate conversion, you can manually enter an expense in your default currency instead.

{% include faq-end.md %}

</div>
