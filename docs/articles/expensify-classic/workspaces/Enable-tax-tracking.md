---
title: Enable tax tracking
description: Track expense taxes for a workspace or an expense category
---
<div id="expensify-classic" markdown="1">

Expensify’s tax tracking feature allows you to:
- Enable/disable taxes
- Add tax options, rates, and codes
- Set a default tax
- Create tax rates for specific workspaces or expense categories
- Set an additional default tax for foreign currency expenses
- Create a combined tax rates for expenses with multiple applied taxes

{% include info.html %}
If your group Workspace is connected to Xero, QuickBooks Online, Sage Intacct, or NetSuite, you must first enable tax by going to the Connections configuration settings for your workspace by hovering over Settings and selecting **Workspaces**, selecting your workspace, clicking **Connections**, then clicking **Configure** for the integration. Once enabled, sync the integration, and your tax rates will be imported from the accounting system.
{% include end-info.html %}

# Set workspace tax defaults

1. Hover over Settings and select **Workspaces**.
2. Select the desired workspace.
3. Click the **Tax** tab on the left.
4. Enable the tax toggle.
5. Below the toggle, enter a name for the tax and select an option for your Workspace and Foreign tax defaults.
   - To update the options available in the dropdown, edit the options at the bottom of the page or add new options by clicking **New Option**. Then you'll enter the name, tax value percentage, and tax code (if desired). 

# Set tax by expense category

1. Hover over Settings and select **Workspaces**.
2. Select the desired workspace.
3. Click the **Categories** tab on the left.
4. Click **Edit** next to the desired category.
5. Click the Default Tax dropdown and select the desired tax option. The selected tax rate will override the default workspace tax rate.

# Apply multiple tax rates

Some expenses may have multiple tax rates applied to them. In Canada, for example, expenses can have both a Federal GST and a provincial PST or QST. To handle these expenses in Expensify, you can create a single tax option that combines both taxes into a one effective tax rate. 

1. Hover over Settings and select **Workspaces**.
2. Select the desired workspace.
3. Click the **Tax** tab on the left.
4. Click **New Option** to create a new tax option.
5. Combine the two tax rates into a single tax rate and enter this new rate into the Value field. For example, if you have a GST of 5% and PST of 7%, adding the two tax rates together for a tax rate of 12%.

</div>
