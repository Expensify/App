---
title: Assign Report Approvers to Specific Employees
description: Create approval hierarchies for expense reports.
keywords: [Expensify Classic, approve reports, levels of approval]
---


In Expensify, you can set up custom approval workflows to ensure expense reports are reviewed by the right people. This guide explains how to assign report approvers to specific employees and configure multi-level approval chains.

To assign different approvers for different employees, your workspace must use **Advanced Approvals** as the report approval workflow.

---

# Assign Report Approvers to Workspace Members

1. Head to **Setting > Workspace > [Workspace Name] > Workflows**.
2. Confirm that **Advanced Approval** is selected.
3. Navigate to **Setting > Workspace > [Workspace Name] > Members**.
4. Find the employee in the **Workspace Members table** under the **User** column. Then, check the **Submits To** column to see who approves their reports.
5. Click a member’s **Submits To** field to set or update their approver.

---

# Add Levels of Approval

1. On the **Workspace’s Members** tab, find the employee in the **Workspace Members table** and click **Settings**.
2. Select the additional levels of approval you want to add for the employee:
    - **Role**: Determines the employee’s level of access to reports and workspace settings. For instructions on setting roles, visit our [workspace roles guide](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles).
    - **Approves To**: Determines who must approve a report after this user has approved it. This creates an approval chain. When added, a note is visible in the **Details** column of the **Workspace Members table**. If blank, that user is a **final approver**.
    - **If Report Total is Over $X, then Approves To**: These two fields add an extra approver if the report total exceeds the set amount. When added, a note is visible in the **Details** column of the **Workspace Members table**.

![Image of user approval settings]({{site.url}}/assets/images/Approves_To.png){:width="100%"}

## Example of Approval Workflow

Let's look at a basic workflow:

| User | Submits To | Details |
|----------|----------|-----------------|
| Employee | Manager 1 |   |
| Manager 1 | Finance Team | Approves to Manager 2<br>Approves to Finance Team over $1000.00 |
| Manager 2 | Finance Team | Approves to Finance Team |
| Finance Team | Finance Team |  |


**Here is what this setup means:**

- The employee doesn’t approve any reports. When they submit a report, it goes to Manager 1 for approval.
- After Manager 1 approves an employee's report, it goes to Manager 2 for approval unless it is over $1,000. In that case, it goes directly to the Finance Team.
- When Manager 1 submits their own report, it goes to the Finance Team for approval.
- When Manager 2 approves a report or submits their own report, it goes to the Finance Team for approval.
- When the Finance Team submits a report, it is approved by the Finance Team. They are the final approver.

Visit our [How Complex Approval Workflows Work](https://help.expensify.com/articles/expensify-classic/reports/How-Complex-Approval-Workflows-Work) guide for more details.

---

# FAQ

## What’s the difference between “Submits to” and “Approves to?”
- **Submits to**: The person you submit your reports to for first-level approval.
- **Approves to**: The person who must approve reports that you've already approved, creating an approval chain.

## Can I change the approver on a report after submitting it?  
No, once a report has been submitted, you cannot change the approver while it is in the **outstanding state**. If you need to send the report to a different approver, you must reopen it first. To do this, retract the report from the current approver and then resubmit it to the correct person.

