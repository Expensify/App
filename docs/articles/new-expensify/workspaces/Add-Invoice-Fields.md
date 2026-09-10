---
title: Add invoice fields to a workspace
description: Learn how Workspace Admins enable invoice fields, add them to a workspace, and keep invoice field names from conflicting with report field names in New Expensify.
keywords: [New Expensify, invoice fields, add invoice field, invoice field name already exists, workspace admin, Control plan, invoices]
internalScope: Audience is Workspace Admins in New Expensify. Covers enabling invoice fields, adding, editing, and deleting them, the shared name rule between invoice fields and report fields, and how invoice fields are included when workspace settings are copied. Does not cover sending or paying invoices, entering invoicing details, or connecting a business bank account.
---

# Add invoice fields to a workspace

Invoice fields let Workspace Admins collect extra information on invoices, such as a client code, a purchase order number, or a project name. They work the same way report fields do, but they appear on invoices instead of expense reports.

Invoice fields are only available on the **Control** plan.

---

## Who can add invoice fields in Expensify

Only Workspace Admins can add invoice fields, and the workspace must be on the **Control** plan. If your workspace is on a different plan, you'll be prompted to upgrade before you can turn invoice fields on.

Invoicing must also be enabled on the workspace before invoice fields are available. Learn how to [enable invoicing and send an invoice](/articles/new-expensify/reports-and-expenses/Send-an-Invoice).

---

## How to enable invoice fields in a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select your workspace, then select **More features**.
3. Under **Earn**, turn on **Invoices**.
4. In the workspace menu, select **Invoices**.
5. Turn on **Invoice fields**.

<!-- SCREENSHOT:
Suggestion: The workspace Invoices settings page with the Invoice fields toggle turned on and the Add field button visible.
Location: After step 5.
Purpose: Invoice fields live on the Invoices page rather than under Reports, so admins looking for a separate "Invoice fields" menu item can't find where to turn the feature on.
-->

---

## How to add an invoice field to a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select your workspace, then select **Invoices**.
3. Select **Add field**.
4. Enter a **Name** for the field.
5. Choose a **Type**:
   - **Text** — free text input.
   - **Date** — a calendar for date selection.
   - **List** — a list of options to choose from.
6. Select **Save**.

For a **List** field, select **List values** to add the options members can choose from.

---

## How to name an invoice field so it doesn't conflict with a report field

Field names must be unique across the whole workspace, and invoice fields and report fields share the same set of names. You can't have an invoice field and a report field with the same name on one workspace.

If you enter a name that's already in use, Expensify blocks the save and shows an error:

- On an invoice field: **An invoice field with this name already exists**
- On a report field: **A report field with this name already exists**

The check ignores capitalization, so `Client code` and `client code` count as the same name. To resolve the error, enter a different name or rename the existing field.

Learn how to [enable report fields](/articles/new-expensify/workspaces/Enable-Report-Fields).

---

## How to edit or delete an invoice field

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select your workspace, then select **Invoices**.
3. Select the invoice field you want to change.
4. Update the settings, or select **Delete** to remove the field.

---

## How to copy invoice fields to another workspace

Invoice fields are included when you copy settings from one workspace to another. On the **Select settings** page, the **Invoices** row shows how many invoice fields will be copied, for example `1 invoice fields`. Select **Invoices** to copy the invoice fields along with the rest of the invoice settings.

Learn how to [copy workspace settings](/articles/new-expensify/workspaces/Copy-Workspace-Settings).

---

# FAQ

## Why don't I see Invoice fields on my workspace?

Invoice fields appear on the workspace **Invoices** page, and only after **Invoices** is turned on under **More features**. The feature also requires the **Control** plan, so you'll be prompted to upgrade if your workspace is on a different plan.

## Why does Expensify say an invoice field name already exists when I don't see that field?

Invoice fields and report fields share one list of names. The name is most likely used by a report field on the same workspace. Check your workspace's report fields, then pick a different name or rename the existing field.

## Where do invoice fields appear?

On invoices only. Invoice fields don't appear on expense reports. To collect header-level information on expense reports, use report fields instead.

## What happens to invoice fields when you turn off Invoice fields?

Expensify asks you to confirm first, because turning the feature off deletes text and date invoice fields and disables list invoice fields.
