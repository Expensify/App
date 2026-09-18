---
title: Manage Vendor Matching for DualEntry
description: Learn how DualEntry vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, and default vendor behavior.
keywords: [DualEntry, vendor matching, vendor, company card expenses, default vendor for all company cards, company card export]
internalScope: Audience is Workspace Admins using the DualEntry connection for company card exports. Covers imported DualEntry vendors, automatic and manual vendor assignment, default company card vendor behavior, and vendors that are no longer valid. Does not cover DualEntry connection setup, other DualEntry configuration settings, or vendor matching for other accounting connections.
order: 3
---

# Manage Vendor Matching for DualEntry

DualEntry vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses before they export to DualEntry. Expensify imports your DualEntry vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in DualEntry.

---

## Who can use DualEntry vendor matching

This feature is available to Workspace Admins whose workspace:

- Is connected to DualEntry.
- Has finished configuring the DualEntry connection.

No other setting is required. Once the DualEntry connection is configured, **Vendors** appears under **More features** in the **Organize** section, and the **Vendor** field appears on non-reimbursable expenses.

If your workspace isn't connected to DualEntry yet, learn how to [connect to DualEntry](/articles/new-expensify/connections/dualentry/Connect-to-DualEntry).

---

## How vendors are matched to DualEntry company card expenses

Expensify assigns vendors automatically in the following order:

- If a workspace merchant rule specifies a vendor, that vendor is assigned.
- Otherwise, Expensify automatically matches the merchant name against your imported DualEntry vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
- If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

---

## How to select a DualEntry vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

<!-- SCREENSHOT:
Suggestion: The expense details view for a non-reimbursable company card expense on a DualEntry-connected workspace, with the Vendor row visible below Category and a matched vendor name shown.
Location: Immediately after the steps in "How to select a DualEntry vendor on an expense".
Purpose: The Vendor row only renders on non-reimbursable expenses, so admins who open a reimbursable expense can't tell whether the field is missing or whether they're looking at the wrong expense type.
-->

---

## Where to find your imported DualEntry vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in DualEntry, so the list is read-only in Expensify and refreshes when the connection syncs.

---

## How to set a default vendor for DualEntry company card expenses

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the DualEntry connection, select **Export**.
4. Select **Default vendor for all company cards**.
5. Select a vendor from your imported DualEntry vendor list.

**Default vendor for all company cards** is used only when an expense doesn't already have a vendor assigned.

---

## How vendors export to DualEntry

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The vendor set as **Default vendor for all company cards** in the DualEntry export settings.

---

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or deactivated in DualEntry, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported DualEntry vendor list. If no match is found, the field can remain blank, and the expense exports using the vendor set as **Default vendor for all company cards** in your DualEntry export settings.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your DualEntry vendor list is empty. Add the vendors in DualEntry, then sync the connection again.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
