---
title: Manage Vendor Matching for Dynamics 365 Business Central
description: Learn how Dynamics 365 Business Central vendor matching assigns vendors to non-reimbursable company card expenses, including automatic matching, manual selection, and blocked vendor behavior.
keywords: [Dynamics 365 Business Central, Business Central, D365, vendor matching, vendor, blocked vendor, company card expenses]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers imported Business Central vendors, automatic and manual vendor assignment, blocked vendor filtering, and vendors that are no longer valid. Does not cover Business Central connection setup, Business Central export configuration, or vendor matching for other accounting connections.
order: 3
noindex: true
sitemap: false
---

# Manage Vendor Matching for Dynamics 365 Business Central

Dynamics 365 Business Central vendor matching lets workspace admins review and update the vendor assigned to non-reimbursable company card expenses before they export to Business Central. Expensify imports your Business Central vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in Business Central.

## How vendors are matched to Business Central company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Business Central vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a workspace admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select a Business Central vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

## Which Business Central vendors appear in your vendor list

Expensify imports the vendors from the Business Central company selected on the connection, and applies the **Blocked** setting from Business Central:

 - Vendors with **Blocked** set to **All** are excluded, because Business Central rejects every transaction for them.
 - Vendors with **Blocked** set to **Payment** are still included, because Business Central still posts purchase invoices for them.

If an expense was coded to a vendor before it was blocked as **All** in Business Central, the expense still displays that vendor's name, but the vendor can no longer be selected.

## Where to find your imported Business Central vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
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

Yes. Once a workspace admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Business Central vendor list is empty. Add the vendors in Business Central, then sync the connection again.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
