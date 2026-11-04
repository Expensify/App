---
title: Enable Report Fields
description: Turn on report fields for a workspace, create text, date, list, and formula fields, and understand which fields an accounting connection locks while it's connected.
keywords: [New Expensify, report fields, enable report fields, add field, list values, imported report fields, accounting connection, disconnect accounting, Control plan]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling Report fields, creating fields, deleting fields, how fields imported from an accounting connection behave while that connection is active, and how those leftover fields behave after the connection is disconnected or replaced. Does not cover choosing which accounting dimensions import as report fields, which is covered in each connection's configuration article.
---

# Enable Report Fields

Report fields let workspace admins collect additional header-level information on reports, such as project names, client codes, or trip types. Report fields are only available on the Control plan.

Report fields apply to expense reports. They don't appear on invoices. To collect extra details on invoices, [learn how to enable Invoice fields](/articles/new-expensify/workspaces/Enable-Invoice-Fields).

---

## How to enable Report fields

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Reports**.
3. Toggle on **Report fields**.

---

## How to create a Report field

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Reports**.
3. Select **Add field**.
4. Select **Name** and enter a name for the report field.
5. Select **Type** and choose one:
   - **Text** – Add a field for free text input.
   - **Date** – Add a calendar for date selection.
   - **List** – Add a list of options to choose from.
     - To create list options, click **List values**, then click **Add value** for each option.
   - **Formula** – Add a formula field.
6. After naming and choosing the field type, select **Save**.

---

## How to update or delete a Report field

A field's **Name** and **Type** are set when you create the report field and can't be changed afterward. To use a different name or type, delete the field and create a new one.

To delete a report field:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Reports**.
3. Under **Report fields**, choose the field you want to delete.
4. Select **Delete**.

Fields imported from an active accounting connection have no **Delete** option. See how imported fields behave below.

---

## How report fields work with an accounting connection

When a workspace is connected to an accounting integration, imported report fields appear on the **Reports** page under a note that reads "The report fields below are imported from your" and your integration name.

While that connection is active, imported fields and the fields you create behave differently:

- **Imported fields** can't be deleted, and you can't add or delete their **List values** in Expensify. Add or remove values in your accounting system, then sync the connection.
- You can still turn an imported field's individual **List values** on or off in Expensify to control which ones members can pick.
- **Fields you create in Expensify** stay under your control. You can change their **Initial value** and **List values** and delete them, even while the connection is active.
- You can enable **Report fields** and click **Add field** while a connection is active.
- Once at least one imported field exists, the **Report fields** toggle can't be turned off. Clicking it shows a message that report fields imported from your accounting connection can't be disabled.

---

## What happens to imported report fields after you disconnect an accounting connection

The fields an integration imported stay on the workspace after you disconnect it, but they behave like fields you created manually. This also applies if you replace the integration with a different one.

- You can turn off **Report fields**.
- Each leftover field shows a **Delete** action.
- You can add, delete, enable, and disable **List values** on those fields.

---

# FAQ

## Why can't I turn off report fields?

At least one report field on the workspace was imported from the accounting connection you're currently connected to. Imported fields can't be disabled from Expensify while that connection is active. Change what the connection imports as report fields, or disconnect the integration, and then the toggle becomes available again.

## Why can't I delete a report field?

The field was imported from your active accounting connection, so it's managed in that system. Delete it there and sync the connection, delete the dimension from your connection's import settings, or disconnect the integration — after you disconnect, the leftover field can be deleted in Expensify.

## Why can't I change a report field's name or type?

The **Name** and **Type** are set when the field is created and are read-only afterward, for imported fields and for fields you create. To use a different name or type, delete the field and create a new one.

## What happens when I turn off report fields?

Text and date fields are deleted, and lists are disabled. Expensify shows this warning before you confirm with **Disable**.
