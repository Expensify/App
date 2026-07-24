---
title: Enable Invoice Fields
description: Enable, create, and manage Invoice fields to add extra invoice-level details to invoices in New Expensify.
keywords: [New Expensify, invoice fields, custom invoice fields, invoice details, Control plan, workspace admin]
internalScope: Audience is Workspace Admins on the Control plan. Covers enabling, creating, and managing Invoice fields on a workspace. Does not cover enabling invoicing, sending invoices, or report fields.
---

Invoice fields let you include extra invoice-level details on invoices, such as project names, client codes, or purchase order numbers. This feature is only available on the **Control plan**.

**Note:** If your workspace is connected to an accounting system, Invoice fields are imported from that system and must be managed there.

---

## Who can use Invoice fields

- You must be a **Workspace Admin**.
- Your workspace must be on the **Control plan**. If you're not on a Control plan, you'll be prompted to upgrade before enabling this feature.
- The **Invoice** feature must be enabled on the workspace.

---

## How to enable Invoice fields on a workspace

Invoice fields appear once invoicing is enabled on the workspace.

1. From the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace Name] > More features**.
2. Under the **Earn** section, turn on the **Invoice** toggle.
3. Click **Invoices** in the workspace menu.
4. Scroll to the **Invoice fields** section.

<!-- SCREENSHOT:
Suggestion: The Invoices page with the Invoice fields section highlighted.
Location: After step 4 in the enable workflow.
Purpose: Helps admins locate the Invoice fields section on the Invoices page.
-->

---

## How to create an Invoice field

1. From the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace Name] > Invoices**.
2. In the **Invoice fields** section, click **Add field**.
3. Enter a name for your field under **Name**.
4. Choose a field type:
   - **Text** – Free-text entry.
   - **Date** – Calendar date selection.
   - **List** – Predefined list of values. To add options, select **List values**, then click **Add value**.
5. (Optional) Set an **Initial value** to show in the field by default.
6. Click **Save**.

---

## How to edit or delete an Invoice field

1. From the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace Name] > Invoices**.
2. In the **Invoice fields** section, click the field you want to update.
3. Make your edits, or click **Delete invoice field** to remove the field entirely.

---

## What happens after you add an Invoice field

Each Invoice field you create appears on invoices created from the workspace, allowing you to capture the extra details you defined. Workspace members can select or enter values for the field when an invoice is created.

---

# FAQ

## Why can't I see Invoice fields?

You may not see Invoice fields if:

- You're not a Workspace Admin.
- Your workspace is not on the Control plan.
- The **Invoice** feature is not enabled on the workspace.

## Does Invoice fields work with accounting integrations?

If your workspace is connected to an accounting system, Invoice fields are imported from that system and must be managed there rather than in Expensify.
