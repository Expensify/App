---
title: NS0046 Export Error in NetSuite Integration
description: Learn what the NS0046 export error means and how to apply valid NetSuite customer or project tags to billable expenses before exporting.
keywords: NS0046, NetSuite billable expense error, customer project required NetSuite, billable expense not coded NetSuite, invalid project NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0046 export error caused by missing or inactive customer or project tags on billable expenses. Does not cover role permission or subsidiary mismatch issues.
---

# NS0046 Export Error in NetSuite Integration

If you see the error:

NS0046 Export Error: Billable expenses not coded with a NetSuite 'customer' or billable 'project'. Please apply a 'customer' or 'project' to each billable expense and reattempt the export.

This means one or more billable expenses are missing a valid NetSuite customer or project.

NetSuite requires every billable expense to be associated with an active customer or project.

---

## Why the NS0046 Export Error Happens in NetSuite

The NS0046 error typically occurs when:

- A billable expense does not have a **Customer** or **Project** tag applied.
- The selected customer or project is inactive or deleted in NetSuite.
- The tag applied in the Workspace was manually created and not imported from NetSuite.
- NetSuite validation fails because it cannot verify the selected record.

If NetSuite cannot validate the customer or project, the export will fail.

This is a billable coding issue, not a role permission or subsidiary mismatch issue.

---

## How to Fix the NS0046 Export Error

Follow the steps below to correct the billable coding.

---

## Confirm All Billable Expenses Have a Customer or Project

1. Open the report.
2. Review each expense marked as **Billable**.
3. Confirm a valid **Customer** or **Project** tag is applied to every billable expense.
4. Click **Save** if updates are made.

Every billable expense must have a valid NetSuite customer or project.

---

## Confirm the Customer or Project Is Active in NetSuite

1. Log in to NetSuite.
2. Locate the customer or project used on the report.
3. Confirm the record:
   - Exists.
   - Is active.
   - Is available for use.
4. Reactivate the record if needed, or select a valid one in the Workspace.

---

## Remove Manually Created Tags if Necessary

If the customer or project tag was manually created in the Workspace and not imported from NetSuite:

1. Remove the manually created tag.
2. Ensure only NetSuite-imported customers or projects are used.
3. Click **Save**.

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

After syncing, open the report and retry exporting to NetSuite.

---

# FAQ

## Does the NS0046 Export Error Affect Non-Billable Expenses?

No. This error applies only to expenses marked as billable.

## Do I Need NetSuite Admin Access to Fix the NS0046 Export Error?

You may need sufficient NetSuite permissions to confirm whether the customer or project is active.

## Can I Fix This by Changing the Project or Customer on the Expense?

Yes. Selecting a valid, active NetSuite customer or project will resolve the error if the previous one was invalid.
