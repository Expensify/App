---
title: Domain Groups
description: Learn how to create domain groups to apply different rules to different domain members.
internalScope: Audience is Domain Admins. Covers creating and managing Domain Groups (Domain Security Groups) and what each group permission controls. Does not cover workspace-level rules configuration or troubleshooting user access issues.
keywords: [New Expensify, domain groups, domain security groups, domain control, permissions, rules]
---

<div id="new-expensify" markdown="1">

*Settings > Workspaces > Domains > [Domain Name] > Groups*

Domain Groups, also called Domain Security Groups, let you apply different domain rules to different sets of domain members. This is useful when different teams or roles need different permissions, such as employees versus managers.

---

## Create and Manage Domain Groups

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Open **Groups**.
4. Click **Create group**.
5. Configure the group settings and permissions:
   - **Group name**: Name the group.
   - **Default group**: Choose whether new domain members are automatically added to this group.
   - **Strictly enforce expense workspace rules**: Require all workspace rules to be met before members can submit.
   - **Restrict primary contact method selection**: Prevent members from using a personal email to access their Expensify account.
   - **Restrict expense workspace creation/removal**: Prevent members from creating or removing workspaces.
   - **Preferred workspace**: Set a default workspace for the group’s expenses and reports.
   - **Expensify Card preferred workspace**: If preferred workspace is enabled, post Expensify Card transactions to the preferred workspace.
6. Click **Save**.

---

## When to Use Different Group Permissions

### When to use Strictly Enforce Expense Workspace Rules
Use this to ensure workspace-level rules are followed before a report is submitted (for example, receipt requirements and other compliance rules).

### When to use Restrict Primary Contact Method Selection
Enable this to ensure employees use their company email instead of a personal email to access Expensify.

### When to use Restrict Expense Workspace Creation/Removal
Use this to prevent employees from creating additional workspaces outside the company’s approved setup.

### When to use Preferred Workspace
If you have multiple workspaces, use this to route a group’s expenses to the right workspace by default.

### When to use Expensify Card Preferred Workspace
If your team uses the Expensify Card, enable this so transactions post to the correct workspace automatically.

</div>
