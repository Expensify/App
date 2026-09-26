---
title: Workspace Rules
description: Configure and manage rules for your workspace to enforce expense policies and automate compliance.
keywords: [New Expensify, workspace rules, rules tabs, general rules, card restrictions, expense defaults, field requirements, flag for review, agent rules, expense rules, receipt requirements, category rules, prohibited expenses, disable Smartscan, automate expenses, non-reimbursable, cash expenses, billable expenses, control expenses, compliance, itemized receipt, merchant rules, spend rules, Expensify Card spend rules, block transactions, public receipt visibility]
internalScope: Audience is Workspace Admins on the Collect and Control plans. Covers enabling Rules and configuring each tab of the Rules page, including basic rules, Expensify Card restrictions, expense defaults, field requirements, flag for review, and agent rules. Does not cover personal expense rules, Workspace Merchant Rules setup details, report-level rules in Workflows, or troubleshooting specific rule outcomes.
---

# Workspace Rules

Workspace rules let admins enforce expense policies by setting requirements for receipts, spending limits, required fields, category behavior, and Expensify Card spend. These rules help ensure compliance and reduce manual review.

The **Rules** page is organized into tabs: **General**, **Card restrictions**, **Expense defaults**, **Field requirements**, **Flag for review**, and **Agents**.

If your requirements can't be handled with these rules alone, create an Agent Rule. Agent Rules are AI-powered rules that automate report reviews, routing, approvals, and other workspace actions using natural-language instructions. [Learn how to create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules).

---

## Who can use Rules

- Only **Workspace Admins** can enable, update, or disable **Rules**.
- Rules are available on the **Collect** and **Control** plans.
- On the **Collect** plan, only **Require fields for all expenses** and **Billable expenses** on the **General** tab are available. Selecting any other rule or tab prompts you to upgrade to **Control**.

---

## How to enable Rules on a workspace

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **More features**.
3. Under the **Manage** section, toggle on **Rules**.

Once enabled, **Rules** appears in the workspace menu.

---

## How to set basic rules on the General tab

The **General** tab holds **Basic rules**, which apply to every expense on the workspace.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select the **General** tab.
4. Choose the rule you want to configure.

Available rules:

- **Flag expenses older than** – Flag spend older than a specific number of days.
- **Flag expenses above amount** – Flag spend that exceeds this amount, unless overridden by a category rule.
- **Flag receipt line items** – Flag receipts that contain restricted purchases, such as alcohol, gambling, or tobacco. [Learn how the Prohibited Expenses rule works](/articles/new-expensify/workspaces/Prohibited-Expense-Rule).
- **Require receipts** – Require a receipt, an itemized receipt, or both when spend exceeds the amounts you set, unless overridden by a category rule.
- **Require fields for all expenses** – Require a **Category**, a **Tag**, or both on every expense.
- **Cash expenses** – Choose how cash expenses are created. A cash expense is any expense that isn't an imported company card transaction, including manually created expenses, receipts, per diem, distance, and time expenses. Select **Reimbursable** or **Non-reimbursable** to set a starting value that members can change on each expense, or select **Always reimbursable** or **Always non-reimbursable** to fix the value for every cash expense. When you select an **Always** option, the **Reimbursable** toggle is hidden on the expense and on every split created from it.
- **Billable expenses** – Choose whether cash and credit card expenses are billable by default.
- **Require company cards for all purchases** – Flag all cash spend, including mileage and per diem expenses. Only available after company cards are connected to the workspace.
- **eReceipts** – Automatically create eReceipts for most USD credit transactions.
- **Attendee tracking** – Track the per-person cost for every expense.
- **Public receipt visibility** – Control who can view receipt images. When enabled, receipts are viewable by anyone with the URL, even people who don't have access to the report. When disabled (the default), receipts are only viewable by Expensify members with access to the report containing the receipt.

**Cash expenses** and **Billable expenses** can also be set per merchant. [Learn how Merchant Rules work](/articles/new-expensify/workspaces/Workspace-Merchant-Rules).

![ The Rules page on the General tab, showing the tab bar and the full Basic rules card.]({{site.url}}/assets/images/image-name.png){:width="100%"}

---

## How to restrict Expensify Card spend on the Card restrictions tab

The **Card restrictions** tab holds Expensify Card Spend rules, which approve or decline card transactions in real time based on currency, amount, merchant, and merchant type.

Every Expensify Card includes built-in protection that always declines charges for adult services, ATMs, gambling, and money transfers. Those default protections are listed under **Default** on this tab as the **All cards** rule and can't be edited or removed.

To set additional Expensify Card spend rules:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Add rule**.
4. Choose **Restrict card spend**.
5. Configure the rule and click **Save rule**.

For more details on configuring card restriction rules, see [Expensify Card Spend Rules](/articles/new-expensify/expensify-card/Expensify-Card-Spend-Rules).

---

## How to apply expense defaults on the Expense defaults tab

The **Expense defaults** tab holds rules that fill in expense fields automatically, so members don't have to. Each rule matches on a merchant, a merchant type, or a category, and then updates fields such as the category, tag, description, or tax rate.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Add rule**.
4. Choose **Apply expense defaults**.
5. Select **Merchant** to update fields on expenses from a specific merchant, or **Category** to set a default tax rate for a specific category.
6. Configure the rule and select **Save rule**.

A category default tax rate applies only to new expenses in that category. Expenses that already exist don't change.

Default categories based on the merchant's MCC (Merchant Category Code) also live on this tab. They appear as rules with a condition of **Merchant type is** and a rule of **Update category to**. You can change the category a merchant type maps to, but you can't edit the merchant type or delete these rules.

[Learn how Merchant Rules work](/articles/new-expensify/workspaces/Workspace-Merchant-Rules).

---

## How to require expense fields on the Field requirements tab

The **Field requirements** tab holds rules that require or waive specific expense fields for a category. Use **Require** to require a description, attendees, a receipt, or an itemized receipt on expenses in a given category. Use **Don't require** to waive a receipt or itemized receipt requirement that the **General** tab sets for everyone.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Field requirements**.
4. Select **Create field requirement rule**.
5. Configure the rule and select **Save rule**.

---

## How to flag expenses on the Flag for review tab

The **Flag for review** tab holds rules that alert approvers when specific expenses need a closer look. Each rule flags expenses in a category when the individual expense amount, or the daily category total on a report, goes above the amount you set.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Flag for review**.
4. Select **Create flag rule**.
5. Configure the rule and select **Save rule**.

---

## How to automate reviews on the Agents tab

The **Agents** tab holds Agent Rules, which are written in plain language and run automatically on your workspace.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Rules**.
3. Select **Agents**,
4. Select **Add AI rule**.

[Learn how to create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules).

---

## How to add a rule from any tab

**Add rule** stays in the top-right corner of the **Rules** page on every tab. It opens the **New rule** page, where you choose what the rule should do:

- **Restrict card spend** – Block or limit spend at the point of sale.
- **Flag for review** – Notify approvers when expenses exceed category limits.
- **Set field requirements** – Require specific expense fields or waive requiring them.
- **Apply expense defaults** – Update fields without the submitter doing anything.
- **Describe agent rule** – Create flexible rules that run when you need.

---

## How to set rules for a single category

Category-specific behavior is set as a rule on the **Rules** page, not on the category itself. Open a category to set its **Approver** and **Description hint**, and use the **Category rules** section at the bottom of the category to review the rules that already apply to it.

A **Description hint** appears below the **Description** field on an expense once a member selects that category, both while creating and while editing the expense. [Learn how to add a Description hint to an expense category](/articles/new-expensify/workspaces/Create-expense-categories).

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Categories**.
4. Click a category to open it.
5. In the **Category rules** section, click **Create new rule**.

[Learn how to create expense categories](/articles/new-expensify/workspaces/Create-expense-categories).

---

## Where to find report-level rules

Rules that apply to a whole expense report are on the **Advanced** tab of the **Workflows** page, not on the **Rules** page. They are **Prevent self-approvals**, **Auto-approve compliant reports**, and **Auto-pay approved reports**.

[Learn how to configure Workspace Workflows](/articles/new-expensify/workspaces/Workspace-Workflows).

---

## What happens when an expense breaks a rule

When an expense breaks a workspace rule or a category rule, the expense is flagged with a violation and the approver is prompted to manually review it before approval.

![Expense showing violations]({{site.url}}/assets/images/ExpensifyHelp-FlagExpensesMissingItemizedReceipts_02.png){:width="100%"}

---

# FAQ

## What happens if I turn Rules off?

Disabling Rules removes any active warnings or violations from draft or outstanding expenses that relied on those rules.

## Can I disable SmartScan for my workspace?

No, SmartScan can't be disabled for group (paid) workspaces and cannot be turned off.

## When does the Require company cards for all purchases violation appear?

This violation is triggered when an expense meets **any** of the following conditions:

- It's created as cash and is older than seven days
- It's imported from a personal card feed
- It's manually changed from a card expense to a cash expense

## Why don't I see the Require company cards for all purchases rule?

This rule only appears after at least one company card feed is connected to the workspace. If all company card feeds are removed, the rule automatically disables.

## Why don't I see any rules on the Card restrictions tab?

Card restrictions apply only to the Expensify Card. If the Expensify Card isn't enabled for the workspace, the tab shows **Get the Expensify Card and control spend** instead of a rules list. Click **Get the card** to enable it, or enable it under **Workspaces > [workspace name] > More features**.

## Why does selecting a tab ask me to upgrade?

Only the **General** tab is available on the **Collect** plan, and only the **Require fields for all expenses** and **Billable expenses** rules on it. Every other tab and rule requires the **Control** plan.

## What happens if I disable eReceipts?

Disabling eReceipts hides any previously generated eReceipts. Re-enabling the feature restores those receipts.

## Who can view receipts when Public receipt visibility is enabled?

When **Public receipt visibility** is enabled, receipts are viewable by anyone with the URL, and access to the report containing the receipt is not required. This is useful when you want to share receipt links with people outside your workspace, such as a client or external accountant. When it's disabled (the default), receipts are only viewable by Expensify members with access to the report containing the receipt.

## Will disabling rules affect submitted or approved expenses?

No. Disabling a rule only affects expenses that are in draft or awaiting submission. Submitted or approved expenses remain unchanged.

## What happens if a category rule conflicts with a rule on the General tab?

Category rules take priority. When both apply to the same expense, the category-specific setting is used.
