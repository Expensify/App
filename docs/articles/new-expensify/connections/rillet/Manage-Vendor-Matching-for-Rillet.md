---
title: Manage Vendor Matching for Rillet
description: Learn how Rillet vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, and default vendor behavior.
keywords: [Rillet, vendor matching, vendor, company card expenses, default company card vendor, credit cards, company card export]
internalScope: Audience is Workspace Admins using the Rillet connection for company card exports. Covers imported Rillet vendors, automatic and manual vendor assignment, default company card vendor behavior, and vendors that are no longer valid. Does not cover Rillet connection setup, other Rillet configuration settings, or vendor matching for other accounting connections.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Rillet

Rillet vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses before they export to Rillet. Expensify imports your Rillet vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in Rillet.

## Who can use Rillet vendor matching

This feature is available to Workspace Admins whose Workspace:

 - Is connected to Rillet.
 - Has finished configuring the Rillet connection.

Rillet vendor matching is rolling out gradually. If the **Vendors** feature and the **Vendor** field don't appear on a configured Rillet Workspace, they aren't enabled for your Workspace yet.

If your Workspace isn't connected to Rillet yet, learn how to [connect to Rillet](/articles/new-expensify/connections/rillet/Connect-to-Rillet).

## How vendors are matched to Rillet company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Rillet vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select a Rillet vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

<!-- SCREENSHOT:
Suggestion: The expense details view for a non-reimbursable company card expense on a Rillet-connected Workspace, with the Vendor row visible directly below Category and a matched vendor name shown.
Location: Immediately after the steps in "How to select a Rillet vendor on an expense".
Purpose: Admins report not knowing where the Vendor field lives on an expense, and it only renders on non-reimbursable expenses, so a written description alone leaves them unsure whether they're looking at the right expense type.
-->

## Where to find your imported Rillet vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in Rillet, so the list is read-only in Expensify and refreshes when the connection syncs.

## How to set a default company card vendor for Rillet

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Accounting**.
3. On the Rillet connection, select **Export**.
4. Select **Default company card vendor**.
5. Select a vendor from your imported Rillet vendor list.

The default company card vendor is used only when an expense doesn't already have a vendor assigned.

## How vendors export to Rillet

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The **Default company card vendor** configured in the Rillet export settings.

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or deactivated in Rillet, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported Rillet vendor list. If no match is found, the field can remain blank, and the expense exports using the **Default company card vendor** configured in your Rillet export settings.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Rillet vendor list is empty. Add the vendors in Rillet, then sync the connection again.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
