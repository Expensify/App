---
title: Workspace Rules
description: Configure and manage rules for your workspace to enforce expense policies and automate compliance.
keywords: [New Expensify, workspace rules, expense rules, receipt requirements, category rules, self-approvals, prohibited expenses, disable Smartscan, automate expenses, subscription expense, non-reimbursable, default expense handling, control expenses, expense categorization, rule-based expenses]
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

- **Receipt Required Amount** – Set the minimum amount that requires a receipt (supports decimals).
- **Max Expense Amount** – Set a per-expense spending cap (supports decimals).
- **Max Expense Age (Days)** – Define how old an expense can be (whole numbers only).
- **Billable Default** – Choose whether expenses are billable by default.
- **eReceipts** – Enable automatic receipt generation for all USD card transactions up to $75 (requires USD as default currency).
- Note: Disabling **eReceipts** after enabling them will hide existing eReceipts. Enable **eReceipts** again to restore them.

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

- **Custom Report Names** – Define naming templates for new reports.
- **Prevent Self-Approvals** – Block users from approving their own reports.
- **Auto-Approve Compliant Reports** – Automatically approve reports under a set amount and randomly audit others.
- **Auto-Pay Approved Reports** – Automatically reimburse reports under a threshold when they’re approved.

---

# Configure Category Rules

Category Rules let you fine-tune how individual categories behave.

To manage them:

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click on a category to open its settings.

Available options:

- **Enable Category** – Make it visible to members.
- **Require Description** – Force members to enter a reason when using the category.
- **Approver** – Assign a specific approver for expenses in this category.
- **Default Tax Rate** – Set a default tax percentage.
- **Max Amount** – Set a spending cap for this category.
- **Require Receipts Over** – Set a threshold for when receipts are required.

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

- **Default Categories** – Auto-assign a category based on the merchant’s MCC. Set this under **Categories > Settings**.
- **Billable Expenses** – Decide when tagging is required based on whether an expense is marked billable. Set this under **Tags > Settings**.

---

# FAQ

## Who can update a workspace's rules?

Only Workspace Admins on the **Control** plan can enable and configure workspace rules.

## What happens if I turn the rules off?

Turning off workspace rules removes any active warnings or violations from draft or outstanding expenses that relied on those rules.

## Can I disable SmartScan for my workspace?

No, SmartScan can’t be disabled for group (paid) workspaces. It’s always enabled by default.

