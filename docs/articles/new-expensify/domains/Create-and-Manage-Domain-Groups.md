---
title: Create and Manage Domain Groups
description: Learn how to create and manage domain groups (domain security groups) to apply different permission rules to different sets of domain members.
internalScope: Audience is Domain Admins. Covers creating and managing Domain Groups (Domain Security Groups) and what each group permission controls. Does not cover workspace-level rules configuration or troubleshooting user access issues.
keywords: [New Expensify, domain groups, domain security groups, how to create domain group, restrict workspace creation, enforce workspace rules, require company email, preferred workspace, Expensify Card preferred workspace, domain permissions, Domain Admin]
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
3. Scroll below your workspaces list to find **Domains**.
4. Click your domain.
5. Click **Groups**.

---

## How to create a Domain Group

Follow the steps in **Where to find Domain Groups** above, then:

1. Click **Create group**.
2. Configure the group settings and permissions (see **What Domain Group permission settings control** below).
3. Click **Save**.

---

## What Domain Group permission settings control

## What the Default group setting does

Enable this if you want all new domain members to be automatically added to this group. Setting a Default Group ensures new employees receive the correct permissions immediately.

## What Strictly enforce expense workspace rules does

Use this to ensure workspace-level rules are followed before a report is submitted. Enabling Strictly enforce expense workspace rules ensures workspace rule compliance and prevents incomplete submissions.

## What Restrict primary contact method selection does

Enable this to require members to use their company email address to access Expensify. Restricting primary contact method selection prevents members from using a personal email to access their Expensify account.

## What Restrict expense workspace creation/removal does

Enable this to prevent members from creating or removing workspaces. Restrict expense workspace creation/removal ensures centralized workspace management and prevents employees from creating additional workspaces outside the company’s approved setup.

## What Preferred workspace does

Set a preferred workspace to automatically route a group’s expenses and reports to a specific workspace. This is helpful if different members use different workspaces and you want to reduce manual workspace selection. If you have multiple workspaces, use this to route a group’s expenses to the right workspace by default.

## What Expensify Card preferred workspace does

If a preferred workspace is set, enable this option to automatically post **Expensify Card** transactions to that workspace. This ensures transactions are routed correctly and reconciliation is simplified.

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

</div>
