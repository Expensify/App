---
title: Report Approvals
description: Learn how to configure and enforce expense report approval workflows in Expensify Classic, including multi-level approval chains and over-limit expense reviews.
keywords: [Expensify Classic, report approvals, approval workflows, approver assignments, over-limit expenses, advanced approval]
---

<div id="expensify-classic" markdown="1">

Expensify Classic lets Workspace Admins build flexible approval workflows for expense reports. You can automate simple approvals or set up detailed chains of command for large organizations.

---

# Choose an Approval Mode

1. Go to **Settings > Workspace > [Workspace Name] > Workflows > Add approvals**.
2. Choose one of the following modes:
   - **Submit and Close** – Automatically approves reports unless they contain violations.
   - **Submit and Approve** – Sends each report to a single assigned approver.
   - **Advanced Approval** – Supports multi-level approval chains with conditional logic.

## Enforce Workflow Rules

To prevent employees from bypassing the workflow:
- In the **Workflows** tab, enable **Workflow Enforcement**.
- This locks the approval path unless overridden by a Workspace Admin.

---

# Require Review for Over-Limit Expenses

You can flag high-value expenses for manual review.

## Set a Manual Approval Rule

1. Go to **Settings > Workspace > [Workspace Name] > Workflows**.
2. Under **Expense approvals**, enter a dollar amount in the **Manually approve all expenses over** field.

## Assign an Over-Limit Approver

For workspaces using **Advanced Approval**, assign a backup approver for large reports.

1. Go to **Settings > Workspace > [Workspace Name] > Members**.
2. Click **Settings** next to a member’s name.
3. In the **If report total is over** field, set a dollar amount.
4. In the **Then approves to** field, select the backup approver.
5. Click **Save**.

---

# Assign Approvers by Category or Tag

Use categories or tags to send expenses to specialized approvers.

## Assign a Category Approver

1. Go to **Settings > Workspace > [Workspace Name] > Categories**.
2. Find the category and click **Edit**.
3. Choose an approver from the list.
4. Click **Save**.

## Assign a Tag Approver

**Note:** Tag-based approvers only work with single-level tags.

1. Go to **Settings > Workspace > [Workspace Name] > Tags**.
2. Select the relevant tag.
3. Assign an approver.

---

# Understand Complex Approval Workflows

## Lifecycle of an Expense Report

1. **Submission** – Reports are submitted manually or via [Delay Submissions](https://help.expensify.com/articles/expensify-classic/reports/Automatically-submit-employee-reports).
2. **Category & Tag Approvers** – Reports are routed here first, if set.
3. **Approval Mode** – Determines how the report progresses:
   - **Submit and Close** – Auto-closes if no violations.
   - **Submit and Approve** – Goes to one approver.
   - **Advanced Approval** – Follows a chain of multiple approvers.
4. **Concierge Approval** – If enabled, Concierge approves reports under the manual limit.
5. **Final Approval & Export** – Approved reports can be exported to an [accounting system](https://help.expensify.com/expensify-classic/hubs/connections/).

## Approval Workflow Examples

- **Submit & Close**: Terry and Dana co-run a business and don’t need approval workflows. They set their workspace to **Submit & Close**, so reports are auto-approved.

- **Submit & Approve with Category Approvers**: Pat handles accounting for an engineering firm. Everyone submits reports to Pat, but Dale must approve all Plant and equipment purchases. Dale reviews these expenses before Pat gives final approval.

- **Advanced Approval with Over-Limit Approvers**: Amal submits a report with a $1,200 flight and $950 in accommodations. Jamie, their manager, can approve reports up to $2,000. Since the total exceeds the limit, the report escalates to Lee, who provides final approval before it goes to finance.

---

# Automate Receipt Audits

**Concierge Receipt Audit** automatically checks receipts for accuracy.

- Available in all **Control** plan workspaces.
- Cannot be disabled.
- Uses **SmartScan** to compare receipt data to entered amounts.
- Flags discrepancies for manual review.

---

# Customize Expense Report Auditing

All reports are checked for errors and compliance. You can add manual audits for specific cases.

To set this up:
1. Go to **Settings > Workspace > [Workspace Name] > Workflows**.
2. Under **Expense approvals**, use the **Manually approve all expenses over** field to:
   - Enter a **dollar amount** to review all expenses above a certain threshold.
   - Enter a **percentage** to randomly audit that portion of compliant reports.
3. Click **Save**.

---

# FAQ

## Can I disable Concierge Receipt Audit?

No, this feature is always enabled on Control plan workspaces.

## Who can access the Reconciliation tab?

Only **Domain Admins** have access.

## What if company card expenses are missing from a report?

1. Use the **Reconciliation tool** to locate missing expenses.
2. Click **Update** next to the card to sync transactions.
3. If transactions are still missing, contact Concierge and share:
   - Merchant name
   - Date
   - Amount
   - The last four digits of the card

**Note:** Only posted credit card transactions will import.

</div>
