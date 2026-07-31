---
title: Import Workspace Members from a Spreadsheet
description: Learn how to import workspace members in bulk using a spreadsheet.
keywords: [import workspace members, spreadsheet import, bulk import members, upload members]
internalScope: Audience is Workspace admins. Covers importing workspace members from a spreadsheet. Does not cover inviting members individually, changing member roles, or configuring approval workflows.
---

# Import Workspace Members from a Spreadsheet

Import workspace members from a spreadsheet to add multiple people to your workspace at the same time. During the import, you can assign roles and, if supported by your workspace plan, configure approval workflows.

If you only need to add one person, learn how to Invite Workspace Members.

---

## Who can import workspace members?

Workspace admins can import workspace members.

The fields and roles available during import depend on your workspace plan. Learn more about Workspace Plan Restrictions.

---

## How to import workspace members from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace name]**.
2. Select **Members**.
3. Select the three dots **(⋮)**.
4. Select **Import via spreadsheet**.
5. Drag and drop your spreadsheet, or select **Upload file**.
6. Map each column in your spreadsheet to the corresponding member field.
7. Review the mapping.
8. Select **Import**.

<!-- SCREENSHOT:
Suggestion: Spreadsheet import dialog showing a mapped spreadsheet before import.
Location: After "How to import workspace members from a spreadsheet."
Purpose: Helps members understand what column mapping looks like before completing the import.
-->

---

## What information can you import?

You can map spreadsheet columns to supported member fields, including:

- Email (required)
- Role
- Submit to
- Forward to
- Over limit forward to
- Approval limit
- Custom field 1
- Custom field 2

Some fields are only available on certain workspace plans. Learn more about Workspace Plan Restrictions.

---

## What happens after you import workspace members?

Each imported member is added to the workspace using the information provided in your spreadsheet.

If your spreadsheet includes approval workflow fields, those settings are applied during the import.

Members who don't already have an Expensify account receive an email inviting them to create one and join the workspace.

---

## Related articles

- Invite Workspace Members
- Manage Workspace Member Roles
- Understand Workspace Plan Restrictions

# FAQ

## Where can I get the spreadsheet template?

Download and use the spreadsheet template to ensure your file is formatted correctly.

## Why can't I map certain fields?

Some member fields are only available on certain workspace plans.

Learn more about Workspace Plan Restrictions.

## Why did my import fail?

Check that your spreadsheet is formatted correctly and that all required fields, including **Email**, contain valid values.

## Can I assign roles during import?

Yes. Include a **Role** column in your spreadsheet to assign a role to each imported member.
