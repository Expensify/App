---
title: Manage Workspace Members and Access
description: Learn how to change workspace member roles, remove members, set display names, update work arrangements and download a CSV.
keywords: [workspace members, change role, remove member, remove users, filter members, member display name, download members, export members, member CSV, workspace access, work arrangement, commute exclusions, exclude usual commute, office-based, remote or mobile, default work arrangement, mileage commute]
internalScope: Audience is workspace admins, People admins, and other members with access to workspace member settings. Covers changing existing members' roles, removing members individually or in bulk, filtering by role, setting display names, and downloading a member CSV. Does not cover inviting members, detailed role comparisons, or instructions for transferring workspace ownership.
contentType: task
platform: new-expensify
---

# Manage Workspace Members and Access

Use the workspace **Members** page to update member roles and details, remove members, filter the member list, or download a CSV.

To add a member to your workspace, see [Invite Members to a Workspace](/articles/new-expensify/workspaces/Invite-Members-to-a-Workspace). For a comparison of role permissions, see [Understand Workspace Roles and Permissions](/articles/new-expensify/workspaces/Understand-Workspace-Roles-and-Permissions).

## Who can change roles or remove members

**Workspace admins** can change members’ roles and remove members, including admins.

**People admins** can remove members or change their roles only between the following roles:

- Member
- Guest
- Auditor
- Approve-only

## How to change a member’s role

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select the member’s name.
4. Select **Role**.
5. Choose the new role and select **Save**.

On web, you can also hover over the member’s **Role** in the member list and select the pencil icon to change it.

### Why the authorized payer’s role can't be changed

You cannot change the role of the member designated as the workspace’s authorized **Payer**. Role-change options are hidden until a different payer is assigned.

To change their role, first go to **Workspaces > [workspace name] > Workflows > Payments** and set a different admin as the **Payer**. Then return to **Members** to change the previous payer’s role.

## How to remove a workspace member

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select the member you want to remove.
4. Select **Remove from workspace**.
5. Select **Remove** to confirm.

If the removed member is an approver on an outstanding report, the workspace owner replaces them as the approver. Learn more about [automatic approver reassignment](/articles/new-expensify/workspaces/Add-Approvals).

## How to remove multiple members from a workspace

On web:

1. In the navigation tabs on the left, select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select the checkboxes next to the members you want to remove.
4. From the selection bar, select **Remove members**. 
5. Select **Remove** to confirm.

On mobile: 

1. In the navigation tabs on the bottom, select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Long press a member you want to remove and tap **Select**.
4. Select the checkboxes next to the members you want to remove.
5. Tap **Selected**.
6. Choose **Remove members**.
7. Select **Remove** to confirm.

The same role restrictions and automatic approver reassignment apply when removing multiple members.

## How to filter the Members table

You can filter the Members table by workspace role or approver assignment. The **Approvers** filter shows members designated as approvers, while **Approve-only** shows members assigned the Approve-only role.

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select **Filters**.
4. Select one or more role filters.
5. Select **Apply**.

## How to set a member’s display name

Workspace admins can set a display name for a member who has not added a name of their own. If the member has already set their name, only they can edit it.

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select the member you want to update.
4. Select **Display name**.
5. Enter a first and last name, then select **Save**.

The name applies in every workspace the member belongs to. After it is saved, **Display name** will not be editable and only the member can change it.

**Note:** You can only set a display name if the member has not added a name of their own. If the member has already set their name, only they can edit it. [Learn how to update your display name on your account](/articles/new-expensify/settings/Account-Settings#how-to-update-your-display-name-or-legal-name).

## How to set a member’s work arrangement for commute exclusions

On Control workspaces using **Exclude usual commute**, workspace admins can set each member’s **Work arrangement** to determine how commute exclusions apply to their mileage expenses.

Members use the workspace’s **Default work arrangement** unless an individual work arrangement has been set.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Members**.
2. Select the member’s name.
3. Select **Work arrangement**.
4. Choose **Office-based** or **Remote or mobile**. The change saves automatically.

The work arrangement determines which commute exclusions apply:

- **Office-based:** The member has a regular office commute. Direct home-to-office trips are excluded, and the usual one-way commute distance is subtracted from home-to-client or client-to-home trips.
- **Remote or mobile:** The member works from home or travels between locations without a regular office. Home-and-office commute exclusions do not apply.

Changes apply only to future mileage calculations. Existing mileage expenses are not recalculated.

[Learn how to enable home-and-office commute exclusions](/articles/new-expensify/workspaces/Set-distance-rates#-How-to-exclude-commutes-using-home-and-office-locations).

**Work arrangement** does not affect the **Remove fixed distance** method.

## How to download a CSV of workspace members

Workspace admins, people admins, and editors on Submit workspaces can download a CSV of workspace members.

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Members**.
3. Select **More**.
4. Select **Download CSV**.

The file downloads to your device.

Members, auditors, card admins, and payments admins cannot download the workspace member list.

# FAQ

## Why can’t I edit a member’s display name?

Workspace admins can only set a display name for a member who hasn’t added a name of their own. Once a name is saved, only the member can change it. They can follow the steps to [update their account display name](/articles/new-expensify/settings/Account-Settings#how-to-update-your-display-name-or-legal-name).
