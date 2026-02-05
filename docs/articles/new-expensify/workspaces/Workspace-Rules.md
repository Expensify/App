---
title: Workspace Rules
description: Configure and manage rules for your workspace to enforce expense policies and automate compliance.
keywords: [New Expensify, workspace rules, expense rules, receipt requirements, category rules, self-approvals, prohibited expenses, disable Smartscan, automate expenses, subscription expense, non-reimbursable, default expense handling, control expenses, expense categorization, rule-based expenses, compliance]
---

Workspace Rules let Admins enforce expense policies by setting custom requirements for receipts, spending limits, category behavior, auto-approvals, and more. These rules help ensure compliance and streamline the approval process.

**Note:** Rules are only available on the **Control** plan. You must be a **Workspace Admin** to enable or manage them.

---

# Enable Workspace Rules

To activate Rules for your workspace:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Manage** section, toggle on **Rules**.

---

# Configure Expense Rules

Once enabled, go to the **Rules** tab in the left menu to manage expense-level settings.

## Expense Rule Options

- **Receipt required amount** – Set the minimum amount that requires a receipt (supports decimals).
- **Max expense amount** – Set a per-expense spending cap (supports decimals).
- **Max expense age (Days)** – Define how old an expense can be (whole numbers only).
- **Cash expense default** - Choose whether cash expenses are reimbursable by default. 
- **Billable default** – Choose whether expenses are billable by default.
- **Require company cards for all purchases** - Flag out-of-pocket expenses that should have been made with a company card. Only available after company cards are connected to the workspace.
- **eReceipts** – Enable automatic receipt generation for all USD card transactions up to $75 (requires USD as default currency).
  
---

![Rules page showing all available workspace-level expense rules]({{site.url}}/assets/images/new-expensify-rules.png){:width="100%"}

---

# Configure the Prohibited Expenses Rule

Use this AI-powered rule to flag receipts with restricted purchases.

To enable it:

1. Go to **Workspaces > [Workspace Name] > Rules > Expenses**.
2. Scroll to the **Prohibited Expenses** section.
3. Toggle it on and select any categories to monitor:
   - Alcohol
   - Gambling
   - Tobacco
   - Hotel Incidentals
   - Adult Entertainment

If SmartScan detects one of these items on a receipt:
- The expense is flagged with a violation.
- The approver is prompted to manually review it.

**Note:** Violations appear in both New Expensify and Expensify Classic, but the rule must be enabled in **New Expensify**.

---

# Configure Expense Report Rules

Use these settings to control how entire reports are named, routed, and approved.

Available options:

- **Custom report names** – Define naming templates for new reports.
- **Prevent self-approvals** – Block users from approving their own reports.
- **Auto-approve compliant reports** – Automatically approve reports under a set amount and randomly audit others.
- **Auto-Pay approved reports** – Automatically reimburse reports under a threshold when they’re approved.

---

# Configure Category Rules

Category Rules let you fine-tune how individual categories behave.

To manage them:

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click on a category to open its settings.

Available options:

- **Enable category** – Make it visible to members.
- **Require description** – Force members to enter a reason when using the category.
- **Approver** – Assign a specific approver for expenses in this category.
- **Default tax rate** – Set a default tax percentage.
- **Max amount** – Set a spending cap for this category.
- **Require receipts over** – Set a threshold for when receipts are required.

---

# Configure Tag Rules

Tag Rules allow tagging-based workflows and approvals.

To manage them:

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click a tag to open its settings.

Available option:

- **Tag Approver** – Assign a reviewer for expenses with this tag.

---

# Manage Default Categories and Billable Behavior

You can set workspace-wide defaults to automate categorization and tagging.

- **Default categories** – Auto-assign a category based on the merchant’s MCC. Set this under **Categories > Settings**.
- **Billable expenses** – Decide when tagging is required based on whether an expense is marked billable. Set this under **Tags > Settings**.

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

## What happens if I disable eReceipts?

Disabling eReceipts hides any previously generated eReceipts. Re-enabling the feature will restore those receipts.

## Will disabling rules affect submitted or approved expenses?

No. Disabling a rule only affects expenses that are in draft or awaiting submission. Submitted or approved expenses remain unchanged.


