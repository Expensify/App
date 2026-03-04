---
title: DESK90 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK90 export error in QuickBooks Desktop when billable transactions are missing a customer or project.
keywords: DESK90, QuickBooks Desktop billable transactions error, associate customer project billable expenses, customer project inactive QuickBooks Desktop, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK90 export error caused by missing or inactive customer/project associations. Does not cover QuickBooks Online errors.
---

# DESK90 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK90: Associate a customer/project on all billable transactions before exporting to QuickBooks Desktop.

This means one or more billable expenses on the report are not linked to a valid customer or project in QuickBooks Desktop.

---

## Why the DESK90 Export Error Happens in QuickBooks Desktop

The DESK90 error occurs when:

- A billable expense does not have a customer or project selected in Expensify.
- The associated customer or project was deleted or made inactive in QuickBooks Desktop.
- A manually created tag in Expensify does not match a customer or project imported from QuickBooks Desktop.

All billable transactions must be linked to an active QuickBooks Desktop customer or project before exporting.

---

## How to Fix the DESK90 Export Error

### Step One: Confirm All Billable Expenses Have a Customer or Project

1. Open the report in Expensify.
2. Review each billable expense.
3. Confirm a **Customer/Project** is selected on every billable expense.
4. Update any missing fields.
5. Save your changes.

---

### Step Two: Confirm the Customer or Project Is Active in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to **Customer Center**.
3. Confirm the customer or project used on the report:
   - Exists.
   - Is active.

If the customer or project is inactive or deleted:

- Reactivate it, or
- Select a different active customer or project in Expensify.

If you previously created manual tags in Expensify that were not imported from QuickBooks Desktop, remove those tags and use only synced customer or project options.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

---

### Step Four: Retry the Export

1. Open the updated report.
2. Retry exporting to QuickBooks Desktop.

Once all billable expenses are linked to active QuickBooks Desktop customers or projects, the export should complete successfully.

---

# FAQ

## Do Only Billable Expenses Require a Customer or Project?

Yes. Only billable transactions must be associated with a customer or project.

## Does DESK90 Mean My Connection Is Broken?

No. This error typically indicates a missing or inactive customer/project association.
