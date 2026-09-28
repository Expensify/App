---
title: Manage Vendor Matching for Xero
description: Learn how Xero vendor matching assigns contacts to non-reimbursable company card expenses before they export as bank transactions, including automatic matching and manual selection.
keywords: [Xero, vendor matching, vendor, contacts, suppliers, company card expenses, bank transactions]
internalScope: Audience is workspace admins using the Xero connection. Covers imported Xero contacts, automatic and manual vendor assignment, and how vendors are assigned when company card expenses export as bank transactions. Does not cover Xero connection setup or other export types.
---

# Manage Vendor Matching for Xero

Xero vendor matching lets workspace admins review and update the vendor assigned to non-reimbursable expenses before they export to Xero as bank transactions. Expensify imports eligible contacts from Xero, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export with the correct vendor instead of requiring manual corrections in Xero.

## Who can use Xero vendor matching

This feature is available to workspace admins whose workspace is connected to Xero.

If your workspace isn't connected to Xero yet, [learn how to connect to Xero](/articles/new-expensify/connections/xero/Connect-to-Xero).

---

## How Xero contacts are available for vendor matching

Expensify imports and stores Contacts from Xero for vendor matching.

Contacts marked as Customers are excluded _unless_ they are also marked as Suppliers. This means the **Vendor** list includes contacts that are marked as both Customers and Suppliers.

Contacts marked as Customers but not Suppliers aren't available for vendor matching.

---

## How vendors are matched to non-reimbursable expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your Xero vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a workspace admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

Workspace admins can manually select a vendor from the searchable **Vendor** field on an expense at any time. Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

---

## How to set a fallback (default) vendor for non-reimbursable expenses

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. Under **Xero**, select **Export**.
4. Select **Default vendor**.
5. Choose a vendor from the list. 

The default vendor is used only when an expense doesn't already have a vendor assigned. If no default vendor is configured, expenses export to the vendor **Credit Card Misc**.

---

# FAQ

## Do I have to set a vendor for a non-reimbursable expense?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using eligible contacts imported from Xero. If no match is found, the field can remain blank.

## Which Xero contacts appear in the Vendor field?

Expensify imports Xero contacts and excludes contacts that are marked as Customers unless they're also marked as Suppliers.

A contact marked only as a Customer won't appear in the **Vendor** field. A contact marked as both a Customer and a Supplier can appear.

## Who can see the Vendor field on an expense?

Only workspace admins can view and edit the **Vendor** field. Members and submitters don't see it.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a workspace admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.


