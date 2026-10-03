---
title: Manage Vendor Matching for Campfire
description: Learn how Campfire vendor matching assigns vendors to non-reimbursable company card expenses, including automatic matching, manual selection, and which Campfire vendors are eligible.
keywords: [Campfire, vendor matching, vendor, company card expenses, credit cards, no vendors found, vendor no longer valid]
internalScope: Audience is Workspace Admins using the Campfire connection for company card expenses. Covers imported Campfire vendors, automatic and manual vendor assignment, which Campfire vendor records are eligible, and vendors that are no longer valid. Does not cover Campfire connection setup, other Campfire configuration settings, or vendor matching for other accounting connections.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Campfire

Campfire vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses. Expensify imports your Campfire vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field. This helps ensure expenses carry the correct vendor instead of requiring manual corrections in Campfire.

## Who can use Campfire vendor matching

This feature is available to Workspace Admins whose workspace:

 - Is connected to Campfire.
 - Has finished configuring the Campfire connection.

Campfire vendor matching is rolling out gradually. If the **Vendors** feature and the **Vendor** field don't appear on a configured Campfire workspace, they aren't enabled for your workspace yet.

## What Campfire vendors are eligible for matching

Expensify imports only the Campfire records that can be assigned to an expense. A Campfire record appears in your vendor list when it is both:

 - A vendor record, not a customer record.
 - Active in Campfire.

Deactivating a vendor in Campfire removes it from the list the next time the connection syncs, so it can no longer be matched or selected.

## How vendors are matched to Campfire company card expenses

Expensify assigns vendors automatically in the following order:

 - If a merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Campfire vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select a Campfire vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

<!-- SCREENSHOT:
Suggestion: The expense details view for a non-reimbursable company card expense on a Campfire-connected workspace, with the Vendor row visible and a matched Campfire vendor name shown.
Location: Immediately after the steps in "How to select a Campfire vendor on an expense".
Purpose: The Vendor row only renders on non-reimbursable expenses, so admins looking at a reimbursable expense can't tell whether the field is missing or whether they're on the wrong expense type.
-->

## Where to find your imported Campfire vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in Campfire, so the list is read-only in Expensify and refreshes when the connection syncs.

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or deactivated in Campfire, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional. Expensify automatically attempts to match a vendor using your imported Campfire vendor list, and the field can remain blank if no match is found.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Campfire vendor list is empty. Add the vendors in Campfire, then sync the connection again.

## Why is a Campfire vendor missing from the list?

The vendor is either inactive in Campfire or is a customer record rather than a vendor record. Only active Campfire vendor records are imported. Reactivate the vendor in Campfire, then sync the connection again.

## What vendor list is used when my workspace has more than one accounting connection?

Only one connection scopes the **Vendor** field at a time. Campfire vendors are used when Campfire is the only vendor-matching connection configured on the workspace. If QuickBooks Online, Sage Intacct, Xero, Rillet, DualEntry, or Dynamics 365 Business Central is also configured for vendor matching, that connection's vendor list is used instead.
