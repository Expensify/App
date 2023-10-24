---
title: Expense Rules
description: Expense rules allow you to automatically categorize, tag, and report expenses based on the merchant's name.

---
# Overview
Expense rules allow you to automatically categorize, tag, and report expenses based on the merchant’s name.

# How to use Expense Rules 
**To create an expense rule, follow these steps:**
1. Navigate to **Settings > Account > Expense Rules**
2. Click on **New Rule**
3. Fill in the required information to set up your rule

When creating an expense rule, you will be able to apply the following rules to expenses:

![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_01.png){:width="100%"}

- **Merchant:** Updates the merchant name, e.g., “Starbucks #238” could be changed to “Starbucks”
- **Category:** Applies a workspace category to the expense
- **Tag:** Applies a tag to the expense, e.g., a Department or Location
- **Description:** Adds a description to the description field on the expense
- **Reimbursability:** Determines whether the expense will be marked as reimbursable or non-reimbursable
- **Billable**: Determines whether the expense is billable
- **Add to a report named:** Adds the expense to a report with the name you type into the field. If no report with that name exists, a new report will be created
  
## Tips on using Expense Rules
- If you'd like to apply a rule to all expenses (“Universal Rule”) rather than just one merchant, simply enter a period [.] and nothing else into the **“When the merchant name contains:”** field. **Note:** Universal Rules will always take precedence over all other rules for category (more on this below).
- You can apply a rule to previously entered expenses by checking the **Apply to existing matching expenses** checkbox. Click “Preview Matching Expenses” to see if your rule matches the intended expenses.
- You can create expense rules while editing an expense. To do this, simply check the box **“Create a rule based on your changes"** at the time of editing. Note that the expense must be saved, reopened, and edited for this option to appear.


![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_02.png){:width="100%"}


To delete an expense rule, go to **Settings > Account > Expense Rules**, scroll down to the rule you’d like to remove, and then click the trash can icon in the upper right corner of the rule:

![Insert alt text for accessibility here](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_03.png){:width="100%"}

# Deep Dive
In general, your expense rules will be applied in order, from **top to bottom**, i.e., from the first rule. However, other settings can impact how expense rules are applied. Here is the hierarchy that determines how these are applied:
1. A Universal Rule will **always** precede over any other expense category rules. Rules that would otherwise change the expense category will **not** override the Universal Rule.
2. If Scheduled Submit and the setting “Enforce Default Report Title” are enabled on the workspace, this will take precedence over any rules trying to add the expense to a report.
3. If the expense is from a Company Card that is forced to a workspace with strict rule enforcement, those rules will take precedence over individual expense rules.
4. If you belong to a workspace that is tied to an accounting integration, the configuration settings for this connection may update your expense details upon export, even if the expense rules were successfully applied to the expense.


# FAQ 
## How can I use Expense Rules to vendor match when exporting to an accounting package?
When exporting non-reimbursable expenses to your connected accounting package, the payee field will list "Credit Card Misc." if the merchant name on the expense in Expensify is not an exact match to a vendor in the accounting package.
When an exact match is unavailable, "Credit Card Misc." prevents multiple variations of the same vendor (e.g., Starbucks and Starbucks #1234, as is often seen in credit card statements) from being created in your accounting package.
For repeated expenses, the best practice is to use Expense Rules, which will automatically update the merchant name without having to do it manually each time. 
This only works for connections to QuickBooks Online, Desktop, and Xero. Vendor matching cannot be performed in this manner for NetSuite or Sage Intacct due to limitations in the API of the accounting package.


