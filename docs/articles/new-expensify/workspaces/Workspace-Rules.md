---
title: Workspace Rules
description: Configure and manage rules for your workspace to enforce expense policies and automate compliance.
keywords: [New Expensify, workspace rules, expense rules, receipt requirements, category rules, self-approvals, prohibited expenses, disable Smartscan, automate expenses, subscription expense, non-reimbursable, default expense handling, control expenses, expense categorization, rule-based expenses, compliance, itemized receipt, itemized receipts required over, merchant rules, workspace merchant rules, auto-categorize by merchant, spend rules, Expensify Card spend rules, block transactions, approve transactions]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling and managing workspace-level rules such as expense rules, merchant rules, prohibited expenses, category rules, tag rules, report rules, and Expensify Card spend rules. Does not cover personal expense rules, Workspace Merchant Rules setup details, or troubleshooting specific rule outcomes.
---

# Workspace Rules 

Workspace Rules let Admins enforce expense policies by setting custom requirements for receipts, spending limits, category behavior, auto-approvals, and more. These rules help ensure compliance and streamline the approval process.

If your approval requirements can't be handled using Workspace Rules alone, create an Agent Rule. Agent Rules are AI-powered rules that let Workspace Admins automate report reviews, routing, approvals, and other workspace actions using natural-language instructions. [Learn how to create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules).

---

## How to enable Workspace Rules

To activate Rules for your workspace:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Manage** section, toggle on **Rules**.

---

# How to configure Expense Rules

Once enabled, click the **Rules** tab in the left menu. Rules are organized into three tabs:

- **General** – Set spend controls and defaults that apply to all expenses.
- **Card restrictions** – Block or limit Expensify Card spend at the point of sale.
- **Expense defaults** – Automatically update expense fields without the submitter doing anything.

To add a card restriction or expense default, click **Add rule**, then choose **Restrict card spend** or **Apply expense defaults**.

## How to configure rules on the General tab

Open the **General** tab, click a row to open its settings, make your changes, and click **Save**.

- **Flag expenses older than** – Flag expenses older than a set number of days.
- **Flag expenses above amount** – Flag expenses that exceed a set amount.
- **Flag receipt line items** – Flag receipts that contain restricted line items (such as alcohol, gambling, or tobacco) for manual review.
- **Require receipts** – Require receipts, and optionally itemized receipts, when spend exceeds a set amount, unless overridden by a category rule.
- **Require fields for all expenses** – Require specific fields, such as category and tag, on every expense.
- **Cash expenses** – Choose whether cash expenses are reimbursable by default. Note: [Workspace Merchant Rules](/articles/new-expensify/workspaces/Workspace-Merchant-Rules) can also set reimbursable status on a per-merchant basis.
- **Billable expenses** – Choose whether cash and credit card expenses are billable by default. Note: [Workspace Merchant Rules](/articles/new-expensify/workspaces/Workspace-Merchant-Rules) can also set billable status on a per-merchant basis.
- **eReceipts** – Enable automatic receipt generation for all USD card transactions up to $75 (requires USD as default currency).
- **Attendee tracking** – Track the per-person cost for every expense.

![]({{site.url}}/assets/images/ExpensifyHelp-FlagExpensesMissingItemizedReceipts_01.png){:width="100%"}

---

# What happens if Expense Rules are broken 

When an expense breaks a Workspace Rule or Category Rule, the expense is flagged with a violation and the approver is prompted to manually review it before approval.

![Expense showing violations]({{site.url}}/assets/images/ExpensifyHelp-FlagExpensesMissingItemizedReceipts_02.png){:width="100%"}

---

# How to configure Workspace Merchant Rules

Workspace Merchant Rules let Workspace Admins automatically apply consistent coding to expenses based on the merchant name. These rules help standardize categories, tags, and other expense fields across all members, reducing manual cleanup and improving reporting consistency.

Workspace Merchant Rules:
- Apply when an expense is created
- Work at the workspace level (not per member)
- Don't change how members submit expenses

To learn how to set up and manage Workspace Merchant Rules, see:
[**Workspace Merchant Rules**](/articles/new-expensify/workspaces/Workspace-Merchant-Rules)

---

# How to configure Spend rules for Expensify Cards

Spend rules let Workspace Admins approve or decline Expensify Card transactions in realtime based on the merchant, spend category, and amount of each charge. They appear in the **Spend** section of the **Rules** tab and only show after the [Expensify Card](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card) is enabled for the workspace.

Every Expensify Card includes built-in protection that always declines these charges:
- Adult services
- ATMs
- Gambling
- Money transfers

To add your own spend rule:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. In the **Spend** section, click **Add spend rule**.
5. Set the **Restriction type**:
   - **Allow** – Charges are approved if they match any merchant or category, and don't exceed a max amount.
   - **Block** – Charges are declined if they match any merchant or category, or exceed a max amount.
6. (Optional) Click **Add merchant** to restrict by merchant name, then choose a **Match type** of **Contains** or **Matches exactly**.
7. (Optional) Set a **Spend category** to restrict.
8. (Optional) Set a **Max amount**. Any charge over this amount is declined, regardless of the merchant and spend category restrictions.
9. Click **Choose cards** to select which Expensify Cards the rule applies to.
10. Click **Save rule**.

To edit or delete an existing rule, click the rule in the **Spend** section, make your changes, and click **Save rule** or **Delete rule**.

You can also apply a spend rule to a card while [issuing a new Expensify Card](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card).

---

# How to configure the Prohibited Expenses Rule

Use this AI-powered rule to flag receipts with restricted purchases.

To enable it:

1. Go to **Workspaces > [Workspace Name] > Rules > Expenses**.
2. Scroll to the **Prohibited Expenses** section.
3. Toggle it on and select any categories to monitor:
   - Alcohol
   - Gambling
   - Handwritten receipts
   - Hotel Incidentals
   - Tobacco
   - Adult Entertainment

**Note:** Violations appear in both New Expensify and Expensify Classic, but the rule must be enabled in **New Expensify**.

---

# How to configure Expense Report rules

Use these settings to control how entire reports are named, routed, and approved.

Available options:

- **Custom report names** – Define naming templates for new reports.
- **Prevent self-approvals** – Block users from approving their own reports.
- **Auto-approve compliant reports** – Automatically approve reports under a set amount and randomly audit others.
- **Auto-Pay approved reports** – Automatically reimburse reports under a threshold when they’re approved.

---

# How to configure Category Rules

Category Rules let you fine-tune how individual categories behave.

To manage them:

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click on a category to open its settings.

Available options:

- **Approver** – Assign a specific approver for expenses in this category.
- **Default tax rate** – Set a default tax percentage ([Taxes](/articles/new-expensify/workspaces/Track-Taxes) must be enabled on the workspace).
- **Flag amounts over** - Set a spending cap for this category.
- **Require receipts over** – Set a threshold for when receipts are required.
- **Require itemized receipts over** – Require itemized receipts for expenses over a specific amount.
- **Require fields** - Require specific fields be completed for this category. The options are:
   - **Require description** - Force members to enter a reason when using the category.
   - **Require attendees** - Force members to add additional attendees when using the category.

---

# How to configure Tag Rules

Tag Rules allow tagging-based workflows and approvals. 

To manage them:

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click a tag to open its settings.

Available option:

- **Tag Approver** – Assign a reviewer for expenses with this tag.

---

# How to manage default categories and billable behavior

You can set workspace-wide defaults to automate categorization and tagging. 

- **Default categories** – Auto-assign a category based on the merchant’s MCC (Merchant Category Code). This is configured under **Categories > Settings**, not under Rules. See [Create Expense Categories](/articles/new-expensify/workspaces/Create-expense-categories). 
- **Billable expenses** – Decide when tagging is required based on whether an expense is marked billable. Set this under **Tags > Settings**.

**Note:** Default category and billable settings use general automation logic. If you need consistent, merchant-specific outcomes that apply across all members, use **Workspace Merchant Rules** instead.

---

# FAQ

## Who can manage workspace rules?

Only Workspace Admins on the **Control** plan can enable, update, or disable workspace rules.

## What happens if I turn workspace rules off?

Disabling workspace rules removes any active warnings or violations from draft or outstanding expenses that relied on those rules.

## Can I disable SmartScan for my workspace?

No, SmartScan can’t be disabled for group (paid) workspaces and cannot be turned off.

## When does the “Company card purchases required” violation appear?

This violation is triggered when an expense meets **any** of the following conditions:

- It’s created as cash and is older than seven days  
- It’s imported from a personal card feed  
- It’s manually changed from a card expense to a cash expense

## Why don’t I see the toggle for the company card rule?

The **Require Company Card for All Purchases** rule only appears after at least one company card feed is connected to the workspace. If all company card feeds are removed, the rule will automatically disable. 

## Why don't I see the Spend section in Rules?

The **Spend** section only appears after the Expensify Card is enabled for the workspace. Enable it under **Workspaces > [Workspace Name] > More features**, then return to the **Rules** tab.

## What happens if I disable eReceipts?

Disabling eReceipts hides any previously generated eReceipts. Re-enabling the feature will restore those receipts.

## Will disabling rules affect submitted or approved expenses?

No. Disabling a rule only affects expenses that are in draft or awaiting submission. Submitted or approved expenses remain unchanged.

## What happens if a Category or Tag Rule conflicts with a Workspace Rule?

Category and Tag Rules take priority over Workspace Rules. When both apply to the same expense, the category-specific setting is used


