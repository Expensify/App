---
title: Create and Manage Report Fields
description: Enable report fields on a workspace, then create, edit, and delete them to collect extra information on reports.
keywords: [New Expensify, report fields, custom report fields, report header fields, list values, initial value, formula field, Control plan]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling report fields on a workspace and creating, editing, and deleting them, including list values and initial values. Does not cover categories, tags, or creating report fields inside a connected accounting system.
---

# Create and Manage Report Fields

Report fields let Workspace Admins collect additional information on reports, such as project names, client codes, or trip types. They apply to all spend, so they're useful whenever you want to prompt members for extra information.

This feature is available on the **Control** plan only.

**Note:** If your workspace is connected to an accounting system such as QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite, report fields must be created in that system directly.

---

## Who can create report fields

- **Role:** Workspace Admin.
- **Plan:** Control. If your workspace is on another plan, you're prompted to upgrade before you can enable the feature.
- **Prerequisite:** The **Report fields** toggle must be enabled on the workspace.

---

## How to enable report fields on a workspace

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Enable **Report fields**.

<!-- SCREENSHOT:
Suggestion: The workspace **Reports** tab with the **Report fields** section and its toggle visible alongside the list of workspace settings tabs.
Location: Immediately after the steps in "How to enable report fields on a workspace".
Purpose: Admins commonly look for this toggle under **More features**, where it does not appear. Showing the **Reports** tab prevents them from concluding the feature is missing from their workspace.
-->

---

## How to create a report field

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Select **Add field**.
4. Select **Name** and enter a name for the field.
5. Select **Type** and choose the type of field you want.
6. If you chose **List**, select **List values**, then select **Add value**, enter a **Value**, and select **Save**. Repeat for each option you want to offer.
7. Select **Initial value** and choose the value the field starts with.
8. Select **Save**.

**Note:** List fields require an initial value. If you skip step 7, saving returns the error `Please choose a report field initial value.`

---

## What each report field type does

Choose the type that matches the information you're collecting:

- **Text** — Add a field for free text input.
- **Date** — Add a calendar for date selection.
- **List** — Add a list of options to choose from.
- **Formula** — Add a formula field.

---

## How to edit or delete a report field

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Select the report field you want to change.
4. Update **List values** or **Initial value** as needed.
5. To remove the field, select **Delete**, then select **Delete** again to confirm.

**Note:** **Name** and **Type** can't be changed after a report field is saved. To change either one, delete the field and create a new one.

---

# FAQ

## Can I change a report field's name or type after saving it?

No. **Name** and **Type** are fixed once the field is saved. Delete the field and create a replacement instead.

## Why can't I see report fields on my workspace?

Check each of the following:

- You're a Workspace Admin on the workspace.
- The workspace is on the **Control** plan.
- The **Report fields** toggle is enabled on the **Reports** tab.
- The workspace isn't connected to an accounting system that manages report fields instead.

## Do members see every value in a list field?

No. Only enabled values can be selected by members. Each value on the **List values** page has its own toggle, so you can retire an option without deleting it.

## Do I have to set an initial value?

Yes for **List** fields — saving fails without one. **Date** fields are prefilled with **Current date**, which you can change.
