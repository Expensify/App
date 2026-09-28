---
title: Enable Invoice Fields
description: Learn how Workspace Admins enable Invoice fields on a Control workspace to collect extra invoice-level details on invoices in New Expensify.
keywords: [New Expensify, invoice fields, invoice field, custom invoice fields, invoice level details, PO number on invoice, Control plan, workspace admin]
internalScope: Audience is Workspace Admins. Covers enabling Invoice fields on a workspace and adding, editing, and deleting invoice fields. Does not cover report fields on expense reports, sending or paying invoices, or connecting a business bank account.
---

# Enable Invoice Fields

Invoice fields let Workspace Admins collect extra invoice-level details on invoices, such as a PO number, a client code, or a project name. Each field you create appears on the invoices sent from that workspace, where you can set its value.

Invoice fields apply to invoices only and are available on the **Control plan**. To collect header-level information on expense reports instead, [learn how to enable Report fields](/articles/new-expensify/workspaces/Enable-Report-Fields).

---

## Who can use Invoice fields

- Only **Workspace Admins** can enable Invoice fields and add, edit, or delete them.
- The workspace must be on the **Control plan**. If it isn't, you're prompted to upgrade when you turn on the **Invoice fields** toggle.
- The workspace must have **Invoices** turned on. To turn on invoicing first, [learn how to set up invoicing](/articles/new-expensify/reports-and-expenses/Send-an-Invoice).

---

## How to enable Invoice fields on a workspace

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More features**.
4. Under the **Earn** section, turn on the **Invoices** toggle.
5. In the workspace menu, click **Invoices**.
6. Under **Invoice fields**, turn on the toggle.
7. If you're prompted to upgrade, click **Upgrade**, then click **Got it, thanks**.

<!-- SCREENSHOT:
Suggestion: The workspace Invoices page scrolled to the Invoice fields section, showing the toggle and the Add field button.
Location: Immediately after the steps in "How to enable Invoice fields on a workspace".
Purpose: The Invoice fields section sits below Invoice balance, Bank accounts, and Invoicing details, so admins who expect it on the More features page can't tell where the toggle lives.
-->

---

## How to add an invoice field

1. Go to **Workspaces > [Workspace Name] > Invoices**.
2. Under **Invoice fields**, click **Add field**.
3. Click **Name** and enter a name for the field.
4. Click **Type** and choose one:
   - **Text** — Add a field for free text input.
   - **Date** — Add a calendar for date selection.
   - **List** — Add a list of options to choose from.
   - **Formula** — Add a formula field.
5. Set the value for the field:
   - For **Text**, **Date**, and **Formula**, click **Initial value** and enter the value to show in the field.
   - For **List**, click **List values**, then click **Add value** for each option you want members to be able to choose.
6. Click **Save**.

---

## How to edit or delete an invoice field

1. Go to **Workspaces > [Workspace Name] > Invoices**.
2. Under **Invoice fields**, click the field you want to change.
3. Update the **Name**, **Type**, **Initial value**, or **List values**, or click **Delete** to remove the field.

---

## What happens after you enable Invoice fields

- Invoice fields appear on the invoices sent from the workspace, where you can set each field's value.
- Invoice fields and report fields are kept separate. Report fields don't appear on invoices, and invoice fields don't appear on expense reports.
- Turning off the **Invoice fields** toggle disables invoice fields on invoices.

---

# FAQ

## Why can't I see Invoice fields on my workspace?

Check each of the following:

- You're a **Workspace Admin** on the workspace. Members can't see or change workspace settings.
- The **Invoices** toggle is turned on under the **Earn** section of the **More features** page. The **Invoices** menu item only appears after you turn it on.
- The workspace is on the **Control plan**. Invoice fields are only available on Control, so you're prompted to upgrade when you turn on the toggle.

## Do invoice fields carry over when I duplicate a workspace or copy workspace settings?

Yes. Selecting **Invoices** carries the workspace's invoice fields over as well. Because invoice fields require Control, you're prompted to upgrade any destination workspace that isn't on the Control plan. Learn how to [duplicate a workspace](/articles/new-expensify/workspaces/Duplicate-Workspace) or [copy workspace settings](/articles/new-expensify/workspaces/Copy-Workspace-Settings).

## Does deleting a report field also delete my invoice fields?

No. Report fields and invoice fields are managed separately, so deleting a report field on the **Reports** page leaves your invoice fields unchanged.
