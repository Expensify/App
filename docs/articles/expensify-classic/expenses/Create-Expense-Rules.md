---
title: Create Expense Rules
description: Automatically categorize, tag, and report expenses based on the merchant's name
---

Expense rules allow you to automatically categorize, tag, and report expenses based on the merchant’s name.

# Create expense rules 

1. Hover over **Settings** and click **Account**. 
2. Click **Expense Rules**.
2. Click **New Rule**.
3. Add what the merchant name should contain in order for the rule to be applied. *Note: If you enter just a period, the rule will apply to all expenses regardless of the merchant name. Universal Rules will always take precedence over all other expense rules.*
4. Choose from the following rules:
- **Merchant:** Updates the merchant name (e.g., “Starbucks #238” could be changed to “Starbucks”)
- **Category:** Applies a workspace category to the expense
- **Tag:** Applies a tag to the expense (e.g., a Department or Location)
- **Description:** Adds a description to the description field on the expense
- **Reimbursability:** Determines whether the expense will be marked as reimbursable or non-reimbursable
- **Billable**: Determines whether the expense is billable
- **Add to a report named:** Adds the expense to a report with the name you type into the field. If no report with that name exists, a new report will be created if the "Create report if necessary" checkbox is selected. 

![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_01.png){:width="100%"}
  
{:start="6"}
6. (Optional) To apply the rule to previously entered expenses, select the **Apply to existing matching expenses** checkbox. You can also click **Preview Matching Expenses** to see if your rule matches the intended expenses.

# How rules are applied

In general, your expense rules will be applied in order, from **top to bottom**, (i.e., from the first rule). However, other settings can impact how expense rules are applied. Here is the hierarchy that determines how these are applied:

1. A Universal Rule will **always** be applied over any other expense category rules. Rules that would otherwise change the expense category will **not** override the Universal Rule.
2. If Scheduled Submit and the setting “Enforce Default Report Title” are enabled on the workspace, this will take precedence over any rules trying to add the expense to a report.
3. If the expense is from a company card that is forced to a workspace with strict rule enforcement, those rules will take precedence over individual expense rules.
4. If you belong to a workspace that is tied to an accounting integration, the configuration settings for this connection may update your expense details upon export, even if the expense rules were successfully applied to the expense.

# Create an expense rule from changes made to an expense

If you open an expense and change it, you can then create an expense rule based on those changes by selecting the “Create a rule based on your changes" checkbox. *Note: The expense must be saved, reopened, and edited for this option to appear.*

![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_02.png){:width="100%"}

# Delete an expense rule

To delete an expense rule, 

1. Hover over **Settings** and click **Account**.
2. Click **Expense Rules**.
3. Scroll down to the rule you’d like to remove and click the trash can icon.

![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_03.png){:width="100%"}

{% include faq-begin.md %} 

## How can I use expense rules to vendor match when exporting to an accounting package?

When exporting non-reimbursable expenses to your connected accounting package, the payee field will list "Credit Card Misc." if the merchant name on the expense in Expensify is not an exact match to a vendor in the accounting package. When an exact match is unavailable, "Credit Card Misc." prevents multiple variations of the same vendor (e.g., Starbucks and Starbucks #1234, as is often seen in credit card statements) from being created in your accounting package.

For repeated expenses, the best practice is to use Expense Rules, which will automatically update the merchant name without having to do it manually each time. This only works for connections to QuickBooks Online, Desktop, and Xero. Vendor matching cannot be performed in this manner for NetSuite or Sage Intacct due to limitations in the API of the accounting package.

{% include faq-end.md %}
