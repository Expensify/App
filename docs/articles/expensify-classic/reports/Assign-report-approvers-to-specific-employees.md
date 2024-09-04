---
title: Assign report approvers to specific employees
description: Create approval hierarchies for reports  
---
<div id="expensify-classic" markdown="1">

{% include info.html %}
To assign different approvers for different employees, your workspace must use Advanced Approvals as the report approval workflow.
{% include end-info.html %}

To assign different approvers for different employees (instead of everyone submitting to the same person), your workspace must use Advanced Approval as the report approval workflow.

To assign a report approver to a specific member of your workspace, 

1. Hover over Settings, then click Workspaces.
2. Click the desired workspace name.
3. Click the Members tab on the left.
4. Scroll down to the Approval Mode section and ensure that Advanced Approval is selected.
5. Locate the employee in the Workspace Members table, which shows each member (in the User column) and who their reports are approved by (in the Submits To column). 
6. Click a user’s Submits To field to set or update their approver.

## Add levels of approval
1. On the Workspace’s Members tab, locate the employee in the Workspace Members table and click Settings.
2. Select the additional levels of approval you want to add for the employee:
    - Role: Determines the employee’s level of access to reports and workspace settings. For instructions on setting roles, visit our [workspace roles guide](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles).
    - Approves To: Determines who must approve a report after this user has approved it. This creates an approval chain. When added, a note is visible in the Details column of the Workspace Members table. If blank, the user is a “final approver.” 
    - If Report Total is Over $X then Approves To: These two fields add an extra approver if the report total exceeds the set amount. When added, a note is visible in the Details column of the Workspace Members table.

![Image of user approval settings]({{site.url}}/assets/images/Approves_To.png){:width="100%"}

## Example

Let's look at a basic workflow:

| User | Submits To | Details |
|----------|----------|-----------------|
| Employee | Manager 1 |   |
| Manager 1 | Finance Team | Approves to Manager 2<br>Approves to Finance Team over $1000.00 |
| Manager 2 | Finance Team | Approves to Finance Team |
| Finance Team | Finance Team |  |

Here is what this setup means:

- Employee doesn’t approve any reports. When they submit a report, it goes to Manager 1 for approval.
- After Manager 1 approves a report from the Employee, the report goes to Manager 2 for approval unless the report is over $1,000. In that case, it goes directly to the Finance Team.
- When Manager 1 submits their own report, it goes to the Finance Team for approval. 
- When Manager 2 approves a report or submits their own report, it goes to the Finance Team for approval.
- When the Finance Team submits a report, it is approved by the Finance Team. They are the final approver.

Visit our How Complex Approval Workflows Work guide for more details.

## FAQ

What’s the difference between “Submits to” and “Approves to?”
- Submits to: The person you submit your reports to for 1st level approval.
- Approves to: The person you send reports that you've approved so they can complete an additional approval. This creates an approval chain. 

</div>
