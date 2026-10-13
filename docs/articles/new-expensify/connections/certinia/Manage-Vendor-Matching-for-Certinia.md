---
title: Manage Vendor Matching for Certinia
description: Learn how Certinia FFA vendor matching assigns vendors to non-reimbursable expenses before they export as Payable Invoices, including automatic matching, manual selection, and default vendor behavior.
keywords: [Certinia, FinancialForce, FFA, vendor matching, vendor, company card expenses, Payable Invoices, default vendor]
internalScope: Audience is workspace admins using the Certinia FFA connection. Covers imported Certinia vendors, automatic and manual vendor assignment, default vendor behavior, how vendors affect Payable Invoice export, and vendors that are no longer valid. Does not cover Certinia connection setup, other Certinia configuration settings, Certinia PSA/SRP, or vendor matching for other accounting connections.
noindex: true
sitemap: false
---

# Manage Vendor Matching for Certinia

Certinia vendor matching lets workspace admins review and update the vendor assigned to non-reimbursable expenses before they export to Certinia FFA as Payable Invoices. Expensify imports your Certinia vendor accounts, automatically matches vendors where possible, and lets admins set or update the **Vendor** field before export. This helps ensure expenses export to the correct vendor account instead of requiring manual corrections in Certinia.

## Who can use Certinia vendor matching

This feature is available to workspace admins whose workspace:

 - Is connected to Certinia using the FFA module.
 - Has finished configuring the Certinia connection.

Certinia vendor matching isn't available for Certinia PSA or SRP connections.

Certinia vendor matching is rolling out gradually. If the **Vendors** feature and the **Vendor** field don't appear on a configured Certinia FFA workspace, they aren't enabled for your workspace yet.

If your workspace isn't connected to Certinia yet, learn how to [connect to Certinia](/articles/new-expensify/connections/certinia/Connect-To-Certinia).

## How vendors are matched to expenses

Expensify assigns vendors automatically in the following order:

 - If a workspace merchant rule specifies a vendor, that vendor is assigned.
 - Otherwise, Expensify automatically matches the merchant name against your imported Certinia vendor list. For example, **STARBUCKS #456 DOWNTOWN** matches **Starbucks**.
 - If no match is found, the **Vendor** field remains empty until a workspace admin selects one.

Whenever a vendor is assigned automatically, Concierge posts a system message on the expense indicating whether the vendor was set by a merchant rule or by vendor matching.

## How to select a Certinia vendor on an expense

1. Open the non-reimbursable expense.
2. Select **Vendor**.
3. Search for the vendor by name.
4. Select the vendor you want to assign.

Once a vendor is selected manually, Expensify preserves that selection and won't overwrite it with automatic matching.

![The expense details view for a non-reimbursable company card expense on a Certinia-connected workspace, with the Vendor row visible directly below Category and a matched vendor name shown]({{site.url}}/assets/images/Expense_select-vendor.png){:width="100%"}

## Where to find your imported Certinia vendors

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Vendors**.
3. Use **Find vendor** to search the list by name.

Vendors are managed in Certinia, so the list is read-only in Expensify and refreshes when the connection syncs. Expensify imports Salesforce accounts of type Vendor or Supplier from your Certinia FFA account.

## How to set a default vendor for Certinia

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the Certinia connection, select **Export**.
4. Select **Default vendor**.
5. Select a vendor from your imported Certinia vendor list.

The default vendor is used only when an expense doesn't already have a vendor assigned.

## How vendors export to Certinia

When non-reimbursable expenses export to Certinia FFA, Expensify assigns each expense to a vendor account in the following order:

1. The vendor selected on the expense, if it's still in your imported Certinia vendor list.
2. The vendor account set for the company card, if one is set.
3. The **Default vendor** configured in the Certinia export settings.
4. The Certinia account linked to the report submitter's email.

Expensify creates one Payable Invoice for each combination of company card and vendor account on the report. For example, a report with expenses from two vendors on the same card exports as two Payable Invoices.

Because a matched vendor or default vendor can be used, non-reimbursable expenses can export even if the report submitter isn't set up as a contact in Certinia.

Reimbursable expenses aren't affected by vendor matching. They continue to export as one Payable Invoice made out to the employee.

## How vendors that are no longer valid affect expenses

If a vendor assigned to an expense is removed or archived in Certinia, the expense displays a **Vendor no longer valid** error after the connection syncs, similar to category, tag, and tax violations.

Select an active vendor on the expense to clear the error.

# FAQ

## Do I have to set a vendor?

No. The **Vendor** field is optional.

Expensify automatically attempts to match a vendor using your imported Certinia vendor list. If no match is found, the field can remain blank, and the expense exports using the next available vendor account described in the export order above.

## Does manually assigning a vendor stop automatic matching?

Yes. Once a workspace admin manually assigns a vendor to an expense, Expensify preserves that selection and won't replace it with automatic matching.

## Why don't I see any vendors to choose from?

The vendor selector shows **No vendors found** when your Certinia vendor list is empty. Add the vendors in Certinia, then sync the connection again.

## Why is vendor matching missing on my Certinia PSA workspace?

Vendor matching is only available for Certinia FFA connections. Certinia PSA and SRP connections don't support vendor matching.
