---
title: Workspace Merchant Rules
description: Learn how to enable and use Workspace Merchant Rules to automatically apply consistent expense coding based on the merchant name.
keywords: [New Expensify, workspace merchant rules, merchant rules, auto-categorize by merchant, expense automation, expense rules, workspace settings]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling and using Workspace Merchant Rules to apply consistent expense coding based on merchant name. Does not cover personal expense rules, Category Rules, Tag Rules, or troubleshooting rule conflicts.
---

Enable Workspace Merchant Rules to help Workspace Admins standardize how expenses from common merchants are coded across the workspace. These rules automatically apply consistent categories, tags, and other expense fields based on the merchant name, reducing manual cleanup and improving reporting accuracy.

These rules work in New Expensify, can only be configured in New Expensify, and apply consistently across all workspace members.

---

# How to create Workspace Merchant Rules

To create a Workspace Merchant Rule:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**, then **Expenses**.
4. Scroll to the **Merchant** section.
5. Click **Add merchant rule**.
6. Enter the merchant name and choose how it should match:
   - **Contains**
   - **Matches exactly**
7. Select the fields you want the rule to update: 
   - **Merchant** to update the merchant name. 
   - **Category** to update the expense category. 
   - **Tag** to update the expense tag.
   - **Tax** to update the tax rate (Tax must be enabled on the workspace).
   - **Description** to update the expense description.
   - **Reimbursable** to update whether the expense is reimbursable or non-reimbursable.
   - **Billable** to update whether the expense is billable or non-billable (Billable must be enabled on the workspace).
8. Select whether the rule should be applied to existing unsubmitted expenses and preview matches (optional). 
9. Select **Save Rule**

**Note:** Workspace Merchant Rules are only available after **Workspace Rules** are enabled for the workspace. If you don't see the Merchant Rules section, first [enable Workspace Rules](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Rules#enable-workspace-rules). 

---

## When Workspace Merchant Rules apply to expenses 

Workspace Merchant Rules apply under the following conditions:

- Rules are applied **when an expense is created**. They are not applied if the expense is edited later.
- If multiple Workspace Merchant Rules match the same expense, only the **earliest-created rule applies**.
- If a member manually sets a field when creating the expense, **that field won't be overridden by the rule**.

---

## How to use Workspace Merchant Rules

Use these best practices to ensure predictable results:

**Use specific merchant names**

- Start with **exactly matches** for common vendors (e.g., "Uber", "Slack") to avoid false matches.
- Use **contains** carefully, since broad terms can match unintended merchants.

**Test Workspace Merchant Rules before rollout**

 - Use **Preview matches** during setup.
 - Start with narrow rules and expand as needed.

---

## Examples of Workspace Merchant Rules

**Standardize rideshare expenses**

Use Workspace Merchant Rules to ensure rideshare expenses are always categorized the same way.

Examples:
 - If the merchant contains “Uber", apply Category: Travel, Tag: Ground Transportation, Reimbursable: Yes
 - If the merchant contains “Lyft”, apply Category: Travel, Tag: Ground Transportation, Reimbursable: Yes

This helps keep travel reporting consistent across the workspace.

**Automatically code SaaS and subscription expenses**

Use Workspace Merchant Rules to consistently code recurring software and subscription charges.

Examples:

 - If the merchant contains “Slack”, apply Category: Software, Reimbursable: No
 - If the merchant contains “Adobe”, apply Category: Software, Reimbursable: No

This is especially useful for marking subscription expenses as non-reimbursable.

**Standardize merchant name variations**

Use Workspace Merchant Rules to normalize merchant names that appear with multiple variations (e.g., "Starbucks #1234", "Starbucks Store 5678").

Example:

 - If the merchant contains “Starbucks”, apply Merchant: Starbucks, Category: Meals & Entertainment

This improves reporting accuracy and reduces duplicate merchant entries.

**Apply consistent coding for office supply purchases**

Use Workspace Merchant Rules to apply specific categories, tags, or descriptions to office supply expenses.

Examples:

 - If the merchant contains “Staples”, apply Category: Office Supplies, Tag: Office
 - If the merchant contains “Amazon Business”, apply Category: Office Supplies, Tag: Office

This ensures office-related purchases follow company coding standards.

---

# FAQ

## Who Can Enable Workspace Merchant Rules?

Only **Workspace Admins** on the **Control** plan can create, edit, or delete Workspace Merchant Rules.

## What fields can Workspace Merchant Rules update?

Workspace Merchant Rules can update expense fields such as the category, tag, reimbursable status, billable status, tax, merchant name, and description.

## Do Workspace Merchant Rules change how members submit expenses?

No. Employees submit expenses the same way as before. Workspace Merchant Rules run automatically in the background.

## What happens if a personal expense rule and a Workspace Merchant Rule both apply?

Personal expense rules take precedence over Workspace Merchant Rules. Learn more about [Personal Expense Rules](https://help.expensify.com/articles/new-expensify/settings/Personal-Expense-Rules). 

## How can I tell which Workspace Merchant Rule was applied?

When a Workspace Merchant Rule updates an expense, Expensify adds an automated message to the expense chat.

To check which rule was applied:

1. Open the expense.
2. Scroll to the bottom of the expense details.
3. Look for a message from Concierge indicating the update.

The message will explicitly say which fields were changed and that the update happened via workspace rules.

## Why didn't my Workspace Merchant Rule apply?

Common reasons include:
 - The merchant name didn’t match the rule criteria.
 - The rule is disabled.
 - Another rule matched first.
 - A field was manually set during expense creation.
 - The rule was created after the expense and wasn’t applied retroactively, unless you select "apply to existing expenses" when creating the rule.

