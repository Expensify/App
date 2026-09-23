---
title: Set a default tax rate for a category
description: Learn how Workspace Admins set a default tax rate for a category from the Expense defaults tab in Rules, and how that rate is applied to new expenses.
keywords: [New Expensify, category tax rate, default tax rate, category tax default, expense defaults, workspace rules, apply expense defaults, tax rules, category rules]
internalScope: Audience is Workspace Admins on the Control plan with Rules and Taxes enabled. Covers creating, editing, and deleting a category's default tax rate from the Expense defaults tab in Rules. Does not cover creating tax rates, Merchant Rules, or the workspace and foreign currency default tax rates.
---

# Set a default tax rate for a category

A category default tax rate applies a tax rate automatically whenever a new expense is coded with that category, so members don't have to pick a rate themselves. Each rule matches on one category and sets one default: **Tax**.

Category default tax rates only apply to expenses created after the rule is saved. Expenses that already exist don't change.

---

## Who can set a default tax rate for a category

To set a default tax rate for a category, you must be:

- A Workspace Admin.
- On a workspace with **Rules** enabled (available on the Control plan).
- On a workspace with **Taxes** enabled and at least one tax rate created.

If **Rules** is not enabled, [learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules). If **Taxes** is not enabled, or the workspace has no tax rates yet, [learn how to configure taxes](/articles/new-expensify/workspaces/Track-Taxes).

Until taxes are enabled, the **Category** option is locked and selecting it shows **Turn on taxes first**.

---

## How to set a default tax rate for a category

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **Rules**.
3. If the **Rules** page shows tabs, select the **Expense defaults** tab.
4. Click **Add rule**.
5. Select **Apply expense defaults**.
6. Under **What should this rule match on?**, select **Category**.
7. Under **If any expense matches:**, click **Category** and select one or more categories.
8. Under **Then apply the following defaults:**, click **Tax** and select the tax rate to apply.
9. Click **Save rule**.

Selecting several categories at once creates one rule per category, each using the tax rate you picked. To start over before saving, click **Reset**.

<!-- SCREENSHOT:
Suggestion: The Apply expense defaults chooser showing the Merchant and Category options side by side, with Category unlocked.
Location: After step 6.
Purpose: Admins land on this chooser only when creating an expense default and can't tell from the Rules page which option produces a tax rule, so this confirms Category is the right branch to take.
-->

If the **Rules** page doesn't show tabs, set the rate from the category instead: click **Categories**, click the category, then set **Default tax rate**. Both paths write the same rule.

---

## How to edit or delete a category's default tax rate

Saved rules appear under **Categories** on the **Expense defaults** tab, listed as `Category is "[category name]"`.

- To change the category or the tax rate, click the rule, update **Category** or **Tax**, then click **Save rule**. Changing the category moves the rate to the new category and removes the old rule.
- To remove a single rule, click the rule and then click **Delete rule**.
- To remove several rules at once, select their checkboxes and use the bulk delete action.

Rows under **Merchant types** are workspace defaults and can't be selected or deleted.

---

## What happens after you set a default tax rate for a category

- The tax rate is applied when a new expense is created with that category.
- Expenses created before the rule was saved keep their existing tax rate. A category rule can't be applied to existing expenses, so that option is locked and shows **Category rules apply going forward**.
- If you delete the rule, new expenses in that category fall back to the workspace default tax rate.
- If you delete the category or the tax rate the rule uses, the rule is removed with it.
- Renaming the category keeps the rule and moves it to the new name.

---

# FAQ

## Can a category rule set anything other than a tax rate?

No. A rule that matches on **Category** sets only **Tax**. To set a category, tag, description, reimbursable status, or billable status automatically, create a rule that matches on **Merchant** instead. [Learn how to create Merchant Rules](/articles/new-expensify/workspaces/Workspace-Merchant-Rules).

## Why is the Category option locked when I create an expense default?

The **Category** option requires taxes. Selecting it shows **Turn on taxes first**. Enable **Taxes** in your workspace settings and add at least one tax rate, then create the rule.

## Why don't I see any rates when I open Tax?

The workspace has taxes turned off. The picker shows **Taxes are not enabled** with an **Enable taxes** button. Click it, finish enabling taxes, and the rates appear.

## Is the workspace default tax rate listed when I pick a rate for a category?

No. A category rule exists to override the workspace default, so that rate isn't offered as a choice and there's no **None** option. Delete the rule instead to fall back to the workspace default.

## Why did my rule not save?

Both fields are required. Saving without a category shows **Please select a category**, and saving without a rate shows **Please select a tax rate**.

## Can auditors change a category's default tax rate?

No. Auditors can open a rule to view it, but the fields are read-only and there are no **Save rule** or **Delete rule** buttons.
