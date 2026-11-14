---
title: Manage Vendor Matching for Zoho Books
description: Learn how to select vendors on non-reimbursable expenses and configure the default company card vendor for Zoho Books exports.
keywords: [Zoho Books, vendor matching, expense vendor, non-reimbursable expenses, default vendor for all company cards, employee vendor]
internalScope: Audience is workspace admins reviewing vendors for a configured Zoho Books connection. Covers expense-level vendor selection, company card vendor fallback, and the distinction from employee-vendor matching. Does not cover authorization, other export settings, or report export steps.
order: 4
---

# Manage Vendor Matching for Zoho Books

Review the **Vendor** assigned to a non-reimbursable expense before exporting it to Zoho Books. You can select an imported vendor or configure an optional default for company card expenses that have no vendor assigned.

## Who can manage Zoho Books vendors

Workspace admins can configure the default vendor for a connected Zoho Books organization. Editing an expense's vendor also requires permission to edit that expense.

The **Vendor** field is available on non-reimbursable expenses with a configured Zoho Books connection. It isn't shown on reimbursable expenses or invoices.

If your organization isn't connected yet, learn how to [connect to Zoho Books](/articles/new-expensify/connections/zoho-books/Connect-to-Zoho-Books).

## How to select a Zoho Books vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign, or select **None** to clear the current selection.
5. Select **Save**.

Vendors come from your connected Zoho Books organization. If a vendor is missing, add or update it in Zoho Books, then sync the connection again.

## How to set a default company card vendor for Zoho Books

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to Zoho Books.
3. Select **Export**.
4. Select **Default vendor for all company cards**.
5. Select a vendor from your imported Zoho Books vendor list.

The default is optional. It doesn't replace a vendor already selected or matched on an expense.

## How vendors are used when exporting to Zoho Books

For company card expenses, Expensify uses:

1. The vendor selected or matched on the expense.
2. The **Default vendor for all company cards**, if the expense has no vendor.
3. No vendor, if neither is set. Zoho Books allows these expenses to export without a vendor.

Any selected vendor must still be active in Zoho Books.

Reimbursable expenses use a different process: during report export, Expensify finds the employee's Zoho Books vendor by matching their email address. Selecting a company card vendor doesn't change that employee-vendor match. The employee vendor must use the same currency as the exported bill.

Learn how to [export reports to Zoho Books](/articles/new-expensify/connections/zoho-books/Export-Reports-to-Zoho-Books).
