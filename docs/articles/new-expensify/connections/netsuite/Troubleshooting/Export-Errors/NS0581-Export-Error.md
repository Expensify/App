---
title: NS0581 Export Error in NetSuite Integration
description: Learn what the NS0581 export error means and how to create a Non-Inventory Sales Item in NetSuite or correct the report type before exporting.
keywords: NS0581, NetSuite invoice item not found, Non-Inventory Sales Item NetSuite, Expensify invoice export error, change report type to Expense report, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0581 export error related to invoice exports and report type configuration. Does not cover vendor bill or expense category mapping issues.
---

# NS0581 Export Error in NetSuite Integration

If you see the error:

NS0581 Export Error: NetSuite couldn’t find an invoice item. Please create a 'Non-Inventory Sales Item' for Expensify invoices and confirm this export is intended to be an invoice (not an expense report).

This means NetSuite cannot locate a valid invoice item for the export.

This usually happens when exporting an **Invoice** instead of an **Expense report**.

---

## Why the NS0581 Export Error Happens in NetSuite

The NS0581 error typically occurs when:

- The export type is set to **Invoice**.
- A required **Non-Inventory Sales Item** does not exist in NetSuite.
- The report was mistakenly exported as an invoice instead of an expense report.

NetSuite requires a valid Non-Inventory Sales Item for invoice exports.

This is an invoice configuration issue, not a vendor bill or expense category mapping issue.

---

## How to Fix the NS0581 Export Error for Invoice Exports

If the export is intended to be an **Invoice**, follow these steps.

---

## Create a Non-Inventory Sales Item in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Accounting > Items > New**.
3. Select **Non-Inventory Item for Sale**.
4. Complete the required fields.
5. Click **Save**.

This item will be used for Expensify invoice exports.

---

## Sync the Workspace and Retry the Export

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Then retry exporting the invoice.

---

## How to Fix the NS0581 Export Error for Expense Reports

If the export is meant to be an **Expense report**, update the report type.

---

## Change the Report Type to Expense Report

1. Open the report.
2. If the report is approved, click **Unapprove**.
3. Open the report details.
4. Locate the **Type** field.
5. Change the type to **Expense report**.
6. Resubmit and approve the report.
7. Retry exporting.

---

# FAQ

## How Do I Know if the Report Is Set as an Invoice?

Check the **Type** field in the report details. If it is set to **Invoice**, NetSuite will require a Non-Inventory Sales Item.

## Do I Need NetSuite Admin Access to Fix the NS0581 Export Error?

Yes. Creating a Non-Inventory Sales Item in NetSuite requires administrator permissions.

## Does This Error Affect Vendor Bills?

No. This error specifically affects invoice exports.
