---
title: DESK90 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK90 export error means and how to assign valid customers or projects to all billable expenses before exporting to QuickBooks Desktop.
keywords: DESK90, associate customer project QuickBooks Desktop, billable transaction missing customer, QuickBooks billable export error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK90 export error related to missing or inactive customer or project assignments on billable expenses. Does not cover connection or category configuration errors.
---

# DESK90 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK90 Export Error: Associate a customer/project on all billable transactions before exporting to QuickBooks Desktop.

This means one or more expenses marked as **Billable** do not have a valid customer or project assigned.

QuickBooks requires all billable transactions to be linked to an active customer or project.

---

## Why the DESK90 Export Error Happens in QuickBooks Desktop

The DESK90 error typically occurs when:

- A billable expense does not have a customer or project selected.
- The selected customer or project no longer exists in QuickBooks.
- The customer or project was made inactive or deleted in QuickBooks.
- A manually created tag was used instead of a customer or project imported from QuickBooks.

If QuickBooks cannot match the billable expense to a valid customer or project, the export fails.

This is a customer or project assignment issue, not a connection issue.

---

# How to Fix the DESK90 Export Error

Follow the steps below to ensure all billable expenses are properly assigned.

---

## Confirm All Billable Expenses Have a Customer or Project

1. Open the report that failed to export.
2. Review all expenses marked as **Billable**.
3. Confirm each billable expense has a valid customer or project applied.
4. Click **Save** if you make changes.

Every billable expense must have a customer or project selected.

---

## Confirm the Customer or Project Exists in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Confirm the selected customer or project:
   - Exists.
   - Is active.
3. If the customer or project is inactive, make it active.
4. If it was deleted, recreate it if appropriate.

If manually created tags were used instead of imported QuickBooks customers or projects, remove those tags and select the correct imported option.

---

## Run Sync in the Workspace

After confirming customers or projects in QuickBooks:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the customer and project list from QuickBooks.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If all billable expenses are linked to valid and active customers or projects, the export should complete successfully.

---

# FAQ

## Does the DESK90 Error Affect Only Billable Expenses?

Yes. This error only occurs when billable expenses are missing a valid customer or project.

## Can I Remove the Billable Flag Instead?

Yes. If the expense should not be billable, removing the billable flag will resolve the error.

## Do I Need to Reconnect the Integration?

No. Running **Sync now** and updating the customer or project assignments is usually sufficient.
