---
title: Merchant Rules
description: Learn how to enable and use Merchant Rules to automatically apply consistent expense coding based on the expense merchant name.
keywords: [New Expensify, workspace merchant rules, merchant rules, auto-categorize by merchant, expense automation, expense rules, workspace settings]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling and using Merchant Rules to apply consistent expense coding based on merchant name. Does not cover personal expense rules, Category Rules, Tag Rules, or troubleshooting rule conflicts.
---

# Merchant Rules

Merchant Rules let Workspace Admins automatically update expense fields when an expense matches a merchant name. Use them to apply consistent categories, tags, merchant names, tax settings, and other expense fields across expenses. 

---

## How to create Merchant Rules

To create a Merchant Rule:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **Rules**.
3. In the **Merchant** section, click **Add merchant rule**.
4. Enter the merchant name and choose how it should match:
   - **Contains**
   - **Matches exactly**
5. Select the fields you want the rule to update. 
6. Optionally apply the rule to existing unsubmitted expenses and review matching expenses using **Preview matches**.
7. Select **Save Rule**

**Note:** Merchant Rules are only available after **Rules** are enabled for the workspace. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules#enable-workspace-rules).

---

## How Merchant Rules are applied

Each Merchant Rule matches expenses using either **Matches exactly** or **Contains**.

When an expense is created and its merchant matches a rule, Expensify automatically updates the fields configured in that rule.

Keep these behaviors in mind:

- Rules are applied when an expense is created.
- If multiple rules match, the earliest-created rule is applied.
- Fields that members manually set during expense creation aren't overwritten.

---

## How to make Merchant Rules more accurate

Use these best practices to ensure predictable results:

**Use specific merchant names**

- Start with **exactly matches** for common vendors (e.g., "Uber", "Slack") to avoid false matches.
- Use **contains** carefully, since broad terms can match unintended merchants.

**Test Merchant Rules before rollout**

- Use **Preview matches** during setup.
- Start with narrow rules and expand as needed.

---

 ## What can you do with Merchant Rules?

Merchant Rules can help you:

- Standardize merchant names (for example, "Starbucks #1234" → "Starbucks")
- Automatically categorize expenses (for example, Uber → Travel)
- Apply consistent tags (for example, Staples → Office)
- Mark expenses as reimbursable or non-reimbursable (for example, Slack → Non-reimbursable)
- Apply descriptions or tax settings automatically

![Image of an expense with Merchant Rule applied]({{site.url}}/assets/images/ExpensiHelp-MerchantRules-2.png){:width="100%"}

---

# FAQ

## What happens if a personal expense rule and a Merchant Rule both apply?

Personal expense rules take precedence over Merchant Rules. Learn more about [Personal Expense Rules](/articles/new-expensify/settings/Personal-Expense-Rules).

## How can I tell which Merchant Rule was applied?

When a Merchant Rule updates an expense, Expensify adds an automated message to the expense chat.

To check which rule was applied:

1. Open the expense.
2. Scroll to the bottom of the expense details.
3. Look for a message from Concierge indicating the update.

The message identifies which fields were updated and that the changes were made by a Merchant Rule.

## Why didn't my Merchant Rule apply?

Common reasons include:
- The merchant name didn't match the rule criteria.
- The rule is disabled.
- Another rule matched first.
- A field was manually set during expense creation.
- The rule was created after the expense and wasn't applied retroactively, unless you select "apply to existing expenses" when creating the rule.

## How do I clear a Category, Tag, or Tax value from a Merchant Rule?

When you add or edit a rule and open the **Category**, **Tag**, or **Tax** field, select **None** to clear the previously selected value. Then select **Save rule**.

## What expense fields can be updated by Merchant Rules?

Merchant Rules can update: 

   - Merchant name
   - Category
   - Tag
   - Description
   - Reimbursable status
   - Billable status
   - Tax

