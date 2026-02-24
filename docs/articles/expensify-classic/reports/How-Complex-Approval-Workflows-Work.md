---
title: How Complex Approval Workflows Work
description: Examples of how Advanced Approval Workflows apply in real life.
keywords: [Expensify Classic, Advanced Approval Workflow, multiple approvers]
---

Approval workflows can become complex. Let's examine the lifecycle of an expense report from submission to final approval.

---

# Submission
The approval workflow begins when a report is submitted. Reports can be submitted manually or set to [submit automatically](https://help.expensify.com/articles/expensify-classic/reports/Automatically-submit-employee-reports) by Concierge.

⚠️ **Important:** If you change part of your workflow after a report has been submitted, the workflow for that report will not update unless it is retracted and resubmitted.

---

# Category & Tag Approvers

A report containing expenses with [category or tag-specific approvers](https://help.expensify.com/articles/expensify-classic/reports/Assign-tag-and-category-approvers) will first go to those approvers. These individuals will receive notifications via email or in-app alerts.

---

# Approval Modes
The report follows the approval workflow that's been configured on the workspace:

- **Submit & Close:** Reports are submitted and immediately closed, notifying the designated recipient. [Learn more](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow).
- **Submit & Approve:** Reports are submitted and require approval from the designated approver before final processing. [More details here](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow).
- **Advanced Approval:** The report is sent to the approver listed in the submitter's "Submits to" column in the **Workspace Members table**. If applicable:
    - The report moves up the approval chain based on the **Approves To** column.
    - If an approver has an [approval limit](https://help.expensify.com/articles/expensify-classic/reports/Require-review-for-over-limit-expenses), the report escalates accordingly.
    - The process continues until it reaches the final approver (the person with no one listed in their **Approves To** column).

Once the report reaches **final approval**, it can be exported to a [connected accounting software](https://help.expensify.com/expensify-classic/hubs/connections/) or reimbursed.

---

# Concierge Approval
If you require manual approval for expenses exceeding a set limit, Concierge will auto-approve any report below this threshold. Expenses exceeding the threshold will require manual review and will not be auto-approved by Concierge. 

---

# Advanced Approval Workflow Examples
Here are scenarios demonstrating different approval workflows.

## Submit & Close
Terry and Dana, business partners, don't need approval for their expenses. They set Terry as the recipient, and reports are automatically closed after submission.

**Outcome:** Reports are submitted and closed with no approval required.

## Submit & Approve with Category Approvers
Pat, an accountant, approves all reports. However, Dale must review equipment purchases. Dale is assigned a **"3005 Plant and Equipment"** category. When a report includes this category, it first goes to Dale before reaching Pat for final approval and export.

**Outcome:** Reports follow category-based approvals before final processing.

## Submit & Approve with Scheduled Submit & Concierge Approval
Sandra's company sets a manual approval threshold of $100 and enables weekly **Scheduled Submit**. David, a sales rep, accumulates small expenses (e.g., coffee, parking). Since no individual expense exceeds $100, his report is submitted automatically on Sunday and is instantly approved by Concierge.

**Outcome:** Reports are automatically submitted and approved unless they contain large expenses.

## Advanced Approval - Example 1
Amal, a photojournalist, submits a report containing meals, accommodations, and camera equipment.
1. **Tony** (category approver) reviews expenses coded under **"6050 Cameras and AV."**
2. **Jamie** (Amal's manager, listed in "Submits to") approves and forwards.
3. **Ali** (Jamie's manager, listed in "Approves To") approves and forwards.
4. **The finance team**, the final approvers, review, approve, export, and reimburse Amal.

**Outcome:** Reports flow through category-based and hierarchical approvals.

## Advanced Approval - Example 2
Amal is on another trip and incurs a $1,200 flight and $950 in accommodations. Jamie, Amal's manager, has a rule: *If Report Total is Over $2,000, then Approves To: Lee.*

- Jamie approves, but since the total exceeds $2,000, **Lee** must also approve.
- After Lee's approval, the report goes to the **finance team** for final approval.

**Outcome:** Large expenses escalate until the report reaches an approver with the required approval limit.

