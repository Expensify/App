---
title: Remove a Workspace Member
description: How to remove a member from a Workspace in Expensify 
---

Removing a member from a workspace disables their ability to use the workspace. Please note that it does not delete their account or deactivate the Expensify Card.

## How to Remove a Workspace Member
1. Important: Make sure the employee has submitted all Draft reports and the reports have been approved, reimbursed, etc. 
2. Go to Settings > Workspaces > Group > [Workspace Name] > Members > Workspace Members
3. Select the member you'd like to remove and click the **Remove** button at the top of the Members table.
4. If this member was an approver, make sure that reports are not routing to them in the workflow.

![image of members table in a workspace]({{site.url}}/assets/images/ExpensifyHelp_RemovingMembers.png){:width="100%"}

# FAQ

## Will reports from this member on this workspace still be available?
Yes, as long as the reports have been submitted. You can navigate to the Reports page and enter the member's email in the search field to find them. However, Draft reports will be removed from the workspace, so these will no longer be visible to the Workspace Admin.  

## Can members still access their reports on a workspace after they have been removed?
Yes. Any report that has been approved will now show the workspace as “(not shared)” in their account. If it is a Draft Report  they will still be able to edit it and add it to a new workspace. If the report is Approved or Reimbursed they will not be able to edit it further. 

## Who can remove members from a workspace?
Only Workspace Admins. It is not possible for a member to add or remove themselves from a workspace. It is not possible for a Domain Admin who is not also a Workspace Admin to remove a member from a workspace. 

## How do I remove a member from a workspace if I am seeing an error message?
If a member is a **preferred exporter, billing owner, report approver** or has **processing reports**, to remove them the workspace you will first need to: 

* **Preferred Exporter** - go to Settings > Workspaces > Group > [Workspace Name] > Connections > Configure and select a different Workspace Admin in the dropdown for **Preferred Exporter**. 
* **Billing Owner** - take over billing on the Settings > Workspaces > Group > [Workspace Name] > Overview page. 
* **Processing reports** - approve or reject the member’s reports on your Reports page. 
* **Approval Workflow** - remove them as a workflow approver on your Settings > Workspaces > Group > [Workspace Name] > Members > Approval Mode > page by changing the "**Submit reports to**" field.  

## How do I remove a user completely from a company account?   
If you have a Control Workspace and have Domain Control enabled, you will need to remove them from the domain to delete members' accounts entirely and deactivate the Expensify Card.
