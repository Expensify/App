---
title: Create and Manage Domain Groups
description: Learn how to create domain groups to apply different rules to different domain members.
internalScope: Audience is Domain Admins. Covers creating and managing Domain Groups (Domain Security Groups) and what each group permission controls. Does not cover workspace-level rules configuration or troubleshooting user access issues.
keywords: [New Expensify, domain groups, domain security groups, how to create domain group, restrict workspace creation, enforce workspace rules, require company email, preferred workspace, Expensify Card preferred workspace, domain permissions, Domain Admin]
---

# Create and Manage Domain Groups

Domain Groups, also called Domain Security Groups, let you apply different permissions and rules to different sets of domain members. This is useful when different teams or roles need different permissions, such as employees versus managers.

---

## Who can use Domain Groups

Only **Domain Admins** can create and manage Domain Groups.

---

## Where to find Domain Groups

1. Go to Settings using the navigation tabs (on the left on web, on the bottom on mobile). 
2. Click **Workspaces > Domains**.
3. Choose your domain.
4. Click **Groups**.

---

## How to create a Domain Group

To create a Domain Group: 

1. Navigate to **Groups** inside your domain.
2. Click **Create group**.
3. Configure the group settings.
4. Click **Save**.

---

## Domain Group permission settings explained

When creating or editing a Domain Group, you can configure the following settings:

**Default group**

Enable this if you want all new domain members to be automatically added to this group. Setting a Default Group ensures new employees receive the correct permissions immediately.

**Strictly enforce expense workspace rules**

Use this to ensure workspace-level rules are followed before a report is submitted. Enabling Strictly enforce expense workspace rules ensures policy compliance and prevents incomplete submissions.

**Restrict primary contact method selection**

Enable this to require members to use their company email address to access Expensify. Restricting primary contact method selection prevents members from using a personal email to access their Expensify account.

**Restrict expense workspace creation/removal**

Enable this to prevent members from creating or removing workspaces. Restrict expense workspace creation/removal ensures centralized workspace management and prevents employees from creating additional workspaces outside the company’s approved setup.


**Preferred workspace**

Set a preferred workspace to automatically route a group’s expenses and reports to a specific workspace. This is helpful if different members use different workspaces and you want to reduce manual workspace selection. If you have multiple workspaces, use this to route a group’s expenses to the right workspace by default.

**Expensify Card preferred workspace**

If a preferred workspace is set, enable this option to automatically post **Expensify Card** transactions to that workspace. This ensures transactions are routed correctly and reconciliation is simplified. 

---

## How to enforce workspace rules for domain members

Create a **Domain Group** and enable **Strictly enforce expense workspace rules** to prevent report submission unless all workspace rules are met. This helps automate compliance and reduce back-and-forth corrections.

## How to prevent members from creating workspaces

Enable **Restrict expense workspace creation/removal** to block unauthorized workspace creation. This keeps workspace structure controlled and consistent.

## How to require employees to use their company email

Enable **Restrict primary contact method selection** to ensure members use their company email address instead of a personal email. This improves domain security and access control.

## How to automatically assign a default workspace

Set a **Preferred workspace** to automatically route expenses and reports for that group. If using the Expensify Card, enable **Expensify Card preferred workspace** to route card transactions as well.

---

# FAQ

## What is the difference between a Domain Group and a Workspace?

A Domain Group controls permissions and access settings at the domain level. A Workspace controls expense rules, approvals, and reporting settings.

## Can a member belong to more than one Domain Group?

No, each member can only belong to one Domain Group.

## What happens if I set a Default group?

New domain members are automatically assigned to that group, ensuring they receive the correct permissions immediately.

## Does Preferred workspace move existing expenses?

No. Preferred workspace applies to new expenses and reports going forward.
