---
title: DESK41 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK41 export error means and how to correct invalid billable customer settings in QuickBooks Desktop before exporting.
keywords: DESK41, invalid billable status QuickBooks Desktop, customer not marked billable QuickBooks, billable expense QuickBooks error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK41 export error related to invalid billable customer configuration. Does not cover connection or mapping errors.
---

# DESK41 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK41 Export Error: QuickBooks Desktop rejected the expense due to an invalid billable status.

This means the customer selected on the report is not marked as billable in QuickBooks Desktop.

QuickBooks requires customers associated with billable expenses to be properly configured.

---

## Why the DESK41 Export Error Happens in QuickBooks Desktop

The DESK41 error typically occurs when:

- An expense is marked as **Billable**.
- A customer is selected on the expense.
- The selected customer is not marked as billable in QuickBooks Desktop.

If the customer is not set up correctly, QuickBooks rejects the export.

This is a customer configuration issue, not a connection issue.

---

# How to Fix the DESK41 Export Error

Follow the steps below to correct the customer or billable settings.

---

## Confirm the Customer Is Marked as Billable in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Locate the customer associated with the expense.
3. Confirm the customer is configured to allow billable transactions.
4. Save any changes.

If the customer should not be billable, update the report instead.

---

## Remove the Customer or Billable Flag (If Applicable)

If the expense should not be billable:

1. Open the report in the Workspace.
2. Edit the affected expense.
3. Either:
   - Remove the customer selection, or
   - Remove the **Billable** flag.
4. Click **Save**.

---

## Run Sync in the Workspace

After updating QuickBooks or the report:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the customer is configured correctly or the billable flag is removed, the export should complete successfully.

---

# FAQ

## Does the DESK41 Error Mean My Integration Is Disconnected?

No. It means the customer selected for a billable expense is not configured correctly in QuickBooks Desktop.

## Can I Remove the Billable Flag Instead?

Yes. If the expense should not be billable, removing the billable flag will resolve the issue.

## Do I Need Admin Access in QuickBooks Desktop?

You may need appropriate permissions to modify customer settings in QuickBooks Desktop.
