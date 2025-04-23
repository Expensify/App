---
title: Report Approvals
description: Learn how to set up and enforce expense report approval workflows in Expensify, including multi-level approvals and over-limit expense reviews.
keywords: [Expensify Classic, report approvals, approval workflow, approver]
---

Expensify allows Workspace Admins to create automated workflows for expense report approvals. You can choose from three approval modes:
- **Submit and Close**: Automatically approves reports unless they contain violations.
- **Submit and Approve**: Sends reports to a single designated approver.
- **Advanced Approval**: Enables multi-level approvals for complex workflows.

---

# Set an Approval Workflow

1. Navigate to **Settings** > **Workspaces**.
2. Select the desired workspace.
3. Click the **Members** tab.
4. Scroll to the **Approval Mode** section.
5. Choose an approval mode:
   - **Submit and Close**: Reports are auto-approved unless they have violations.
   - **Submit and Approve**: Reports go to a single approver.
   - **Advanced Approval**: Allows multiple approvers and conditional rules.

You can also set approval rules for specific **categories** and **tags** to enhance your workflow.

## Enforce Workflow
To prevent employees from overriding approval rules, enable **workflow enforcement** in the **Members** tab. Admins can still manually override workflows when needed.

---

# Require Review for Over-Limit Expenses

You can enforce manual review for expenses that exceed a specific limit.

## Set a Manual Approval Rule
1. Go to **Settings** > **Workspaces**.
2. Select the workspace.
3. Click **Members**.
4. Scroll to **Expense Approvals**.
5. Enter a limit in **Manually approve all expenses over:**

## Assign an Over-Limit Approver
For Advanced Approval workspaces, you can assign a secondary approver for large expenses.

1. Go to **Settings** > **Workspaces**.
2. Select the workspace.
3. Click **Members**.
4. Click **Settings** next to the member.
5. In **If report total is over**, enter the limit.
6. In **Then approves to**, select the secondary approver.
7. Click **Save**.

---

# Assign Tag and Category Approvers

Approvers can be assigned to specific **categories** or **tags** to route expenses accordingly.

## Assign a Category Approver
1. Go to **Settings** > **Workspaces**.
2. Select the workspace.
3. Click **Categories**.
4. Locate the category and click **Edit**.
5. Assign an approver.
6. Click **Save**.

## Assign a Tag Approver
_Tag approvers are supported only for single-level tags._

1. Go to **Settings** > **Workspaces**.
2. Select the workspace.
3. Click **Tags**.
4. Locate the tag and assign an approver.

---

# Understanding Complex Approval Workflows

## Lifecycle of an Expense Report
1. **Submission**: Reports can be submitted manually or via [Scheduled Submit](https://help.expensify.com/articles/expensify-classic/reports/Automatically-submit-employee-reports).
2. **Category & Tag Approvers**: If assigned, reports first go to these approvers.
3. **Approval Mode**: Reports proceed according to the selected workflow:
   - **Submit & Close**: Auto-closes after submission.
   - **Submit & Approve**: Goes to a single approver.
   - **Advanced Approval**: Travels through a chain of assigned approvers.
4. **Concierge Approval**: If [manual approval](https://help.expensify.com/articles/expensify-classic/reports/Require-review-for-over-limit-expenses) is required, Concierge will approve reports under the limit.
5. **Final Approval & Export**: Once approved, reports can be exported to an [accounting system](https://help.expensify.com/expensify-classic/hubs/connections/).

## Approval Workflow Examples

- **Submit & Close**: Terry and Dana co-run a business and don’t need approval workflows. They set their workspace to **Submit & Close**, so reports are auto-approved.

- **Submit & Approve with Category Approvers**: Pat handles accounting for an engineering firm. Everyone submits reports to Pat, but Dale must approve all Plant and equipment purchases. Dale reviews these expenses before Pat gives final approval.

- **Advanced Approval with Over-Limit Approvers**: Amal submits a report with a $1,200 flight and $950 in accommodations. Jamie, their manager, can approve reports up to $2,000. Since the total exceeds the limit, the report escalates to Lee, who provides final approval before it goes to finance.

---

# Automate Receipt Audits

**Concierge Receipt Audit** automatically verifies receipts and flags discrepancies.

- Available on all **Control** plan workspaces.
- Cannot be disabled.
- SmartScan verifies receipt details against entered data.
- Flagged expenses require manual review.

---

# Set a Random Report Audit Schedule

While Expensify automatically flags reports that contain inaccurate or non-compliant expenses for review, you can set a percentage of compliant reports to be audited at random.

1. Go to **Settings** > **Workspaces**.
2. Select the workspace.
3. Click **Members**.
4. Scroll to **Expense Approvals**.
5. In **Randomly route reports for manual approval**, enter a percentage (default: 5%).
6. Click **Save**.

---

# FAQ

## Can I disable Concierge Receipt Audit?
No, this feature is automatically included in Control plan workspaces.

## Who can access the Reconciliation tab?
Only **Domain Admins** have access.

## What if company card expenses are missing?
1. Use the **Reconciliation tool** to locate missing expenses.
2. Click **Update** next to the card to pull missing transactions.
3. If expenses are still missing, contact Concierge with:
   - Merchant name
   - Date
   - Amount
   - Last four digits of the card number

**Note:** Only posted transactions will be imported.
