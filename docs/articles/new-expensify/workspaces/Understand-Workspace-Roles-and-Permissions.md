---
title: Understand Workspace Roles and Permissions
description: Learn what each workspace role can access and which roles can manage members, settings, cards, and payments.
keywords: [workspace roles, workspace permissions, member, workspace admin, card admin, people admin, payments admin, auditor, guest, approve-only, editor]
internalScope: Audience is workspace members and admins. Covers workspace role permissions, plan availability, and restrictions on assigning roles. Does not cover instructions for inviting members, changing roles, removing members, or transferring workspace ownership.
contentType: topic
platform: new-expensify
---

# Understand Workspace Roles and Permissions

Workspace roles determine what someone can access and do in a workspace. You can give members access to submit or approve reports, or assign roles that let them manage specific responsibilities, such as cards, members, or payments.

A **workspace member** is anyone added to a workspace, regardless of their role. **Member** is also the name of a specific role.

## What each workspace role can do

The roles available depend on your workspace plan. 

| Role | Permissions | Availability |
|---|---|---|
| **Member** | Can submit and/or approve expenses. | All workspace plans |
| **Workspace admin** | Can manage workspace members, roles, workflows, and settings and make payments. | All workspace plans |
| **Card admin** | Can manage the Expensify Card and company cards, including issuing cards, setting limits, and assigning company cards. | Control |
| **People admin** | Can manage certain workspace members and configure approval workflows. Cannot add or remove admins or assign admin roles. | Control |
| **Payments admin** | Can manage payment settings, including business bank accounts, the authorized expense payer, and payment methods. Can pay reports when workspace payments are enabled, subject to bank account access. | Control |
| **Auditor** | Can view and comment on reports and view workspace settings. Cannot change settings, approve or pay reports, or take control of reports. | Control |
| **Guest** | Can submit reports with limited visibility. Cannot view the workspace member list or create rooms. | Control |
| **Approve-only** | Can approve reports but cannot create expenses on the workspace. | Control |
| **Editor** | Can edit workspace settings but does not have access to all workspace expenses. Cannot add admins or change other members’ roles. | Submit |

## What settings admin roles can access

Card admins, People admins, and Payments admins have access to the workspace settings needed for their responsibilities.

| Role | Sections they can edit | Settings they can view without editing |
|---|---|---|
| **Workspace admin** | All workspace sections | All workspace settings | 
| **Card admin** | Expensify Card and Company cards | Overview and Members |
| **People admin** | Members and the **Approvals** section of **Workflows** | Overview |
| **Payments admin** | The **Payments** section of **Workflows** | Overview and Members |

Other workspace settings pages are hidden for Card admins, People admins, and Payments admins.

Auditors have read-only access to all workspace settings pages, including Categories, Tags, Rules, Workflows, and Accounting.

## Who can add or remove members and change roles

**Workspace admins** can invite and remove members and change their roles, including assigning or removing admin roles.

**People admins** can invite, remove, and change roles only for the following roles:

- Member
- Guest
- Auditor
- Approve-only

People admins cannot add or remove Workspace admins, Card admins, People admins, or Payments admins, or change someone to or from one of those roles.

**Editors** on Submit workspaces cannot add admins or change other members’ roles.

## How workspace ownership is determined

Every workspace has a workspace owner, who is the workspace admin responsible for subscription billing and the payment card. This is separate from workspace roles.

To learn more about workspace ownership, see [What is a workspace owner](/articles/new-expensify/billing-and-subscriptions/Learn-About-Billing-Permissions#what-is-a-workspace-owner). To change a workspace's owner, see [Transfer Workspace Ownership](/articles/new-expensify/billing-and-subscriptions/manage-your-subscription-and-billing/manage-billing/Transfer-Workspace-Ownership).

## Related articles

 - [Invite Members to a Workspace](/articles/new-expensify/workspaces/Invite-Members-to-a-Workspace)
 - [Manage Workspace Members and Access](/articles/new-expensify/workspaces/Manage-Workspace-Members-and-Access)



