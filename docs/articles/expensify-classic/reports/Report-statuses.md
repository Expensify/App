---
title: Report-Statuses.md
description: Learn what each report status means in Expensify and how it progresses through the approval workflow.
keywords: [report status, approval process, Expensify workflow, reimbursed, approved, closed, Expensify Classic]
---

# Report Statuses

In Expensify, every report moves through different statuses based on its stage in the approval process. Understanding these statuses helps ensure reports are properly submitted, approved, and reimbursed.

## Status Definitions

- **Open** – The report is "In Progress" and has not been submitted.  
  - If a report is also labeled **Rejected**, it means an Approver has sent it back for changes.  
  - Open the report to review comments and make necessary adjustments.  

- **Processing** – The report has been submitted and is pending approval.

- **Approved** – The report has been approved but not reimbursed.  
  - For non-reimbursable reports, this is the final status.  

- **Reimbursed** – The report has been successfully reimbursed.  
  - If a reimbursed report is labeled:  
    - **Withdrawing** – The ACH process has been initiated.  
    - **Confirmed** – The ACH process is in progress or completed.  

- **Closed** – The report has been finalized and is no longer editable.  

## When Reports Are Marked as Closed

A report is automatically marked **Closed** under these conditions:

- **Individual Workspace** – Reports are closed by default after submission.  
- **Group Workspace with Submit and Close Workflow** – Reports automatically close upon submission.  

For **Group Workspaces using Submit and Approve or Advanced Approval Workflows**, reports are finalized based on the expense type:

- **Non-reimbursable expenses** – The report is finalized when it enters the **Approved** state.  
- **Reimbursable expenses** – The report is finalized when it enters the **Reimbursed** state.  
  - This applies whether the report is reimbursed via Expensify or manually marked as reimbursed outside Expensify.  
- **Mixed reimbursable and non-reimbursable expenses** – The report is finalized when it reaches the **Reimbursed** state.  

---

For more details on report approval workflows, visit **[Expensify Help Center](#)**
