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
description: Learn how to set up and manage report approval workflows in Expensify, including approval modes, over-limit rules, and automated audits.
keywords: [report approval, approval workflow, over-limit expenses, advanced approval, concierge audit, receipt audit, expense rules, category approver, tag approver, enforce workflow]
---

Report approvals in Expensify allow Workspace Admins to create automated workflows that streamline expense review and approval. This article explains the available approval modes, how to configure them, and how to manage additional controls like over-limit rules and random audits.

# Report approval modes

Choose from three types of approval workflows based on your workspace needs:

- **Submit and Close**: Reports are auto-approved unless they contain violations.
- **Submit and Approve**: Reports are sent to a single designated approver.
- **Advanced Approval**: Enables multi-level, conditional approval chains.

---

# How to set an approval workflow

To configure your workspace’s approval mode:

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click the **Members** tab.
4. Scroll to the **Approval mode** section.
5. Choose one of the following:
   - **Submit and Close**: Auto-approves all reports unless they have violations.
   - **Submit and Approve**: Sends reports to a single designated approver.
   - **Advanced Approval**: Allows multiple approvers and conditional workflows.

**Note:** You can also set rules for specific **categories** and **tags** to fine-tune your workflow.

---

# Enforce workflow rules

To prevent employees from bypassing assigned approval paths:

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click the **Members** tab.
4. Enable **Enforce workflow**.

Admins will still be able to manually override workflows if needed.

---

# Manually review over-limit expenses

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

You can require manual review for expenses that exceed a specific dollar amount.

## Set a manual approval rule

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click **Members**.
4. Scroll to **Expense approvals**.
5. Under **Manually approve all expenses over**, enter your desired limit.

## Assign an over-limit approver (Advanced Approval only)

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click **Members**.
4. Click **Settings** next to a member’s name.
5. Enter a limit in **If report total is over**.
6. Under **Then approves to**, select the secondary approver.
7. Click **Save**.

---

# Route reports using category and tag approvers

Approvers can be assigned to specific categories and tags to route expenses accordingly.

## Assign a category approver

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click **Categories**.
4. Locate the category and click **Edit**.
5. Assign an approver and click **Save**.

## Assign a tag approver

*Only supported for single-level tags.*

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click **Tags**.
4. Locate the tag and assign an approver.

---

# Understanding complex workflows

## Lifecycle of an expense report

1. **Submission**: Reports are submitted manually or via Scheduled Submit.
2. **Category/Tag Approvers** (if assigned): Reports are routed here first.
3. **Approval mode**: Reports follow the selected workflow:
   - **Submit & Close**: Auto-closes after submission.
   - **Submit & Approve**: Sent to a single approver.
   - **Advanced Approval**: Routed through multi-level approvers.
4. **Concierge Approval**: For workspaces with manual review enabled, Concierge approves reports under the limit.
5. **Final approval & export**: Once approved, reports can be exported to your accounting system.

---

# Example workflows

### Submit & Close

Terry and Dana co-run a business and don’t need formal approvals. Their workspace uses Submit & Close, so all reports are auto-approved.

### Submit & Approve with Category Approvers

Pat manages accounting. Reports are submitted to Pat, but Dale must review all Plant and equipment purchases. These go to Dale first, then to Pat.

### Advanced Approval with Over-Limit Approvers

Amal submits a report with a $1,200 flight and $950 in accommodations. Jamie (manager) can approve up to $2,000. Since the total exceeds the limit, the report is routed to Lee for final approval before it reaches Finance.

---

# Automate receipt audits

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

**Concierge Receipt Audit** automatically reviews receipts to flag discrepancies.

- Available on all **Control** plan workspaces
- **Cannot be disabled**
- Uses **SmartScan** to match receipts with entered data
- Expenses flagged for mismatches require manual review

---

# Set a random audit schedule

You can choose to randomly audit a percentage of otherwise compliant reports.

1. Go to `Settings > Workspaces`.
2. Select your workspace.
3. Click **Members**.
4. Scroll to **Expense approvals**.
5. In **Randomly route reports for manual approval**, enter a percentage (default: 5%).
6. Click **Save**.

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

No. Concierge Receipt Audit is automatically enabled for all Control plan workspaces and cannot be turned off.

## Who can access the Reconciliation tab?

Only Domain Admins have access to the Reconciliation tab.

## What if company card expenses are missing?

Use the **Reconciliation tool** to find missing expenses:
- Click **Update** next to the card to pull missing transactions.
- If expenses are still missing, contact Concierge with the following:
  - Merchant name  
  - Date  
  - Amount  
  - Last four digits of the card number

**Note:** Only **posted transactions** will be imported.

## Can admins delete expenses on behalf of members?

No, admins cannot delete expenses for other members. Each member is responsible for managing their own expenses.
