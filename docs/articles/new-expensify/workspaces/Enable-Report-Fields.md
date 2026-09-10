---
title: Enable and Manage Report Fields
description: Enable report fields on a workspace, create them, and manage fields imported from an accounting connection.
keywords: [New Expensify, report fields, custom report fields, Control plan, add field, delete report field, disable report fields, imported report fields, accounting connection]
internalScope: Audience is Workspace Admins. Covers enabling report fields on a workspace, creating them, editing and deleting them, and how fields imported from an accounting connection behave while that connection is active and after it is disconnected. Does not cover invoice fields, tags, categories, or configuring the accounting connections themselves.
---

# Enable and Manage Report Fields

Report fields collect extra information at the top of a report, such as a project name, client code, or trip type. Members choose a value when they create or submit a report, so you can code and search spend by that value later.

Report fields are only available on the **Control** plan.

---

## Who can use report fields

- Workspace Admins can enable, create, edit, and delete report fields.
- The workspace must be on the **Control** plan. If it isn't, you're prompted to upgrade when you enable the feature.
- Members select values in report fields, but they can't create or change the fields.

---

## How to enable report fields on a workspace

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Enable **Report fields**.

---

## How to create a report field

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Select **Add field**.
4. Enter a name under **Name**.
5. Select **Type** and choose one:
   - **Text** – Free-text entry.
   - **Date** – Calendar date selection.
   - **List** – A list of values you define.
6. To prefill the field, enter an **Initial value**.
7. Select **Save**.

To add the options for a **List** field, select the field, then select **List values** > **Add value**.

---

## How to edit or delete a report field

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Reports**.
3. Select the field you want to change.
4. Update the **Name**, **Type**, or **Initial value**, or select **Delete** to remove the field.

---

## How report fields imported from an accounting connection work

If your workspace is connected to an accounting integration that imports report fields — for example QuickBooks Online, QuickBooks Desktop, Xero, NetSuite, or Sage Intacct — those fields are managed in that accounting system, not in Expensify. While the connection is active:

- You can't turn off **Report fields**. Selecting the toggle shows: Report fields imported from your accounting connection cannot be disabled.
- Imported fields don't have a **Delete** action.
- You can't add, edit, enable, or disable the **List values** on an imported field.

Fields you created manually on the same workspace aren't affected. You can still edit and delete those while an accounting connection is active.

---

## What happens to imported report fields after you disconnect an accounting connection

The fields an integration imported stay on the workspace after you disconnect it, but they behave like fields you created manually. This also applies if you replace the integration with a different one.

- You can turn off **Report fields**.
- Each leftover field shows a **Delete** action.
- You can add, edit, enable, and disable **List values** on those fields.

---

# FAQ

## Why can't I delete a report field?

The field was imported from the accounting integration your workspace is connected to. Delete or stop importing it in that accounting system, or disconnect the integration from the workspace, and then you can delete the field in Expensify.

## Why can't I turn off report fields?

At least one report field on the workspace was imported from the accounting integration you're currently connected to. Disconnect the integration, then turn off **Report fields**.

## What happens to report values when I disable report fields?

Text and date fields are deleted, and lists are disabled.
