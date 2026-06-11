---
title: Enable Invoice Fields
description: Learn how to enable invoice fields in New Expensify to add custom invoice-level details to your invoices.
keywords: [New Expensify, invoice fields, custom invoice fields, invoices, Control plan, workspace admin]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling, creating, editing, and deleting invoice fields in New Expensify. Does not cover enabling invoicing, sending invoices, or report fields.
---

Invoice fields let Workspace Admins collect extra invoice-level details on invoices, such as project names, client codes, or purchase order numbers. This feature is only available on the **Control** plan, and the **Invoice** feature must be enabled first.

**Note:** If your workspace is connected to an accounting integration, invoice fields are imported from that system and can't be edited in Expensify.

---

## Who can use invoice fields

- **Role:** Workspace Admin
- **Plan:** Control plan only
- **Prerequisite:** The **Invoice** feature must be enabled on the workspace

If invoicing is not yet enabled, [learn how to set up invoicing](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Send-an-Invoice).

---

## How to enable invoice fields

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Invoices**.
4. Turn on **Invoice fields**.

If you're not on a Control plan, you'll be prompted to upgrade before enabling this feature.

<!-- SCREENSHOT:
Suggestion: The workspace Invoices page with the Invoice fields toggle visible.
Location: After the enable steps.
Purpose: Shows admins where the Invoice fields toggle appears.
-->

---

## How to create an invoice field

After enabling invoice fields, follow these steps to add one:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Invoices**.
4. Under **Invoice fields**, click **Add field**.
5. Enter a name under **Name**.
6. Choose a **Type**:
   - **Text** – Add a field for free text input.
   - **Date** – Add a calendar for date selection.
   - **List** – Add a list of options to choose from. Add options under **List values**.
7. (Optional) Set an initial value to show in the invoice field.
8. Click **Save**.

---

## How to edit or delete an invoice field

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Invoices**.
4. Under **Invoice fields**, click the field you want to change.
5. Make your edits, or click **Delete invoice field** to remove it.

---

# FAQ

## Why can't I see invoice fields?

Invoice fields appear only when both of the following are true:
- You're a Workspace Admin.
- Your workspace is on the Control plan with the **Invoice** feature enabled.

## Can I use invoice fields if my workspace is connected to an accounting integration?

When a workspace is connected to an accounting integration, invoice fields are imported from that system and can't be added or edited in Expensify.

## What happens if I disable invoice fields?

Invoice fields will be disabled on invoices. Turning the toggle off prompts you to confirm before the change is applied.
