---
title: Invite Members to a Workspace
description: Learn how to invite members to a workspace directly, or import members from a spreadsheet.
keywords: [invite members, add members, invite users, workspace invitation, bulk invite, import members, spreadsheet import, member import template]
internalScope: Audience is workspace admins and People admins. Covers inviting workspace members directly, and importing members from a spreadsheet, including field mapping and plan requirements. Does not cover changing existing members' roles, removing members, or detailed role permissions.
contentType: task
platform: new-expensify
---

# Invite Members to a Workspace

You can invite members to your workspace by name, email, or phone number. To invite members in bulk and configure their roles or approval workflows at the same time, import them from a spreadsheet.

## Who can invite workspace members

**Workspace admins** can invite members with any available workspace role.

**People admins** can invite members only with the following roles:

- Member
- Guest
- Auditor
- Approve-only

People admins cannot invite someone as a Workspace admin, Card admin, People admin, or Payments admin. [Learn what each workspace role can do](/articles/new-expensify/workspaces/Understand-Workspace-Roles-and-Permissions#what-each-workspace-role-can-do).

## How to invite members directly

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select **Invite member**.
4. Search for and select the people you want to invite by name, email, or phone number.
5. Select **Role** to set their permissions on the workspace.
6. (Optional) Add a message to the invitation.
7. Select **Invite**.

You can select multiple people before sending the invitation.

If you are inviting an agent, search results include only agents you can manage, such as your personal agents and company agents owned by a workspace or domain you administer. To create an agent that belongs to the workspace, see [Create and Manage Company Agents](/articles/new-expensify/ai-agents/Create-and-Manage-Company-Agents).

## How to import members from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select **More**.
4. Choose **Import via Spreadsheet**.
5. Drag and drop your file or select **Choose file** to browse.
6. Map the columns in your file to the corresponding member fields.
7. Select **Import**.

Use the [member import template](https://docs.google.com/spreadsheets/d/19fjknN-KOS74RjXDccXZGUNTm-utdV7Gvveo5EyrJLE/edit?gid=0#gid=0) to prepare your file.

### What member fields can I import?

| Field | Purpose | Control plan required |
|---|---|---|
| **Email** | Identifies the member to invite. Required. | No |
| **Role** | Assigns the member’s workspace role. | Depends on the role |
| **Submit to** | Sets who receives the member’s reports for approval. | Yes |
| **Forward to** | Sets the next approver in the approval workflow. | Yes |
| **Over limit forward to** | Sets who receives reports that exceed the approval limit. | Yes |
| **Approval limit** | Sets the approval limit as an amount in the workspace currency. | Yes |
| **Custom field 1** | Sets the member’s first custom field value. | Yes |
| **Custom field 2** | Sets the member’s second custom field value. | Yes |

Mapping the approval fields configures each member’s approval workflow. You can review these settings under **Workflows** after the import completes.

**Note:** If your spreadsheet maps a field or assigns a role that requires the Control plan, you may see a prompt to upgrade. [Learn about the available plans in Expensify](/articles/new-expensify/billing-and-subscriptions/explore-plans-subscriptions-and-pricing/Compare-Collect-and-Control-Plans#common-feature-differences-between-collect-and-control).

For details about configuring approvals using the **Submit to**, **Forward to**, **Over limit forward to** and **Approval limit**, see [Add Approvals](/articles/new-expensify/workspaces/Add-Approvals).

## Related articles

 - [Manage Workspace Members and Access](/articles/new-expensify/workspaces/Manage-Workspace-Members-and-Access)
 - [Understand Workspace Roles and Permissions](/articles/new-expensify/workspaces/Understand-Workspace-Roles-and-Permissions)
