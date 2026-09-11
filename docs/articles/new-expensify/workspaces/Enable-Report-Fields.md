---
title: Enable and create report fields in a workspace
description: Turn on Report fields for a workspace, create text, date, list, and formula fields, and understand which fields an accounting connection locks while it's connected.
keywords: [New Expensify, report fields, enable report fields, add field, list values, imported report fields, accounting connection, disconnect accounting, Control plan]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling Report fields, creating fields, deleting fields, how fields imported from an accounting connection behave while that connection is active, and how those leftover fields behave after the connection is disconnected or replaced. Does not cover choosing which accounting dimensions import as report fields, which is covered in each connection's configuration article.
---

# Enable and create report fields in a workspace

Report fields collect header-level information on a report, such as a project name, client code, or trip type. Each report gets one value per field, so report fields are useful when the information applies to the whole report instead of a single expense.

Report fields are available on the **Control** plan only. If your workspace is connected to an accounting integration, the fields that integration imports are managed in that system and can't be edited or deleted in Expensify while the connection is active, but you can still create and manage your own fields alongside them.

---

## Who can use report fields

- You must be a **Workspace Admin**.
- The workspace must be on the **Control** plan. If it isn't, you'll be prompted to upgrade before **Report fields** turns on. Learn more about [the differences between the Collect and Control plans](/articles/new-expensify/billing-and-subscriptions/explore-plans-subscriptions-and-pricing/Compare-Collect-and-Control-Plans).
- Members select values in report fields, but they can't create or change the fields.

---

## How to enable report fields for a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces**.
2. Click the workspace name.
3. Click **Reports**.
4. Enable **Report fields**.

<!-- SCREENSHOT:
Suggestion: The workspace Reports page with the Report fields toggle turned on and the Add field menu item visible below it.
Location: Immediately after the steps in this section.
Purpose: Report fields is enabled on the Reports page rather than on More features, so admins who look under More features can't find the toggle.
-->

---

## How to create a report field in a workspace

1. On the **Reports** page, click **Add field**.
2. Click **Name** and enter a name for the field.
3. Click **Type** and choose one:
   - **Text** – Adds a field for free text input.
   - **Date** – Adds a calendar for date selection.
   - **List** – Adds a list of options to choose from.
   - **Formula** – Adds a formula field.
4. To prefill the field on every report, enter an **Initial value**.
5. For a **List** field, click **List values**, click **Add value**, enter the value, then click **Save**. Repeat for each value you want members to choose from.
6. Click **Save**.

The new field appears in the list on the **Reports** page and on every report in the workspace.

---

## How to edit or delete a report field

1. On the **Reports** page, click the field you want to change.
2. Update the **Name**, **Type**, **Initial value**, or **List values**.
3. To remove the field, click **Delete**.

Fields imported from an active accounting connection have no **Delete** option. See how imported fields behave below.

---

## How report fields work with an accounting connection

When a workspace is connected to an accounting integration such as QuickBooks Online, QuickBooks Desktop, NetSuite, Xero, Sage Intacct, or Certinia, the dimensions you import as report fields appear on the **Reports** page under a note that reads "The report fields below are imported from your" and your integration name.

While that connection is active, imported fields and the fields you create behave differently:

- **Imported fields** can't be deleted, and you can't add, edit, enable, or disable their **List values** in Expensify. Change them in your accounting system, then sync the connection.
- **Fields you create in Expensify** can be edited and deleted as usual, even while the connection is active.
- You can enable **Report fields** and click **Add field** while a connection is active.
- Once at least one imported field exists, the **Report fields** toggle can't be turned off. Clicking it shows a message that report fields imported from your accounting connection can't be disabled.

To stop using an imported field, remove it from the import settings for your connection or disconnect the integration.

---

## What happens to imported report fields after you disconnect an accounting connection

The fields an integration imported stay on the workspace after you disconnect it, but they behave like fields you created manually. This also applies if you replace the integration with a different one.

- You can turn off **Report fields**.
- Each leftover field shows a **Delete** action.
- You can add, edit, enable, and disable **List values** on those fields.

---

# FAQ

## Why can't I turn off report fields?

At least one report field on the workspace was imported from the accounting connection you're currently connected to. Imported fields can't be disabled from Expensify while that connection is active. Change what the connection imports as report fields, or disconnect the integration, and then the toggle becomes available again.

## Why can't I delete a report field?

The field was imported from your active accounting connection, so it's managed in that system. Delete it there and sync the connection, delete the dimension from your connection's import settings, or disconnect the integration — after you disconnect, the leftover field can be deleted in Expensify.

## Can I add my own report fields while an accounting integration is connected?

Yes. Click **Add field** on the **Reports** page. Fields you create are separate from imported fields, and you can edit or delete them at any time.

## What happens when I turn off report fields?

Text and date fields are deleted, and lists are disabled. Expensify shows this warning before you confirm with **Disable**.

## Why can't I see report fields on the More features page?

**Report fields** isn't on the **More features** page. Enable it on the workspace **Reports** page instead.
