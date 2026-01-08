---
title: Remove a Workspace Member
description: How to remove a member from a Workspace in Expensify.
keywords: [Expensify Classic, remove member, workspace]
---

Removing a member from a workspace prevents them from submitting reports to or accessing the workspace. Please note that it does not delete their account or deactivate their Expensify Card.

---

# Remove a Workspace Member

**Important:** Make sure the employee has submitted all reports, the reports have been approved and reimbursed, and they are in the final approval state.

1. Go to **Settings > Workspaces > [Workspace Name] > Members**.
2. Select the member you'd like to remove and click the **Remove** button at the top of the Members table.
3. If this member was an approver, update the approval workflow:
   - Go to **Settings > Workspaces > [Workspace Name] > Members > Approval Mode**.
   - Change the "**Submit reports to**" field to remove them as an approver.

![image of members table in a workspace]({{site.url}}/assets/images/UpdatedRemovingMembers1.png){:width="100%"}

---

# FAQ

## Will reports from this member on this workspace still be available?
Yes, as long as the reports have been submitted. You can navigate to the Reports page and enter the member's email in the search field to find them. However, draft reports will be removed from the workspace, so they will no longer be visible to the Workspace Admin.

## Can members still access their reports on a workspace after they have been removed?
Yes. Any report that has been approved will now show the workspace as "(not shared)" in their account. If it is a **Draft Report**, they will still be able to edit it and add it to a new workspace. If the report is **Approved or Paid,** they will not be able to edit it further.

## Who can remove members from a workspace?
Only **Workspace Admins**. Members cannot add or remove themselves from a workspace. **Domain Admins** who are not also Workspace Admins cannot remove a member from a workspace.

## How do I remove a member from a workspace if I am seeing an error message?
If a member is a Preferred Exporter, Billing Owner, Report Approver, or has submitted reports in the **Outstanding state**, follow these steps before removing them:

- **Preferred Exporter:**
  - Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
  - On your accounting integration, click **Configure**.
  - Select a different Workspace Admin in the dropdown for **Preferred Exporter**.

- **Billing Owner:**
  - Take over billing on the **Settings > Workspaces > [Workspace Name] > Overview** page.

- **Approval Workflow:**
  - Remove them as an approver by going to **Settings > Workspaces > [Workspace Name] > Members > Approval Mode**.
  - Change the "**Submit reports to**" field.

- **Outstanding Reports:**
  - Approve or reject the member’s reports on your **Reports** page.

