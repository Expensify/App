---
title: NS0046 Export Error in NetSuite Integration
description: Learn how to fix the NS0046 export error in NetSuite when billable expenses are missing a required customer or project.
keywords: NS0046, NetSuite billable expenses error, missing customer project NetSuite, inactive project NetSuite, billable export error NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0046 export error caused by missing or inactive customer/project tags on billable expenses. Does not cover other NetSuite error codes.
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

# FAQ

## Do Non-Billable Expenses Require a Customer or Project?

No. Only billable expenses must be associated with a customer or project.

## Does NS0046 Mean My Integration Is Broken?

No. This error typically indicates a missing or inactive customer/project association.
