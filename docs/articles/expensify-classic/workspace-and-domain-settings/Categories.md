---
title: Categories
description: Categories are used to classify and organize expenses
---
# Overview
Categories are commonly used to classify and organize expenses for both personal finances and business accounting.

The way Categories function will vary depending on whether or not you connect Expensify to a direct accounting integration (i.e., QuickBooks Online, NetSuite, etc.). 

When reviewing this resource, be sure to take a look at the section that applies to your account setup! 

# How to use Categories 
- When using an accounting integration, categories are your chart of accounts/ show in expense claims/etc. 
- You can have different categories for different workspaces.

# How to import Categories (no accounting integration connected)

## Add Categories via spreadsheet
If you need to import multiple categories at once, you can upload a spreadsheet of these parameters directly to Expensify. 

Before importing the category spreadsheet to Expensify, you'll want to format it so that it lists the Category name as well as any optional fields you'd like to include.

Required fields: 
- Category name
  
Optional fields: 
- GL Code
- Payroll code
- Enabled (TRUE/ FALSE)
- Max Expense amount
- Receipt Required
- Comments (Required/ Not Required)
- Comment Hint
- Expense Limit Type
  
Expensify supports the following file formats for uploading Categories in bulk:

- CSV
- TXT 
- XLS 
- XLSX
  
Once the spreadsheet is formatted, you can upload it to the workspace under **Settings > Workspace > Group >** *[Workspace Name]* **> Categories**.

From there, the updated Category list will show as available on all expenses submitted on the corresponding workspace. 

## Manually add Categories
If you need to add Categories to your workspace manually, you can follow the steps below. 

On web: 
1. Navigate to **Settings > Workspace > Group/Individual >** *[Workspace Name]* **> Categories**. 
2. Add new categories under **Add a Category**.
   
On mobile:
1. Tap the **three-bar menu icon** at the top left corner of the app.
2. Tap on **Settings** in the menu on the left side.
3. Scroll to the Workspace subhead and click on Categories listed underneath the default Workspace.
4. Add new categories by tapping the **+** button in the upper right corner. To delete a category, on iOS swipe left, on Android press and hold. Tap a category name to edit it.

## Add sub-categories
Sub-categories are useful when you want to be more specific, i.e. Travel could have a subcategory of airplane or lodging so the outcome would be Travel:airplane or Travel:lodging.

If you would like to create sub-categories under your category selection drop-down list, you can do so by adding a colon after the name of the desired category and then typing the sub-category (without spaces around the punctuation).

# How to import Categories with an accounting integration connected
If you connect Expensify to a direct integration such as QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite, then Expensify automatically imports the general ledger parameters from your accounting system as Categories.

When you first connect your accounting integration your categories will most likely be pulled from your chart of accounts, however this can vary depending on the account integration. 

If you need to update your categories in Expensify, you will first need to update them in your accounting system, then sync the connection in Expensify by navigating to **Settings > Workspace > Group >** _[Workspace Name]_ **> Connection > Sync Now**.

Alternatively, if you update the category details in your accounting integration, be sure to sync the workspace connection so that the updated information is available on the workspace. 

# Deep Dive

## Category-specific rules and description hints
If you're an admin using a workspace on a Control plan, you have the ability to enable specific rules for each category.

These settings are valuable if you want to set a special limit for a certain category. e.g. Your default expense limit is $2500 but Entertainment has a limit of $150 per person, per day. You can also require or not require receipts, which is great for allowing things like Mileage or Per Diems to have no receipt.

To set up Category Rules, go to **Settings > Workspace> Group >** _[Workspace Name]_ **> Categories**.

Then, click **Edit Rules** next to the category name for which you'd like to define a rule.

- **GL Code and Payroll Code**: These are optional fields if these categories need to be associated with either of these codes in your accounting or payroll systems. GL code will be automatically populated if connecting to an accounting integration.
- **Max Amount**: Allows you to set specific expense amount caps based on the expense category. Using **Limit type**, you can define this **per individual expense**, or **per day** (for expenses in a category on an expense report).
- **Receipts**: Allows you to decide whether you want to require receipts based on the category of the expense. For instance, it's common for companies to disable the receipt requirement for Toll expenses.
- **Description**: Allows you to decide whether to require the `description` field to be filled out based on the category of the expense.
- **Description Hint**: This allows you to place a hint in the `description` field. This will appear in light gray font on the expense edit screen in this field to prompt the expense creator to fill in the field accordingly.
- **Rule Enforcement**: If users are in violation of these rules, those violations will be shown in red on the report. Any category-specific violations will only be shown once a category has been selected for a given expense. 

## Make categories required
This means all expenses must be coded with a Category. If they do not have a category, there will be a violation on the expense which can prevent submission. 


## Update Category rules via spreadsheet
You can update Category rules en masse by exporting them to CSV, editing the spreadsheet, and then importing them back to the categories page.

This allows you to quickly add new categories and set GL codes, payroll codes, and description hints. This feature is only available for indirect integration setups. 

## Category approvers
Workspace admins can add additional approvers who must approve any expenses categorized with a particular category.

To configure category approvers:

1. Go to Settings > Workspace > Group > _[Select Workspace]_ > Categories
2. Click Edit Rules next to the category name that requires a category approver and use the "Approver" field
   
The expense will route to this Category approver, before following the approval workflow set up in the People table

## Auto-categorize card expenses with default categories

If you're importing card transactions, **Default Categorization** will provide a massive benefit to your company's workflow by **automatically coding** expenses to the proper GL.
- Once configured according to your GL, the default category will detect the type of merchant for an expense based on its Merchant Category Code (MCC) and associate that expense with the proper GL account. 
- This time-saver keeps employees from having to manually code expenses and provides admins with the peace of mind that the expenses coming in for approval are more reliably associated with the correct GL account. 
- Best of all, this works for personal and company cards alike!
  
## Setting up Default Categories

1. First, go to **Settings** and select the **group Workspace** that you want to configure.
2. Go to the **Categories** tab and scroll down to **Default Categories**.
3. Under the **Category** column, select the account that is most closely associated with the merchant group for all groups that apply to expenses that you and your coworkers submit. If you are unsure, just leave the group **Uncategorized** and the expense will not come in pre-categorized.
4. You're well on your way to expense automation freedom!
   
## Default Categories based on specific MCC codes

If you require more granular detail, the MCC Editor gives you even greater control over which MCC Codes are assigned to which Categories. The MCC Editor can be found just below the Default Categories table.

## Implicit categorization
Over time, Expensify will learn how you categorize certain merchants and then automatically apply that category to the same merchant in the future.

- You can always change the category; we'll try to remember that correction for next time!
- Any Expense Rules you have set up will always take precedence over implicit categories. 
- Implicit categorization will **only** apply to expenses if you have **not** explicitly set a category already.  Changing the category on one expense does not change it for any other expense that has an explicit category already assigned.
  
This built-in feature will only use the categories from the currently active workspace on your account. You can change the active workspace by clicking your account icon in the app and selecting the correct workspace name before you SmartScan.
  
## Category violations
Category violations can happen for the following reasons:

- An employee categorized an expense with a category not included in the workspace's categories. This would throw a "category out of workspace" violation.
- If you change your categories importing from an accounting integration, this can cause an old category to still be in use on an open report which would throw a violation on submission. Simply reselect a proper category to clear violation.

If Scheduled Submit is enabled on a workspace, expenses with category violations will not be auto-submitted unless the expense has a comment added.

# FAQ

## The correct category list isn't showing when one of my employees is categorizing their expenses. Why is this happening?
Its possible the employee is defaulted to their personal workspace so the expenses are not pulling the correct categories to choose from. Check to be sure the report is listed under the correct workspace by looking under the details section on top right of report. 

## Will the account numbers from our accounting system (QuickBooks Online, Sage Intacct, etc.) show in the Category list when employees are choosing what chart of accounts category to code their expense to?
The GL account numbers will be visible in the workspace settings when connected to a Control-level workspace for workspace admins to see. We do not provide this information in an employee-facing capacity because most employees do not have access to that information within the accounting integration. 
If you wish to have this information available to your employees when they are categorizing their expenses, you can edit the account name in your accounting software to include the GL number — i.e. **Accounts Payable - 12345**
