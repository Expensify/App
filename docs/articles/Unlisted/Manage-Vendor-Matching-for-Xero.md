---
title: Manage Vendor Matching for Xero
description: Learn how Xero vendor matching assigns suppliers to company card expenses before they export, including automatic matching, manual selection, and Default vendor behavior.
keywords: [Xero, vendor matching, supplier matching, Default vendor, company card expenses, bank transactions, Xero export]
internalScope: Audience is Workspace Admins using the Xero connection with vendor matching enabled. Covers imported Xero contacts, automatic and manual supplier assignment, and the Default vendor export setting. Does not cover Xero connection setup, import settings, or advanced sync settings.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Xero

Xero vendor matching lets Workspace Admins review and update the supplier assigned to company card expenses before they export to Xero. Expensify imports your Xero contacts, automatically matches suppliers where possible, and lets admins set or update the **Supplier** field before export. This helps ensure expenses export with the correct supplier instead of requiring manual corrections in Xero.

## Who can use Xero vendor matching

This feature is available to Workspace Admins whose Workspace is connected to Xero.

Xero vendor matching is currently in beta. If you don't see the **Default vendor** row under **Export**, vendor matching isn't enabled for your Workspace yet.

If your Workspace isn't connected to Xero yet, learn how to [connect to Xero](/articles/new-expensify/connections/xero/Connect-to-Xero).

## How suppliers are matched to Xero company card expenses

Expensify assigns suppliers automatically in the following order:

- If a workspace merchant rule specifies a supplier, that supplier is assigned.
- Otherwise, Expensify automatically matches the merchant name against your imported Xero contacts. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
- If no match is found, the **Supplier** field remains empty until a Workspace Admin selects one.

Workspace Admins can manually select a supplier from the searchable **Supplier** field on an expense at any time. Once a supplier is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

## How to set a Default vendor for Xero company card expenses

1. Click the navigation tabs (on the left on web, on the bottom on mobile), then go to **Workspaces > [workspace name] > Accounting > Xero**.
2. Click **Export**.
3. Select **Default vendor**.
4. Choose a supplier from the list, or select **None** to clear the default.

The **Default vendor** row appears under **Xero bank account**. When a supplier is selected, the row displays: Expenses that don't auto-match will default to this vendor.

<!-- SCREENSHOT:
Suggestion: The Xero Export configuration page with the Default vendor row visible directly under Xero bank account, showing a selected supplier and its helper text.
Location: Immediately after the numbered steps in this section.
Purpose: Admins looking for a "Default supplier" row won't find one — this confirms the row is now named Default vendor and shows where it sits relative to Xero bank account.
-->

## How the Default vendor setting affects Xero exports

Xero exports company card expenses as bank transactions. When those expenses export, Expensify assigns suppliers in the following order:

1. The supplier selected on the expense.
2. The supplier selected as the **Default vendor**.

If neither is set, Expensify doesn't apply a supplier. Unlike QuickBooks Online, Xero doesn't create a stand-in supplier such as Credit Card Misc.

# FAQ

## Why does the expense say Supplier when the setting says Default vendor?

Expensify uses Xero's own terminology on the expense, where the field is labeled **Supplier**. The workspace setting that picks the fallback is labeled **Default vendor** so it matches the equivalent setting on the QuickBooks Online and Sage Intacct connections.

## Do I have to set a Default vendor?

No. The **Default vendor** setting is optional. If you leave it blank, expenses that don't auto-match export without a supplier applied.

## How do I remove a Default vendor I already set?

Open the **Default vendor** row and select **None**. The row clears and no fallback supplier is applied on export.

## Does manually assigning a supplier stop automatic matching?

Yes. Once a Workspace Admin manually assigns a supplier to an expense, Expensify preserves that selection and won't replace it with automatic matching.
