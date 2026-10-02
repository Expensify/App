---
title: View the Violations by approver report
description: Learn how Workspace Admins and Auditors can use the Violations by approver report to see which approvers approved the most expenses with rule violations.
keywords: [New Expensify, Violations by approver, top forgivers, approved violations, has:approved-violation, any-approval, group-by:violation-approver, policy violations, compliance, approver, approvals, Workspace Admin, Auditor, Rules, insight, virtual CFO, spend insights, rule violation, lenient approver]
internalScope: Audience is Workspace Admins and Auditors on Control workspaces with Rules and Approvals enabled. Covers using the Violations by approver suggested search to see which approvers approved the most expenses with violations. Does not cover configuring Rules or approval workflows, submitter-stage violations, or building custom reports.
---

# View the Violations by approver report

The Violations by approver report shows which approvers approved the most expenses with violations last month. Use it to see who is letting rule violations through, spot approval patterns, and decide where approvers may need guidance or tighter oversight.

The report is a pre-built suggested search and is available only for Control workspaces with Rules and Approvals enabled.

If Rules are not enabled, [learn how to set up Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).

---

## Who can use the Violations by approver report

Workspace Admins and Auditors can use the Violations by approver report on web and mobile when:

 - The workspace is on the Control plan.
 - Rules are enabled for the workspace.
 - Approvals are enabled for the workspace.
 - The workspace has two or more members.

---

## How to view the Violations by approver report

**Web:**  
1. Use the navigation tabs on the left and select **Spend**. 
2. Under **Insights**, select **Violations by approver**.

**Mobile:**  
1. From the navigation tabs on the bottom, tap **Spend**.
2. Tap the hamburger menu in the top-left corner, then select **Violations by approver**.

The report groups expenses that had a violation when they were approved last month by the approver who approved them.

---

## What information the Violations by approver report displays

The Violations by approver report groups expenses that had a violation at the time of approval by the approver who approved them.

Each row represents an approver and shows:

 - **Violation approver** – the approver who approved the expenses
 - **Expenses** – the number of expenses with violations the approver approved
 - **Approval count** – the number of approvals the approver made on those expenses
 - **Approved total** – the total amount of those expenses

Select a row to view the approver’s individual expenses. The **Violations** column shows the violations each expense had when it was approved, such as a missing receipt or an amount over a workspace limit. If an expense has multiple violations, they are separated by commas.

<!-- SCREENSHOT:
Suggestion: The Violations by approver report in Table view with one approver row expanded to show individual expenses and the Violations column.
Location: After the paragraph describing how to select a row.
Purpose: Shows how the Violation approver, Approval count, and Approved total columns differ from the other Insights tables, and where approval-stage violations appear for each expense.
-->

---

# FAQ

## How is the Violations by approver report different from the Violations by submitter report?

The Violations by submitter report shows who submitted expenses that broke your workspace rules. The Violations by approver report shows who approved expenses that still had violations when they were approved. Use both together to see whether violations are being caught during approval.

[Learn more about the Violations by submitter report](/articles/new-expensify/insights/View-the-Violations-by-submitter-report).

## Can I customize the Violations by approver report?

You can change filters such as the approval date range, workspace, or approver to explore the results further. Because Violations by approver is a built-in suggested search, you can’t save changes directly to the suggested search.

To create your own custom search, [learn how to use search operators to filter and analyze spend](/articles/new-expensify/reports-and-expenses/Use-Search-Operators-to-Filter-and-Analyze).

## Can I export the Violations by approver report?

Not directly — the Violations by approver report can’t be exported with its grouped totals or summary data. However, if you expand each group to reveal the individual expenses, you can then select those expenses and use Export to CSV to download the raw data.

## Why can’t I see the Violations by approver report?

The Violations by approver report only appears when all of the following are true:

 - You’re a Workspace Admin or Auditor on the workspace.
 - The workspace is on the Control plan.
 - Rules and Approvals are both enabled for the workspace.
 - The workspace has two or more members.

## How is the Violations by approver report calculated?

The report uses expenses that were approved during the previous calendar month and had a violation at the time of approval. It groups them by the approver who approved them and shows the top 10 approvers by the number of expenses with violations.
