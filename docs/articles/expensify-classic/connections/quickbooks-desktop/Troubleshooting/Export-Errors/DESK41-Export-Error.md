---
title: DESK41 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK41 export error in QuickBooks Desktop when an expense has an invalid billable status.
keywords: DESK41, QuickBooks Desktop invalid billable status, expense rejected billable, customer not marked billable, remove billable flag, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK41 export error caused by incorrect billable settings. Does not cover QuickBooks Online errors.
---

# DESK41 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK41: QuickBooks Desktop rejected the expense due to an invalid billable status.

This means the expense is marked as billable in Expensify, but the associated customer is not set up to allow billable expenses in QuickBooks Desktop.

---

## Why the DESK41 Export Error Happens in QuickBooks Desktop

The DESK41 error occurs when:

- An expense is marked as billable in Expensify.
- A customer is selected on the report.
- The customer record in QuickBooks Desktop is not configured to allow billable expenses.

QuickBooks Desktop requires customers associated with billable expenses to support billable tracking.

---

## How to Fix the DESK41 Export Error

### Option One: Confirm the Customer Is Set Up Correctly in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Navigate to the **Customer Center**.
3. Open the customer associated with the report.
4. Confirm the customer supports billable expenses.
5. Save any changes.

After confirming the customer settings, run a sync in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

Retry exporting the report.

---

### Option Two: Remove the Customer or Billable Flag in Expensify

If the expense does not need to be billable:

1. Open the report in Expensify.
2. Click into the affected expense.
3. Remove the customer selection, or
4. Remove the billable flag from the expense.
5. Save the changes.

Retry exporting the report.

---

# FAQ

## Does DESK41 Mean My QuickBooks Desktop Connection Is Broken?

No. This error indicates a configuration issue with billable settings.

## Do All Customers Need to Be Marked as Billable?

Only customers associated with billable expenses must support billable tracking in QuickBooks Desktop.
