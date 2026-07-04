---
title: Managing Workspace Members in New Expensify
description: Learn how to add, remove, filter, and manage user roles in a New Expensify workspace.
keywords: [New Expensify, workspace members, add user, remove user, user roles, workspace admin, card admin, invite users, filter members, role filter]
---


Managing members in a workspace helps ensure that the right people can submit, approve, and review expenses. This guide walks through how to invite, remove, and update roles for members in New Expensify.

A **Workspace member** is anyone added to a workspace with one of the following roles:

- **Member** – Can submit and/or approve expenses.
- **Admin** – Can manage members, roles, workflows, and settings.
- **Auditor** – Can view and comment on reports and has read-only access to all workspace editor pages (such as Categories, Tags, Rules, Workflows, and Accounting). Auditors cannot change any workspace settings or take workflow actions such as approving, paying, or taking control.
- **Card Admin** – Can manage the Expensify Card and Company cards, including issuing cards, setting limits, and assigning company cards. Has read-only access to Overview and Members, and all other workspace settings pages are hidden.

---

# Invite Members to a Workspace

To invite someone to your workspace:

1. Go to **Workspaces > [Workspace Name] > Members**.
2. Click **Invite Member**.
3. Search for the user by name, email, or phone number.
4. (Optional) Click **Role** to change the default role (Member).
5. (Optional) Add a message to the invitation.
6. Click **Invite**.

**Tip:** You can also invite members under **Settings > Profile** by clicking **Share** to send the workspace’s URL or QR code.

---

# Filter Workspace Members by Role

You can filter the member list by role to quickly find specific groups of members.

1. Go to **Workspaces > [Workspace Name] > Members**.
2. Click the role filter dropdown at the top of the member list.
3. Select one of the available roles:
   - **All members** – Shows all workspace members (default).
   - **Approvers** – Shows only members who are designated approvers.
   - **Workspace Admins** – Shows only members with the Admin role (not available on Submit workspaces).
   - **Editors** – Shows only members with the Editor role (Submit workspaces only).
   - **Card Admins** – Shows only members with the Card Admin role (Control workspaces only).
   - **Auditors** – Shows only members with the Auditor role (Control workspaces only).

The member list updates immediately to show only members matching the selected role. You can also combine the role filter with the search bar to narrow results further.

The roles available in the filter depend on your workspace type, so the options change if you switch your workspace plan. If you’ve filtered by a role that is no longer available after a plan change, the filter automatically resets to **All members**.

If no members match the selected filter, an empty state is displayed with the message: "No members match this filter."

---

# Remove Workspace Members

If someone no longer needs access to your workspace, you can remove them individually or in bulk to keep your member list up to date.

## Remove a Single Member

1. Go to **Workspaces > [Workspace Name] > Members**.
2. Click the member’s name.
3. In the right-hand panel, click **Remove from Workspace**.
4. Confirm by clicking **Remove**.

## Remove Multiple Members

1. Go to **Workspaces > Members**.
2. Select the checkboxes next to the members you want to remove.
3. Click the **green dropdown arrow** in the top-right.
4. Choose **Remove Member(s)**.
5. Confirm by clicking **Remove**.

---

# Change a User’s Role

1. Go to **Workspaces > Members**.
2. Click the member’s name.
3. In the right-hand panel, click **Roles**.
4. Select the new role and confirm.

---

# Transfer Workspace Ownership

To transfer ownership to another Admin:

1. Go to **Workspaces > Members**.
2. Click the current **Owner** (identified with a tag).
3. Click **Transfer Owner** in the right-hand panel.
4. Click **Continue** to confirm.

After the transfer, the initiating user becomes the new **Owner**.

![Workspace list showing Owner tag]({{site.url}}/assets/images/transfer-ownership.png){:width="100%"}

![Workspace admin role showing transfer owner button]({{site.url}}/assets/images/transfer-ownership_02.png){:width="100%"}

---

# Invite Multiple Members via Spreadsheet

1. Go to **Workspaces > Members**.
2. Click the **three-dot menu** in the top-right.
3. Select **Import via Spreadsheet**.
4. Drag and drop your file or click **Upload File** to browse.
5. Map each column in your file to a member field, then complete the import.

When mapping columns, you can assign each one to any of the following member fields:

- **Email** (required)
- **Role**
- **Submit to**
- **Forward to**
- **Over limit forward to**
- **Approval limit**
- **Custom field 1**
- **Custom field 2**

Mapping the **Submit to**, **Forward to**, **Over limit forward to**, and **Approval limit** fields sets up each member's approval workflow, which you can review under **Workflows** after the import completes.

**Note:** Use this **[spreadsheet import template](https://docs.google.com/spreadsheets/d/19fjknN-KOS74RjXDccXZGUNTm-utdV7Gvveo5EyrJLE/edit?gid=0#gid=0)** to ensure proper formatting.

**Control plan required:** The **Submit to**, **Forward to**, **Over limit forward to**, **Approval limit**, **Custom field 1**, and **Custom field 2** fields — along with specialized roles like **Auditor** and **Card Admin** — are only available on the Control plan. If your workspace isn't on the Control plan, you'll be prompted to upgrade before the import can finish.

---

# FAQ

## Why can't I add someone to a workspace?

You must be a **Workspace Admin**, and the email or phone number of the individual you're inviting must be valid and correctly formatted.

## Can I invite multiple members to a workspace at the same time?

Yes. Use the search tool during invite or import members using a spreadsheet (see the **Invite Multiple Members via Spreadsheet** section above.

## Why am I prompted to upgrade when importing members from a spreadsheet?

Your file maps an advanced field (**Submit to**, **Forward to**, **Over limit forward to**, **Approval limit**, **Custom field 1**, or **Custom field 2**) or assigns a specialized role like **Auditor** or **Card Admin**. These are only available on the Control plan, so you'll need to upgrade your workspace to the Control plan before the import can finish.

