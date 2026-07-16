---
title: QuickBooks Online Vendor Matching
description: Learn how vendor matching assigns vendors to non-reimbursable QuickBooks Online company card expenses before export.
keywords: [New Expensify, QuickBooks Online, vendor matching, vendor, company card expenses, default vendor, Credit Card Misc, credit card export]
internalScope: Audience is Workspace Admins using the QuickBooks Online connection with Credit/Debit card company card export. Covers the imported vendor list, the Vendor expense field, auto-matching, the default vendor fallback, and vendor export behavior. Does not cover general QuickBooks Online connection setup or other export types.
---

QuickBooks Online vendor matching lets you review and correct the vendor assigned to non-reimbursable company card expenses before they export to QuickBooks Online, instead of correcting vendor coding in QuickBooks after the fact. Expensify imports your QuickBooks Online vendor list, auto-matches vendors to expenses where it can, and lets Workspace Admins set or change the vendor on each expense.

Vendor matching applies only when QuickBooks Online is connected and **Credit card** or **Debit card** is selected as the company card export type. The **Vendor** field is visible to Workspace Admins only.

---

# QuickBooks Online Vendor Matching

Vendor matching moves vendor assignment upstream onto the expense itself, so the vendor is reviewed and finalized in Expensify before it reaches QuickBooks Online. This gives you clean, final vendor coding on export rather than a generic fallback value that has to be corrected in QuickBooks afterward.

---

## Who can use QuickBooks Online vendor matching

- Available to Workspace Admins.
- Requires a QuickBooks Online connection with **Credit card** or **Debit card** selected under **Export company card expenses as**.

If QuickBooks Online is not connected yet, learn how to [connect to QuickBooks Online](/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).

---

## What the Vendors tab shows

When **Credit card** or **Debit card** is selected as the company card export type, a **Vendors** tab appears in your workspace settings, listed below **Taxes** and above **Workflows**. It displays the vendor records imported from QuickBooks Online.

Visibility of the **Vendors** tab is controlled by the company card export setting, so it can't be manually enabled or disabled.

---

## How to set a default vendor for QuickBooks Online company card expenses

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**.
2. Click **Export** under the QuickBooks Online connection.
3. Under **Export company card expenses as**, select **Credit card** or **Debit card**.
4. Select a **Default vendor** from the dropdown.

The default vendor is used as a fallback on export when no vendor is set on an expense. If you leave it empty, expenses that have no vendor export to "Credit Card Misc".

---

## How vendors are assigned to company card expenses

Expensify sets the **Vendor** field automatically where it can:

- If a Merchant Rule matches the expense, the rule's vendor is applied.
- Otherwise, Expensify fuzzy-matches the merchant name against your imported vendor list, using the same logic as merchant nice-naming (for example, "STARBUCKS #456 DOWNTOWN" matches "Starbucks").

When a vendor is set automatically, Concierge posts a system message on the expense noting whether it was set by a Merchant Rule or by fuzzy matching.

Where no vendor is set automatically, a Workspace Admin can select one from the searchable **Vendor** dropdown on the expense. A manually selected vendor is always preserved and won't be overwritten by auto-matching.

---

## How vendors export to QuickBooks Online

On export, Expensify assigns the vendor in this order:

1. The vendor set on the expense.
2. If no vendor is set on the expense, the **Default vendor** from workspace export settings.
3. If no default vendor is set, "Credit Card Misc".

---

## What happens when a vendor becomes inactive

If a vendor set on an expense is later deactivated in QuickBooks Online, or the QuickBooks Online connection is removed, the expense shows a violation — the same behavior as the category, tag, and tax fields. Update the expense with an active vendor to clear the violation.

---

# FAQ

## Who can see the Vendor field on an expense?

The **Vendor** field is visible to Workspace Admins only. Submitters don't see it.

## Why don't I see the Vendors tab?

The **Vendors** tab only appears when QuickBooks Online is connected and **Credit card** or **Debit card** is selected as the company card export type. Its visibility can't be changed manually.

## Does manually setting a vendor stop auto-matching?

Yes. Once you manually set a vendor on an expense, Expensify preserves your selection and won't overwrite it with auto-matching.
