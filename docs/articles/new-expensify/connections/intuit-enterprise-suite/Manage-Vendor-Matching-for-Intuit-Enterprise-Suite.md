---
title: Manage Vendor Matching for Intuit Enterprise Suite
description: Learn how Intuit Enterprise Suite vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, and default vendor behavior.
keywords: [Intuit Enterprise Suite, IES, vendor matching, vendor, company card expenses, default company card vendor, credit cards, company card export]
internalScope: Audience is workspace admins using the Intuit Enterprise Suite connection for company card exports. Covers imported Intuit Enterprise Suite vendors, automatic and manual vendor assignment, default company card vendor behavior, and vendors that are no longer valid. Does not cover Intuit Enterprise Suite connection setup, other Intuit Enterprise Suite configuration settings, or vendor matching for other accounting connections.
---

# Manage Vendor Matching for Intuit Enterprise Suite

Intuit Enterprise Suite vendor matching lets workspace admins review and update the vendor assigned to non-reimbursable company card expenses before they export to Intuit Enterprise Suite. Expensify imports your Intuit Enterprise Suite vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in Intuit Enterprise Suite.

## Who can use Intuit Enterprise Suite vendor matching

This feature is available to workspace admins whose workspace:

 - Is connected to Intuit Enterprise Suite.
 - Has **Export company card expenses as** set **Credit card** in the Intuit Enterprise Suite configuration in Expensify.

If your workspace isn't connected to Intuit Enterprise Suite yet, learn how to [connect to Intuit Enterprise Suite](/articles/new-expensify/connections/intuit-enterprise-suite/Connect-to-Intuit-Enterprise-Suite).

## How vendors are matched to Intuit Enterprise Suite company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Intuit Enterprise Suite vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a workspace admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

The **Vendor** field appears only on non-reimbursable expenses. It isn't shown on reimbursable expenses or on invoices.

## How to select an Intuit Enterprise Suite vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

## Where to find your imported Intuit Enterprise Suite vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in Intuit Enterprise Suite, so the list is read-only in Expensify and refreshes when the connection syncs.

## How to set a default company card vendor for Intuit Enterprise Suite

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the Intuit Enterprise Suite connection, select **Export**.
4. Select **Default company card vendor**.
5. Select a vendor from your imported Intuit Enterprise Suite vendor list.

The default company card vendor is used only when an expense doesn't already have a vendor assigned.

## How vendors export to Intuit Enterprise Suite

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The **Default company card vendor** configured in the Intuit Enterprise Suite export settings.

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or deactivated in Intuit Enterprise Suite, the expense displays a **Vendor no longer valid** error, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported Intuit Enterprise Suite vendor list. If no match is found, the field can remain blank, and the expense exports using the **Default company card vendor** configured in your Intuit Enterprise Suite export settings.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a workspace admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Intuit Enterprise Suite vendor list is empty. Add the vendors in Intuit Enterprise Suite, then sync the connection again.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
