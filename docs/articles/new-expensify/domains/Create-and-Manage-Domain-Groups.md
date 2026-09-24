---
title: Create and Manage Domain Groups
description: Learn how to create and manage domain groups (domain security groups) to apply different permission rules to different sets of domain members.
internalScope: Audience is Domain Admins. Covers creating and managing Domain Groups (Domain Security Groups), setting a Preferred Workspace for a group, and what each group permission controls. Does not cover workspace-level rules configuration or troubleshooting user access issues.
keywords: [New Expensify, domain groups, domain security groups, how to create domain group, restrict workspace creation, enforce workspace rules, restrict default login selection, preferred workspace, search preferred workspace, find a workspace in domain group, Expensify Card preferred workspace, domain permissions, Domain Admin]
---

<div id="new-expensify" markdown="1">

*Workspaces > Domains > [Domain Name] > Groups*

# Create and Manage Domain Groups

Domain Groups, also called Domain Security Groups, let you apply different permissions and rules to different sets of domain members. This is useful when different teams or roles need different permissions, such as employees versus managers.

Your domain must be verified before you can create Domain Groups. Learn how to [claim and verify a domain](https://help.expensify.com/articles/new-expensify/domains/Claim-and-Verify-a-Domain).

---

## Who can use Domain Groups

Only **Domain Admins** can create and manage Domain Groups.

---

## Where to find Domain Groups

1. Click the navigation tabs (on the left on web, on the bottom on mobile).
2. Click **Workspaces**.
3. Click **Domains**.
4. Click your domain.
5. Click **Groups**.

---

## How to create a Domain Group

Follow the steps in **Where to find Domain Groups** above, then:

1. Click **New group**.
2. Enter a name for the group.
3. Configure the group settings and permissions (see **What Domain Group permission settings control** below).
4. Click **Create group**.

---

## How to set a Preferred Workspace for a Domain Group

Follow the steps in **Where to find Domain Groups** above, then:

1. Click the group you want to update.
2. Turn on **Preferred Workspace**.
3. Click the **Preferred Workspace** row that appears below the toggle.
4. If you administer 12 or more workspaces, a **Search** field is shown above the list. Type part of a workspace name to filter the list.
5. Click the workspace you want to use.

The list shows only the workspaces you administer. If a search returns nothing, **No results found** is shown, so clear the search and try a different name.

You can set the **Preferred Workspace** the same way while creating a group, before you click **Create group**.

<!-- SCREENSHOT:
Suggestion: The Preferred Workspace selector for a domain group on an account that administers 12 or more workspaces, with the Search field visible above the workspace list and a partial workspace name typed in.
Location: Immediately after the steps in "How to set a Preferred Workspace for a Domain Group".
Purpose: Domain Admins who administer many workspaces do not expect a search field here and scroll the full list instead; showing the field in place confirms where to type and that the list filters as they type.
-->

---

## What Domain Group permission settings control

## What the Default group for new members setting does

Enable this if you want all new domain members to be automatically added to this group. Setting a default group ensures new employees receive the correct permissions immediately.

## What Strictly enforce workspace rules does

Use this to ensure workspace-level rules are followed before a report is submitted. Enabling **Strictly enforce workspace rules** ensures workspace rule compliance and prevents incomplete submissions.

## What Restrict default login selection does

Enable this to require members to use their company email address to access Expensify. **Restrict default login selection** prevents members from changing their login email away from your company domain.

## What Restrict expense workspace creation/removal does

Enable this to prevent members from creating or removing workspaces. **Restrict expense workspace creation/removal** ensures centralized workspace management and prevents employees from creating additional workspaces outside the company’s approved setup.

## What Preferred Workspace does

Set a **Preferred Workspace** to automatically route a group’s expenses and reports to a specific workspace. This is helpful if different members use different workspaces and you want to reduce manual workspace selection. If you have multiple workspaces, use this to route a group’s expenses to the right workspace by default.

## What Expensify Card preferred workspace does

If a **Preferred Workspace** is set, enable this option to automatically post **Expensify Card** transactions to that workspace instead. This ensures transactions are routed correctly and reconciliation is simplified. Your domain must have Expensify Cards set up before you can enable it.

---

# FAQ

## What is the difference between a Domain Group and a Workspace?

A Domain Group controls permissions and access settings at the domain level. A Workspace controls expense rules, approvals, and reporting settings.

## Can a member belong to more than one Domain Group?

No, each member can only belong to one Domain Group.

## What happens if I set a default group?

New domain members are automatically assigned to that group, ensuring they receive the correct permissions immediately.

## Does Preferred Workspace move existing expenses?

No. **Preferred Workspace** applies to new expenses and reports going forward.

## Why don’t I see a Search field on the Preferred Workspace page?

The **Search** field is shown only when you administer 12 or more workspaces. With fewer than 12, the full list is short enough to scroll, so no search field is shown.

## Which workspaces appear on the Preferred Workspace page?

Only the workspaces you administer. If a workspace is missing, ask a Workspace Admin of that workspace to add you as an admin.

</div>
