---
title: Require Tags and Categories for Expenses
description: Learn how to make tags and categories mandatory for all expenses in a workspace using the Require fields for all expenses rule.
keywords: [New Expensify, require tags, require categories, require fields for all expenses, expense compliance, workspace rules, general tab, default category, merchant type, smartscan]
internalScope: Audience is Workspace Admins. Covers requiring a category or tag on every expense with the Require fields for all expenses rule, and setting default categories by merchant type. Does not cover per-category field requirements, tag approvers, or creating tags and categories.
---

# Require Tags and Categories for Expenses

To improve expense accuracy and compliance, Workspace Admins can require every expense to be tagged and categorized. This is set with the **Require fields for all expenses** rule on the **General** tab of the **Rules** page.

When the rule is on, the relevant field displays as required during entry.

**Note:** If tags or categories are required but not applied, the expense can still be submitted. However, the submitter and approver will see an orange dot indicating the field needs attention.

---

## Who can require tags and categories for expenses

- Only **Workspace Admins** can change this rule.
- The rule is available on the **Collect** and **Control** plans.
- **Rules** must be enabled for the workspace. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules#how-to-enable-workspace-rules).
- Categories or tags must be enabled and have at least one enabled option before they can be required.

---

## How to require tags and categories for expenses

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. On the **General** tab, click **Require fields for all expenses**.
5. Toggle on **Category**, **Tag**, or both.
6. Click **Save rule**.

If your workspace uses multi-level tags, this page lists one row per tag level so you can require some levels and leave others optional.

<!-- SCREENSHOT:
Suggestion: The Require fields for all expenses page with the Category and Tag toggles visible.
Location: After the steps for requiring tags and categories.
Purpose: Confirms admins are on the right page, since this rule moved out of Categories > Settings and Tags > Settings.
-->

---

## How to set default categories by merchant type

Expensify can automatically assign a category based on the merchant's MCC (Merchant Category Code). For example, airline expenses can default to a **Travel** category. These defaults are rules on the **Expense defaults** tab.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. Open the **Expense defaults** tab.
5. Click the rule whose condition is **Merchant type is** for the merchant type you want to change, then update the category it applies.
6. Click **Save rule**.

Expensify also learns how you categorize expenses by merchant and applies those preferences going forward. You can always update or override a category, and Expensify learns your changes over time.

[Learn how to configure Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).
