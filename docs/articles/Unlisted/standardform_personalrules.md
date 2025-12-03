---
title: Personal Rules in Expensify
description: Learn how to automate your expense edits with personal rules in Expensify — both implicit and manual rules.
keywords: personal rules, expense rules, edit expenses, automation, merchant match, expense management, SmartScan, credit card import, Account > Expense Rules
---

<div id="new-expensify" markdown="1">

All members can create personal rules in Expensify to help automate how their expenses are categorized and edited. These come in two forms: rules that Concierge learns automatically, and rules you set yourself.

## Implicit Personal Rules

These are the unstated patterns Concierge learns from your behavior over time. You don’t need to do anything to set these up — Concierge will analyze your past actions and start making smart suggestions (or automatic changes) to future expenses.

Examples:
- If you consistently categorize coffee shop expenses as “Meals,” Concierge will start doing that for you.
- If Concierge is highly confident, it may make edits automatically — but you can always ask Concierge to undo or change them.

## Manual Personal Rules (Coming Soon!)

These are customizable rules that you create yourself to modify your own expenses, based on the merchant name. These apply to expenses imported from credit cards or SmartScanned receipts.

---

# Where to find Personal Rules

- **Web:** Go to the navigation tabs on the left, then select **Account > Expense Rules**.
- **Mobile:** Tap the hamburger menu in the top-left corner, then go to **Settings > Expense Rules**.

---

# How to create a new Personal Rule

1. Go to **Account > Expense Rules**.
2. Click **New Rule**.
3. Enter the **Merchant name** that should trigger this rule.
   - Any scanned receipt or imported card transaction containing this merchant name will match the rule.
   - Enter a period (`.`) to match **all merchants**, applying the rule to all new expenses.
4. Choose the actions to apply when a match is found. You can set any or all of the following:
   - Rename the merchant
   - Change the category
   - Change the description
   - Make the expense reimbursable
   - Make the expense billable
   - Add the expense to a report with a specific name
   - Automatically create that report if it doesn’t exist
5. Click **Save**.

---

# How to edit an existing Personal Rule

1. Go to **Account > Expense Rules**.
2. Click the rule you want to edit.
3. Update the fields as needed.
4. Click **Save**.

---

# How to delete an existing Personal Rule

1. Go to **Account > Expense Rules**.
2. Find the rule you want to remove.
3. Click the **trash icon** (🗑️) or **Delete** button next to it.
4. Confirm deletion when prompted.

---

# How to use Personal Rules for vendor matching in accounting exports

When exporting non-reimbursable expenses to your accounting software, the **Payee** field will show **“Credit Card Misc.”** if there’s no exact match for the merchant name.

To prevent duplicate vendors (e.g., "Starbucks" vs. "Starbucks #1234"), create Personal Rules to standardize merchant names before export.

**Supported accounting integrations:**
- QuickBooks Online
- QuickBooks Desktop
- Xero

**Not supported for:**
- NetSuite
- Sage Intacct  
(*These platforms have API limitations that prevent vendor mapping via Personal Rules.*)

