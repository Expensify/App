---
title: Merchant Rules
description: Learn how to enable and use Merchant Rules to automatically apply consistent expense coding based on the expense merchant name.
keywords: [New Expensify, workspace merchant rules, merchant rules, auto-categorize by merchant, expense automation, expense rules, workspace settings, import merchant rules, bulk import merchant rules, merchant rules spreadsheet, create a rule from an expense, create a rule prompt]
internalScope: Audience is Workspace Admins on the Control plan. Covers creating Merchant Rules from workspace settings or from an expense you edited, using them, and bulk-importing them to apply consistent expense coding based on merchant name. Does not cover personal expense rules, Category Rules, Tag Rules, or troubleshooting rule conflicts.
---

# Merchant Rules

Merchant Rules let Workspace Admins automatically update expense fields when an expense matches a merchant name. Use them to apply consistent categories, tags, merchant names, tax settings, and other expense fields across expenses. 

Merchant Rules are only available after **Rules** are enabled for the workspace. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules#enable-workspace-rules).

---

## How to create a single Merchant Rule

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

---

## How to create a Merchant Rule from an expense you edited

When you recode a workspace expense, Expensify offers to turn that change into a Merchant Rule, so you don't have to build the rule from scratch in workspace settings.

1. Open the expense.
2. Change the **Category**, **Tag**, **Tax**, **Description**, **Billable**, or **Reimbursable** field.
3. Click **Create a rule** in the prompt that appears on the expense.
4. Review the rule, which is pre-filled with the expense merchant and every field you changed on that expense.
5. Click **Save rule**.

The prompt appears on the expense itself. It doesn't appear when you change a field from a list of expenses, such as a report or your search results.

<!-- SCREENSHOT:
Suggestion: An expense detail view immediately after a Category change, with the "Create a rule" prompt visible below the expense fields.
Location: Immediately after the steps in "How to create a Merchant Rule from an expense you edited".
Purpose: The prompt appears only after an edit and is easy to miss, so admins ask where the shortcut is rather than which fields they changed.
-->

---

## How to import multiple Merchant Rules

Instead of creating Merchant Rules one at a time, you can import multiple Merchant Rules from a spreadsheet.

1. Download and complete the [Merchant Rules import template]({{site.url}}/assets/Files/merchant-rule-import-template.csv), or create a spreadsheet with the following columns:
   - **Merchant** — The merchant the rule should apply to (required).
   - **Updated merchant** — Replace the merchant name (optional).
   - **Updated category** — Apply a category (optional).
   - **Updated tag** — Apply a tag (optional).
   - **Updated description** — Apply a description (optional).
   - **Reimbursable** — Set reimbursable status to **True** or **False** (optional).
   - **Billable** — Set billable status to **True** or **False** (optional).
2. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
3. Click **Rules**.
4. Click **More**, then select **Import merchant rules**.
5. Select **Choose file** and upload your completed spreadsheet.
6. Map each spreadsheet column to the corresponding Merchant Rule field:
   - For **Merchant**, choose how the merchant name should match:
     - **Merchant is** — Requires an exact match.
     - **Merchant contains** — Matches merchants whose names contain the value.
7. Click **Import**.
   
---

## How Merchant Rules are applied

Each Merchant Rule matches expenses using either **Matches exactly** or **Contains**.

When an expense is created and its merchant matches a rule, Expensify automatically updates the fields configured in that rule.

Keep these behaviors in mind:

- Rules are applied when an expense is created.
- If multiple rules match, the earliest-created rule is applied.
- Fields that members manually set during expense creation aren't overwritten.

---

## How to improve Merchant Rule matching

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

## Why doesn't the Create a rule prompt appear on my expense?

The prompt only appears when the rule it would create could match the expense. It doesn't appear when:

- The expense has no merchant yet, such as a receipt that is still scanning or whose scan failed.
- The expense is a distance or per diem expense, because Expensify sets the merchant on those.
- The expense is an invoice, because Merchant Rules apply to expenses.
- The expense isn't on the workspace yet, such as an expense in your self DM that you haven't submitted.
- You changed the field from a list of expenses instead of from the expense itself.
- You changed only the **Merchant**, **Amount**, or **Date**.
- The workspace isn't on the Control plan, or **Rules** isn't enabled on it.
- You don't have permission to edit that workspace's rules.

You can still build the rule yourself from workspace settings. Learn how to [create a single Merchant Rule](#how-to-create-a-single-merchant-rule).

## How do I clear a Category, Tag, or Tax value from a Merchant Rule?

When you add or edit a rule and open the **Category**, **Tag**, or **Tax** field, select **None** to clear the previously selected value. Then select **Save rule**.

## How do I leave Reimbursable or Billable unset in a Merchant Rule?

When you open the **Reimbursable** or **Billable** selector, it shows three options: **Don’t change**, **Yes**, and **No**. **Don’t change** is selected by default and leaves the field unset, so matching expenses keep their existing value.

## What expense fields can be updated by Merchant Rules?

Merchant Rules can update: 

   - Merchant name
   - Category
   - Tag
   - Description
   - Reimbursable status
   - Billable status
   - Tax

