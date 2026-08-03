---
title: Manage Vendor Matching for QuickBooks Online
description: Learn how QuickBooks Online vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, and default vendor behavior.
keywords: [QuickBooks Online, vendor matching, vendor, company card expenses, default vendor, Credit Card Misc, Debit Card Misc, credit card export]
internalScope: Audience is Workspace Admins using the QuickBooks Online connection with Credit card or Debit card company card exports. Covers imported vendors, automatic and manual vendor assignment, default vendor behavior, and vendor export order. Does not cover QuickBooks Online connection setup or other export types.
---

# Manage Vendor Matching for QuickBooks Online

QuickBooks Online vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses before they export to QuickBooks Online. Expensify imports your QuickBooks Online vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in QuickBooks Online.

## Who can use QuickBooks Online vendor matching

This feature is available to Workspace Admins whose Workspace:

 - Is connected to QuickBooks Online.
 - Has **Credit card** or **Debit card** selected under **Export company card expenses as** in the QuickBooks Online configuration.

If your Workspace isn't connected to QuickBooks Online yet, learn how to [connect to QuickBooks Online](/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).

## How vendors are matched to company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported QuickBooks Online vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a Merchant Rule or by vendor matching.

Workspace Admins can manually select a vendor from the searchable **Vendor** field on an expense at any time. Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

## How to set a fallback (default) vendor for QuickBooks Online company card expenses

1. Click the navigation tabs (on the left on web, on the bottom on mobile), then go to **Workspaces > [workspace name] > Accounting > QuickBooks Online**.
2. Click **Export**.
3. Under **Export company card expenses as**, select **Credit card** or **Debit card**.
4. Select a **Default vendor**.

The default vendor is used only when an expense doesn't already have a vendor assigned. If no default vendor is configured, expenses export to **Credit Card Misc** or **Debit Card Misc**.

![QuickBooks Online Export settings showing the Export company card expenses as setting and the Default vendor dropdown]({{site.url}}/assets/images/qbo-default-vendor.png){:width="100%"}

## How vendors export to QuickBooks Online

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The **Default vendor** configured in workspace settings.
3. **Credit Card Misc** or **Debit Card Misc**., if neither of the above is available.

## How inactive QuickBooks Online vendors affect expenses

If a vendor assigned to an expense becomes inactive in QuickBooks Online, or if the QuickBooks Online connection is removed, the expense displays a violation, similar to category, tag, and tax violations.

Update the expense with an active vendor to clear the violation.

# FAQ

## Do I have to set a vendor?

No. The Vendor field is optional.

Expensify automatically attempts to match a vendor using your imported QuickBooks Online vendor list. If no match is found, the field can remain blank. When the expense exports, Expensify uses the configured Default vendor. If no default vendor is configured, the expense exports to Credit Card Misc or Debit Card Misc.

## Who can see the Vendor field on an expense?

Only Workspace Admins can view and edit the **Vendor** field. Members and submitters don't see it.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

