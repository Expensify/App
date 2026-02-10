---
title: Workspace Rules
description: Learn what Workspace Rules are, what enabling them unlocks, and where to manage each type of rule in your workspace.
keywords: [New Expensify, workspace rules, expense rules, report rules, category rules, tag rules, expense automation, approval rules, compliance]
internalScope: Audience is Workspace Admins. Covers what Workspace Rules are, what enabling them unlocks, and where different rule types are managed. Does not cover detailed setup steps for individual rule types.
---

Workspace Rules help Admins enforce expense policies by setting custom requirements for receipts, spending limits, category behavior, auto-approvals, and more. These rules help ensure compliance and streamline the approval process.

**Note:** Rules are only available on the **Control** plan. You must be a **Workspace Admin** to enable or manage them.

---

# How Workspace Rules control expenses and reports

Workspace Rules define how expenses and reports behave by default in your workspace. 

With Workspace Rules, you can:
- Enforce compliance without manual intervention
- Flag or block expenses that don’t meet policy requirements
- Standardize categories, approvals, and reimbursements
- Reduce approval delays while maintaining oversight

Some Workspace Rules apply to individual expenses, while others apply to entire reports. 

---

## What you can control with Workspace Rules

Workspace Rules are grouped into two main areas:
- **Workspace Report Rules**, which control report-level behavior
- **Workspace Expense Rules**, which control individual expenses before submission

---

## How Workspace Report Rules manage approvals and reimbursements

Workspace Report Rules control how expense reports are named, approved, and reimbursed. These rules apply to reports as a whole, not to individual expenses.

Workspace Report Rules are available by default. 

Available Workspace Report Rules include:
- **Custom report names** – Automatically apply naming templates to new reports
- **Prevent self-approvals** – Block members from approving their own reports
- **Auto-approve compliant reports** – Automatically approve reports under a set amount and randomly audit others
- **Auto-pay approved reports** – Automatically reimburse approved reports under a defined threshold

Learn more about configuring **Report Rules** [LINK]. 

---

## How Workspace Expense Rules enforce compliance before submission

Workspace Expense Rules control how individual expenses are created, coded, permitted, and flagged. These rules apply before an expense is submitted, helping catch issues early.

Workspace Expense Rules are only available **after Workspace Rules are enabled**.

Available Workspace Expense Rules include:
- **Receipt required amount** – Require receipts for expenses over a specific amount
- **Max expense amount** – Set a per-expense spending limit
- **Max expense age (days)** – Limit how old an expense can be when submitted
- **Cash expense default** – Control whether cash expenses are reimbursable by default
- **Billable default** – Control whether expenses are billable by default
- **Require company cards for all purchases** – Flag out-of-pocket expenses that should have used a company card
- **eReceipts** – Automatically generate receipts for eligible USD card transactions
- **Prohibited expenses** – Flag restricted purchases using AI-powered receipt detection
- **Merchant Rules** – Apply consistent coding based on merchant name

You can also apply expense-level rules to **specific categories or tags**, allowing for more granular approval and compliance workflows.

![Rules page showing all available workspace-level expense rules]({{site.url}}/assets/images/new-expensify-rules.png){:width="100%"}

## How the Workspace Prohibited Expenses rule flags restricted purchases

The Workspace Prohibited Expenses rule uses AI-powered receipt detection to flag expenses that may violate company policy based on what appears on the receipt.

This rule does not automatically block expenses. Instead, it flags them so approvers can manually review the purchase and decide whether it complies with company policy.

The Prohibited Expenses rule can detect purchases such as:
- Alcohol
- Gambling
- Tobacco
- Hotel incidentals
- Adult entertainment

When a prohibited item is detected:
- The expense is flagged with a violation
- The approver is prompted to manually review the expense before approval

Learn how to configure [Prohibited Expenses](https://help.expensify.com/articles/new-expensify/workspaces/Prohibited-Expense-Rule)

---

## How Workspace Merchant Rules automate coding by merchant

Workspace Merchant Rules let Workspace Admins apply consistent, deterministic coding to expenses based on the merchant name.

Unlike automated suggestions or learned behavior, Merchant Rules always apply the same outcome when an expense matches a defined merchant. This makes them ideal for subscriptions, recurring vendors, and merchants that always require the same treatment.

Workspace Merchant Rules can be used to:
- Automatically assign categories or tags
- Mark expenses from specific merchants as non-reimbursable
- Apply consistent coding for subscriptions or recurring vendors
- Reduce manual cleanup and reporting inconsistencies

Learn how to set up **Merchant Rules** [LINK]. 

---

## How Workspace Category Rules control category behavior

Workspace Category Rules let Workspace Admins fine-tune how individual categories behave across the workspace.

Available Workspace Category Rule options include:
- **Enable category** – Control whether the category is available to members
- **Require description** – Require a justification when using the category
- **Approver** – Assign a specific approver for expenses in this category
- **Default tax rate** – Apply a default tax percentage
- **Max amount** – Set a spending cap for the category
- **Require receipts over** – Require receipts over a defined amount

Learn how to configure **Category Rules**.  
[LINK]

---

## How Workspace Tag Rules assign approvers by tag

Workspace Tag Rules let Workspace Admins assign a specific approver for expenses that include a particular tag. This is useful when approvals depend on cost center, project, or client.

Learn how to configure **Tag Rules**.  
[LINK]

---

# FAQ

## Who can manage workspace rules?

Only Workspace Admins on the **Control** plan can enable, update, or disable workspace rules.

## What happens if I turn workspace rules off?

Disabling workspace rules removes any active warnings or violations from draft or outstanding expenses that relied on those rules.

## What happens if a Category or Tag Rule conflicts with a Workspace Rule?

Category and Tag Rules take priority over Workspace Rules. When both apply to the same expense, the category-specific setting is used.

## Can I disable SmartScan for my workspace?

No, SmartScan can’t be disabled for group (paid) workspaces and cannot be turned off.

## When does the “Company card purchases required” violation appear?

This violation is triggered when an expense meets **any** of the following conditions:

- It’s created as cash and is older than seven days  
- It’s imported from a personal card feed  
- It’s manually changed from a card expense to a cash expense

## Why don’t I see the toggle for the company card rule?

The **Require Company Card for All Purchases** rule only appears after at least one company card feed is connected to the workspace. If all company card feeds are removed, the rule will automatically disable. 

## What happens if I disable eReceipts?

Disabling eReceipts hides any previously generated eReceipts. Re-enabling the feature will restore those receipts.

## Will disabling rules affect submitted or approved expenses?

No. Disabling a rule only affects expenses that are in draft or awaiting submission. Submitted or approved expenses remain unchanged.

