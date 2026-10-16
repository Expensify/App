---
title: Manage Vendor Matching for Dynamics 365 Business Central
description: Learn how Dynamics 365 Business Central vendor matching assigns vendors to non-reimbursable company card expenses, including automatic matching, manual selection, and blocked vendor behavior.
keywords: [Dynamics 365 Business Central, Business Central, D365, vendor matching, vendor, blocked vendor, company card expenses]
internalScope: Audience is Workspace Admins using the Dynamics 365 Business Central connection. Covers imported Business Central vendors, automatic and manual vendor assignment, blocked vendor filtering, and vendors that are no longer valid. Does not cover Business Central connection setup, Business Central export configuration, or vendor matching for other accounting connections.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Dynamics 365 Business Central

Dynamics 365 Business Central vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses. Expensify imports your Business Central vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field. This helps ensure expenses carry the correct vendor instead of requiring manual corrections in Business Central.

## Who can use Dynamics 365 Business Central vendor matching

This feature is available to Workspace Admins whose Workspace:

 - Is connected to Dynamics 365 Business Central.
 - Has finished configuring the Dynamics 365 Business Central connection, including selecting a company.

Dynamics 365 Business Central vendor matching is rolling out gradually. If the **Vendors** feature and the **Vendor** field don't appear on a configured Business Central Workspace, they aren't enabled for your Workspace yet.

## How vendors are matched to Dynamics 365 Business Central company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Business Central vendor list. For example, **CONTOSO SUPPLIES #12** matches **Contoso Supplies Ltd.**
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select a Dynamics 365 Business Central vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

<!-- SCREENSHOT:
Suggestion: The expense details view for a non-reimbursable company card expense on a Business Central-connected Workspace, with the Vendor row visible directly below Category and a matched vendor name shown.
Location: Immediately after the steps in "How to select a Dynamics 365 Business Central vendor on an expense".
Purpose: Admins report not knowing where the Vendor field lives on an expense, and it only renders on non-reimbursable expenses, so a written description alone leaves them unsure whether they're looking at the right expense type.
-->

## Which Dynamics 365 Business Central vendors appear in your vendor list

Expensify imports the vendors from the Business Central company selected on the connection, and applies the **Blocked** setting from Business Central:

 - Vendors with **Blocked** set to **All** are excluded, because Business Central rejects every transaction for them.
 - Vendors with **Blocked** set to **Payment** are still included, because Business Central still posts purchase invoices for them.

If an expense was coded to a vendor before it was blocked as **All** in Business Central, the expense still displays that vendor's name, but the vendor can no longer be selected.

## Where to find your imported Dynamics 365 Business Central vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in Business Central, so the list is read-only in Expensify and refreshes when the connection syncs.

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or fully blocked in Business Central, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported Business Central vendor list. If no match is found, the field can remain blank.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Business Central vendor list is empty. Add the vendors in Business Central, then sync the connection again.

## Which vendor list is used when my Workspace has more than one accounting connection?

Only one connection supplies the vendor list at a time. Expensify uses the first configured connection in this order: QuickBooks Online, Sage Intacct, Xero, Rillet, DualEntry, then Dynamics 365 Business Central. If any of those connections is configured on the same Workspace, its vendors are used instead of your Business Central vendors.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
