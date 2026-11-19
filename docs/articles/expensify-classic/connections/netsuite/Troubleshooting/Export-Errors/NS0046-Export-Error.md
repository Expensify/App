---
title: NS0046 Export Error in NetSuite Integration
description: Learn how to fix NS0046 billable coding errors and the related NetSuite error “This expense line cannot be billable.”
keywords: NS0046, NetSuite billable expense error, This expense line cannot be billable, enable Customers, customer project required NetSuite, uncheck Billable, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers NS0046 customer or project coding, enabling Customers, and related billable-line errors. Does not cover role permission or subsidiary mismatch issues.
---

# NS0046 Export Error in NetSuite Integration

If you see the error:

NS0046: Billable expenses not coded with a NetSuite 'customer' or billable 'project'. Please apply a 'customer' or 'project' to each billable expense and reattempt the export.

This means one or more billable expenses on the report are not linked to a valid customer or project in NetSuite.

---

## Why the NS0046 Export Error Happens in NetSuite

The NS0046 error occurs when:

- A billable expense does not have a customer or project selected in Expensify.
- The associated customer or project was deleted or made inactive in NetSuite.
- A manually created tag in Expensify does not match a customer or project imported from NetSuite.
- The Workspace has not been synced after changes were made in NetSuite.

NetSuite requires all billable expenses to be linked to an active customer or project.

---

## How to enable NetSuite Customers for billable expenses

If an expense should be billed to a customer, make sure the workspace imports the customer or project coding it needs.

1. In Expensify, go to **Settings > Workspaces > [workspace name] > Accounting**.
2. Select **Configure** next to NetSuite, then select **Coding**.
3. Enable **Customers** if disabled, and confirm customers or projects are imported at the level needed for your billable expenses.
4. Save your changes, then return to **Accounting** and select **Sync**.
5. Apply a valid imported **Customer** or **Project** to each billable expense before retrying the export.

Learn how to [configure NetSuite customer and project imports](/articles/expensify-classic/connections/netsuite/Configure-Netsuite).

---

## How to Fix the NS0046 Export Error

### Step One: Confirm All Billable Expenses Have a Customer or Project

1. Open the report in Expensify.
2. Review each expense marked as billable.
3. Confirm a **Customer** or **Project** is selected on every billable expense.
4. Update any missing fields.
5. Save your changes.

---

### Step Two: Confirm the Customer or Project Is Active in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists** > **Relationships**.
3. Select **Customers** or **Projects**.
4. Confirm the customer or project used on the report:
   - Exists.
   - Is active.

If the record is inactive or deleted:

- Reactivate it in NetSuite, or
- Select a different active customer or project in Expensify.

If manually created tags were added in Expensify that were not imported from NetSuite, remove them and use only synced customer or project options.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Export

1. Open the updated report.
2. Retry exporting to NetSuite.

Once all billable expenses are linked to active NetSuite customers or projects, the export should complete successfully.

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

## Do Non-Billable Expenses Require a Customer or Project?

No. Only billable expenses must be associated with a customer or project.

## Does NS0046 Mean My Integration Is Broken?

No. This error typically indicates a missing or inactive customer/project association.
