---
title: Expense Rules
description: Automatically categorize, tag, and report expenses based on the merchant's name.
keywords: [Expense Rules, individual automation, expense rule setup, personal rules, Classic, reimbursement settings]
---

Expense rules in Expensify help automate the categorization, tagging, and reporting of expenses based on merchant names, reducing manual work. By setting up these rules at the account level, employees can streamline expense management and ensure consistency across reports.

---

# Create an Expense Rule  

1. Hover over **Settings** and click **Account**.  
2. Click **Expense Rules**.  
3. Click **New Rule**.  
4. In the **Merchant Name Contains** field, enter part of the merchant name that should trigger the rule.  
   - **Note:** If you enter only a period (`.`), the rule applies to all expenses. Universal Rules take precedence over all other expense rules.  
5. Select the rules to apply when a matching expense is detected:  
   - **Merchant:** Standardizes the merchant name (e.g., "Starbucks #238" → "Starbucks").  
   - **Category:** Assigns a workspace category to the expense.  
   - **Tag:** Adds a tag (e.g., Department or Location).  
   - **Description:** Updates the description field of the expense.  
   - **Reimbursability:** Marks the expense as reimbursable or non-reimbursable.  
   - **Billable:** Flags the expense as billable.  
   - **Add to a report named:** Assigns the expense to a specific report. If **Create report if necessary** is selected, a new one is created if the report does not exist.  

![Fields to create a new expense rule, including the characters a merchant's name should contain for the rule to apply, as well as what changes should be applied to the expense including the merchant name, category, tag, description, reimbursability, whether it is billable, and what report it will be added to.](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_01.png){:width="100%"}
  

6. (Optional) Select **Apply to existing matching expenses** to update past expenses.  
7. Click **Preview Matching Expenses** to check if the rule applies correctly.  

---

# How Rules Are Applied  

Expense rules are processed from **top to bottom** in the list. However, other settings may override them. The rule hierarchy is:  

1. **Universal Rules** always override other expense category rules.  
2. **Scheduled Submit** with **Enforce Default Report Title** enabled takes precedence over expense rule-based report assignments.  
3. **Company Card Rules** for enforced workspaces take priority over individual expense rules.  
4. **Accounting Integrations** may override expense rule settings when expenses are exported.  

---

# Create an Expense Rule from an Edited Expense  

If you modify an expense manually, you can create a rule based on those changes:  

1. Open the expense.  
2. Make the necessary edits.  
3. Select **Create a rule based on your changes** before saving.  
   - **Note:** The option appears only after saving, reopening, and editing an expense.  

![The "Create a rule based on your changes" checkbox is located in the bottom right corner of the popup window, to the left of the Save button.](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_02.png){:width="100%"}

---

# Delete an Expense Rule  

1. Hover over **Settings** and click **Account**.  
2. Click **Expense Rules**.  
3. Find the rule you want to remove and click the **Trash** icon.

![The Trash icon to delete an expense rule is located at the top right of the box containing the expense rule, to the left of the Edit icon.](https://help.expensify.com/assets/images/ExpensifyHelp_ExpenseRules_03.png){:width="100%"}

---

# FAQ  

## How can I use expense rules for vendor matching in an accounting integration?  

When exporting non-reimbursable expenses, the **Payee** field in the accounting software will show "Credit Card Misc." if there is no exact match for the merchant name. This prevents multiple variations of the same vendor (e.g., "Starbucks" vs. "Starbucks #1234") from being created.  

To avoid this, use **Expense Rules** to standardize vendor names before export.  
- **Supported integrations:** QuickBooks Online, QuickBooks Desktop, Xero.  
- **Not supported for:** NetSuite, Sage Intacct (due to API limitations). 
