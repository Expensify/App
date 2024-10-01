---
title: Create categories
description: Use categories to classify and organize expenses
---

<div id="expensify-classic" markdown="1">

Categories can help you classify expenses by expense type. For example, Expensify automatically provides default categories like fees, office supplies, travel, and more. 

You can choose to enable, disable, or edit the default Expensify categories, or you can add or import your own custom categories. You can also add subcategories underneath existing categories.

# Enable, disable, or edit default categories 

Once you have manually added your categories or automatically imported them from a connected accounting system, you can enable or disable the categories to determine whether they can be added to expenses.

{% include info.html %}
Importing GL & payroll codes from your accounting system is only available on the Control plan.
{% include end-info.html %}

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Categories** tab on the left. 
5. Enable, disable, edit, or delete any category as desired.
   - **To enable/disable**: Click the toggle to the left of the category. Or to enable or disable all of the categories, use the toggle at the top of the toggle column.
   - **To edit**: Click the category name and type in the new name. 
   - **To delete**: Click the X to the right of the category.

# Add custom categories

## Automatic import with accounting integration

Expensify automatically imports your expense-related general ledger accounts as categories when you use an accounting integration (for example, QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite).

To update your categories in Expensify, you must first update the category in your accounting system. Then in Expensify, 

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Connections** tab on the left. 
5. Click **Sync Now**.

## Manually add individual categories

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Categories** tab on the left. 
5. Scroll down to the bottom of the Categories section to the Add a Category field.
6. Type the name for your new category into the field and click **Add**.  

## Import custom categories

You can add a list of categories by importing them in a .csv, .txt, .xls, or .xlsx spreadsheet.

1. Create your categories spreadsheet with at least a column containing the category name. However, you can also add any of the following fields:
   - GL Code
   - Payroll code
   - Enabled (TRUE/ FALSE)
   - Max Expense amount
   - Receipt Required
   - Comments (Required/ Not Required)
   - Comment Hint
   - Expense Limit Type
2. In Expensify, hover over Settings, then click **Workspaces**. 
3. Click the **Group** tab on the left. 
4. Click the desired workspace name. 
5. Click the **Categories** tab on the left.  
6. Click **Import from Spreadsheet**.
7. Review the guidelines, select the checkbox if your file has headers as the first row, and click **Upload File**. 

{% include info.html %}
Each time you upload a list of categories, it will override your previous list. To avoid losing categories, update your current spreadsheet and re-import it into Expensify.
{% include end-info.html %}

# Add subcategories

You can create subcategories under a main category. For example, if you have a category for travel that you want flight and lodging to fall under, you can create them as subcategories.

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Categories** tab on the left. 
5. Scroll down to the bottom of the Categories section to the Add a Category field.
6. Type the name for your main category into the field, followed by a colon, then add the name of the subcategory and click **Add**. For example, to make a Flight subcategory under Travel, you'll enter “Travel: Flight”. Repeat this step for each subcategory.

The new subcategories will show up as a dropdown list under the category when an expense is created. The text before the colon will show as the category header (which will not be selectable). The member will have to select an item from the subcategories to add it to the expense.

</div>

