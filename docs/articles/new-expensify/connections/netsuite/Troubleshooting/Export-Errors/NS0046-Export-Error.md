---
title: NS0046 Export Error in NetSuite Integration
description: Learn how to fix NS0046 billable coding errors and the related NetSuite error “This expense line cannot be billable.”
keywords: NS0046, NetSuite billable expense error, This expense line cannot be billable, enable Customers, customer project required NetSuite, uncheck Billable, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers NS0046 customer or project coding, enabling Customers, and related billable-line errors. Does not cover role permission or subsidiary mismatch issues.
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

## How to enable NetSuite Customers for billable expenses

If an expense should be billed to a customer, make sure the workspace imports the customer or project coding it needs.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to NetSuite, then select **Import**.
3. Enable **Customers** if disabled, and confirm customers or projects are imported at the level needed for your billable expenses.
4. Select **More (⋮) > Sync now**.
5. Apply a valid imported **Customer** or **Project** to each billable expense before retrying the export.

Learn how to [configure NetSuite customer and project imports](/articles/new-expensify/connections/netsuite/Configure-Netsuite).

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
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

After syncing, open the report and retry exporting to NetSuite.

---

## How to fix “This expense line cannot be billable” in NetSuite

You may see this separate NetSuite validation error, including after correcting a required field such as Line of Business:

> Error while accessing a resource. This expense line cannot be billable.

This is not the NS0046 missing-customer error. Confirm whether the affected expense should actually be billed to a customer.

If it should **not** be billable:

1. Open the report and edit the affected expense in Expensify.
2. Clear the **Billable** checkbox.
3. Save the change and retry exporting the report.

If it **should** remain billable, do not clear **Billable** just to make the export succeed. Confirm the customer or project coding using the steps above, then ask your NetSuite administrator to review why the expense line does not allow billing. Enabling Customers alone does not guarantee that NetSuite will accept a billable line.

---

# FAQ

## Does the NS0046 Export Error Affect Non-Billable Expenses?

No. This error applies only to expenses marked as billable.

## Do I Need NetSuite Admin Access to Fix the NS0046 Export Error?

You may need sufficient NetSuite permissions to confirm whether the customer or project is active.

## Can I Fix This by Changing the Project or Customer on the Expense?

Yes. Selecting a valid, active NetSuite customer or project will resolve the error if the previous one was invalid.
