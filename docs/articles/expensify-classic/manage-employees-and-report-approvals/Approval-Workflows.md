---
title:  Managing employees and reports > Approval workflows
description: Set up the workflow that your employees reports should flow through.
---
<!-- The lines above are required by Jekyll to process the .md file -->

# About
## Overview


This document explains how to manage employee expense reports and approval workflows in Expensify.


### Approval workflow modes


#### Submit and close
- This is a workflow where no approval occurs in Expensify.
- *What happens after submission?* The report state becomes Closed and is available to view by the member set in Submit reports to and any Workspace Admins.
- *Who should use this workflow?* This mode should be used where you don't require approvals in Expensify.


#### Submit and approve
- *Submit and approve* is a workflow where all reports are submitted to a single member for approval. New policies have Submit and Approve enabled by default.
- *What happens after submission?*  The report state becomes Processing and it will be sent to the member indicated in Submit reports to for approval. When the member approves the report, the state will become Approved.
- *Who should use this workflow?* This mode should be used where the same person is responsible for approving all reports for your organization. If submitters have different approvers or multiple levels of approval are required, then you will need to use Advance Approval.


#### Advanced Approval
- This approval mode is used to handle more complex workflows, including:
  - *Multiple levels of approval.* This is for companies that require more than one person to approve a report before it can be reimbursed. The most common scenario is when an employee needs to submit to their manager, and their manager needs to approve and forward that report to their finance department for final approval.
  - *Varying approval workflows.* For example, if a company has Team A submitting reports to Manager A, and Team B to Manager B, use Advanced Approval. Group Workspace Admins can also set amount thresholds in the case that a report needs to go to a different approver based on the amount.
- *What happens after submission?* After the report is submitted, it will follow the set approval chain. The report state will be Processing until it is Final Approved. We have provided examples of how to set this up below.
- *Who should use this workflow?* Organizations with complex workflows or 2+ levels of approval. This could be based on manager approvals or where reports over a certain size require additional approvals.
- *For further automation:* use Concierge auto-approval for reports. You can set specific rules and guidelines in your Group Workspace for your team's expenses; if all expenses are below the Manual Approval Threshold and adhere to all the rules, then we will automatically approve these reports on behalf of the approver right after they are submitted.


### How to set an approval workflow

- Step-by-step instructions on how to set this up at the Workspace level [here](link-to-instructions).

# Deep Dive

### Setting multiple levels of approval
- 'Submits to' is different than 'Approves to'.
  - *Submits to* - is the person you are sending your reports to for 1st level approval
  - *Approves to* - is the person you are sending the reports you've approved for higher-level approval
- In the example below, a report needs to be approved by multiple managers: *Submitter > Manager > Director > Finance/Accountant*
  - *Submitter (aka. Employee):* This is the person listed under the member column of the People page.
  - *First Approver (Manager):* This is the person listed under the Submits to column of the People Page.
  - *Second Approver (Director):* This is the person listed as 'Approves to' in the Settings of the First Approver.
  - *Final Approver (Finance/Accountant):* This is the person listed as the 'Approves to' in the Settings of the Second Approver.
- This is what this setup looks like in the Workspace Members table.
  - Bryan submits his reports to Jim for 1st level approval.
![Screenshot showing the People section of the workspace]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_1.png){:width="100%"}

  - All of the reports Jim approves are submitted to Kevin. Kevin is the 'approves to' in Jim's Settings.
![Screenshot of Policy Member Editor]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_2.png){:width="100%"}

  - All of the reports Kevin approves are submitted to Lucy. Lucy is the 'approves to' in Kevin's Settings.
![Screenshot of Policy Member Editor Approves to]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_3.png){:width="100%"}


  - Lucy is the final approver, so she doesn't submit her reports to anyone for review.
![Screenshot of Policy Member Editor Final Approver]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_4.png){:width="100%"}


- The final outcome: The member in the Submits To line is different than the person noted as the Approves To.
### Adding additional approver levels
- You can also set a specific approver for Reports Totals in Settings.
![Screenshot of Policy Member Editor Approves to]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_5.png){:width="100%"}

- An example: The submitter's manager can approve any report up to a certain limit, let's say $500, and forward it to accounting. However, if a report is over that $500 limit, it has to be also approved by the department head before being forwarded to accounting.
- To configure, click on Edit Settings next to the approving manager's email address and set the "If Report Total is Over" and "Then Approves to" fields.
![Screenshot of Workspace Member Settings]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_6.png){:width="100%"}
![Screenshot of Policy Member Editor Configure]({{site.url}}/assets/images/ManagingEmployeesAndReports_ApprovalWorkflows_7.png){:width="100%"}


### Setting category approvals
- If your expense reports should be reviewed by an additional approver based on specific categories or tags selected on the expenses within the report, set up category approvers and tag approvers.
- Category approvers can be set in the Category settings for each Workspace
- Tag approvers can be set in the Tag settings for each Workspace


#### Category approver
- A category approver is a member who is added to the approval workflow for any reports in your Expensify Workspace that contain expenses with a specific category.
- For example: Your HR director Jim may need to approve any relocation expenses submitted by employees. Set Jim up as the category approver for your Relocation category, then any reports containing Relocation expenses will first be routed to Jim before continuing through the approval workflow.
- Adding category approvers
  - To add a category approver in your Workspace:
    - Navigate to *Settings > Policies > Group > [Workspace Name] > Categories*
    - Click *"Edit Settings"*  next to the category that requires the additional approver
    - Select an approver and click *"Save"*


#### Tag approver
- A tag approver is a member who is added to the approval workflow for any reports in your Expensify Workspace that contain expenses with a specific tag.
- For example: If employees must tag project-based expenses with the corresponding project tag. Pam, the project manager is set as the project approver for that project, then any reports containing expenses with that project tag will first be routed to Pam for approval before continuing through the approval workflow.
- Please note: Tag approvers are only supported for a single level of tags, not for multi-level tags. The order in which the report is sent to tag approvers relies on the date of the expense.
- Adding tag approvers
  - To add a tag approver in your Workspace:
    - Navigate to *Settings > Policies > Group > [Workspace Name] > Tags*
    - Click in the "Approver" column next to the tag that requires an additional approver


Category and Tag approvers are inserted at the beginning of the approval workflow already set on the People page. This means the workflow will look something like: * *Submitter > Category Approver(s) > Tag Approver(s) > Submits To > Previous approver's Approves To.*


### Workflow enforcement
- If you want to ensure your employees cannot override the workflow you set - enable workflow enforcement. As a Workspace Admin, you can choose to enforce your approval workflow by going to Settings > Workspaces > Group > [Workspace Name] > People > Approval Mode. When enabled (which is the default setting for a new workspace), submitters and approvers must adhere to the set approval workflow (recommended). This setting does not apply to Workspace Admins, who are free to submit outside of this workflow
