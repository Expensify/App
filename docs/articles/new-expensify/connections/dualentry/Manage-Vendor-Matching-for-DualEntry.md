---
title: Manage Vendor Matching for DualEntry
description: Learn how DualEntry vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, subsidiary scoping, and default vendor behavior.
keywords: [DualEntry, vendor matching, vendor, company card expenses, default vendor for all company cards, Credit Card Misc, company card export]
internalScope: Audience is Workspace Admins using the DualEntry connection for company card exports. Covers imported DualEntry vendors, subsidiary scoping, automatic and manual vendor assignment, default vendor behavior, the Credit Card Misc export fallback, and vendors that are no longer valid. Does not cover DualEntry connection setup, other DualEntry configuration settings, or vendor matching for other accounting connections.
noindex: true
sitemap: false
order: 3
---

# Manage Vendor Matching for DualEntry

DualEntry vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses before they export to DualEntry. Expensify imports your DualEntry vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in DualEntry.

## Who can use DualEntry vendor matching

This feature is available to Workspace Admins whose Workspace:

 - Is connected to DualEntry.
 - Has finished configuring the DualEntry connection.

DualEntry vendor matching is rolling out gradually. If the **Vendors** feature and the **Vendor** field don't appear on a configured DualEntry Workspace, they aren't enabled for your Workspace yet.

If your Workspace isn't connected to DualEntry yet, learn how to [connect to DualEntry](/articles/new-expensify/connections/dualentry/Connect-to-DualEntry).

## Which DualEntry vendors are available in Expensify

Expensify only imports the vendors a Workspace can actually export to. A DualEntry vendor appears in Expensify when it is:

 - Active in DualEntry.
 - Either assigned to the **Subsidiary** selected for the connection, or not assigned to any subsidiary.

Vendors assigned to a different subsidiary are not available, so changing the **Subsidiary** on the connection changes which vendors you can select.

The same list is used everywhere vendors appear in Expensify: automatic matching, the **Vendor** field on an expense, workspace merchant rules, and the **Default vendor for all company cards** setting.

## How vendors are matched to DualEntry company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported DualEntry vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select a DualEntry vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

<!-- SCREENSHOT:
Suggestion: The expense details view for a non-reimbursable company card expense on a DualEntry-connected Workspace, with the Vendor row visible directly below Category and a matched vendor name shown.
Location: Immediately after the steps in "How to select a DualEntry vendor on an expense".
Purpose: Admins report not knowing where the Vendor field lives on an expense, and it only renders on non-reimbursable expenses, so a written description alone leaves them unsure whether they're looking at the right expense type.
-->

## Where to find your imported DualEntry vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in DualEntry, so the list is read-only in Expensify and refreshes when the connection syncs.

## How to set a default vendor for all company cards in DualEntry

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Accounting**.
3. On the DualEntry connection, select **Export**.
4. Select **Default vendor for all company cards**.
5. Select a vendor from your imported DualEntry vendor list.

The default vendor is used only when an expense doesn't already have a vendor assigned.

## How vendors export to DualEntry

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The **Default vendor for all company cards** configured in the DualEntry export settings.
3. A vendor named **Credit Card Misc**, if neither of the above is available.

If no **Credit Card Misc** vendor exists in DualEntry, Expensify creates one on the first export that needs it and reuses it afterward. Expensify does not set it as your **Default vendor for all company cards**, so that setting stays empty until you choose a vendor yourself.

## What happens when a DualEntry vendor is no longer valid

If a vendor assigned to an expense is deactivated in DualEntry, or is no longer available to the selected **Subsidiary**, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error. You can also select **None** to leave the **Vendor** field empty.

A merchant rule that points at a vendor which is no longer available displays **Vendor unavailable** instead of a vendor name. Edit the rule and choose an available vendor to resolve it.

## How DualEntry vendor matching works alongside another accounting connection

Only one accounting connection scopes the **Vendor** field at a time. When more than one vendor matching connection is configured on the same Workspace, Expensify uses the first one in this order: QuickBooks Online, Sage Intacct, Xero, Rillet, DualEntry.

DualEntry vendors are used for the **Vendor** field only when none of the other connections above are configured for vendor matching. The **Default vendor for all company cards** setting in the DualEntry export settings always uses DualEntry vendors, regardless of which connection scopes the **Vendor** field.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported DualEntry vendor list. If no match is found, the field can remain blank, and the expense exports using the **Default vendor for all company cards** configured in your DualEntry export settings, or **Credit Card Misc** if no default is set.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when no DualEntry vendors are available to your Workspace. This happens when your DualEntry vendor list is empty, when every vendor is inactive, or when every vendor belongs to a different subsidiary than the one selected for the connection. Add or activate the vendors in DualEntry, then sync the connection again.

## Why did a vendor disappear after I changed the subsidiary?

Vendors are scoped to the **Subsidiary** selected for the DualEntry connection. After you change the subsidiary, vendors that belong only to the previous subsidiary are no longer available, and expenses or merchant rules using them need an available vendor selected instead.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
