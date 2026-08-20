---
title: Manage Vendor Matching for Sage Intacct
description: Learn how Sage Intacct vendor matching assigns vendors to non-reimbursable company card expenses before they export, including automatic matching, manual selection, and default vendor behavior.
keywords: [Sage Intacct, vendor matching, vendor, company card expenses, default vendor, Credit Card Charges, credit card export]
internalScope: Audience is Workspace Admins using the Sage Intacct connection with Credit Card Charges company card exports. Covers imported vendors, automatic and manual vendor assignment, default vendor behavior, and vendor export order. Does not cover Sage Intacct connection setup or other export types.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Sage Intacct

Sage Intacct vendor matching lets Workspace Admins review and update the vendor assigned to non-reimbursable company card expenses before they export to Sage Intacct. Expensify imports your Sage Intacct vendor list, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in Sage Intacct.

## Who can use Sage Intacct vendor matching

This feature is available to Workspace Admins whose Workspace:

 - Is connected to Sage Intacct.
 - Has **Credit Card Charges** selected under **Export company card expenses as** in the Sage Intacct configuration.

If your Workspace isn't connected to Sage Intacct yet, learn how to [connect to Sage Intacct](/articles/new-expensify/connections/sage-intacct/Connect-to-Sage-Intacct).

## How vendors are matched to company card expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Sage Intacct vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a Workspace Admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

Workspace Admins can manually select a vendor from the searchable **Vendor** field on an expense at any time. Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

## How to set a fallback (default) vendor for Sage Intacct company card expenses

1. Click the navigation tabs (on the left on web, on the bottom on mobile), then go to **Workspaces > [workspace name] > Accounting > Sage Intacct**.
2. Click **Export**.
3. Under **Export company card expenses as**, select **Credit Card Charges**.
4. Select a **Default vendor**.

The default vendor is used only when an expense doesn't already have a vendor assigned. If no default vendor is configured, expenses export to the vendor Credit Card Misc.

![Sage Intacct Export settings with "Export company card expenses as" set to Credit Card Charges and the Default vendor dropdown visible]({{site.url}}/assets/images/2_Awesome_Co_Control_Intacct_-_Accounting.png){:width="100%"}

## How vendors export to Sage Intacct

When company card expenses are exported, Expensify assigns vendors in the following order:

1. The vendor selected on the expense.
2. The **Default vendor** configured in workspace settings.
3. Credit Card Misc, if neither of the above is available.


# FAQ

## Do I have to set a vendor?

No. The Vendor field is optional.

Expensify automatically attempts to match a vendor using your imported Sage Intacct vendor list. If no match is found, the field can remain blank. When the expense exports, Expensify uses the configured Default vendor. If no default vendor is configured, the expense exports to Credit Card Misc.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a Workspace Admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## How do I know why Expensify assigned a vendor automatically?

When Expensify automatically assigns a vendor, Concierge posts a system message on the expense indicating whether the vendor was assigned by a merchant rule or by vendor matching.
