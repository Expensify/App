---
title: XERO33 Export Error in Xero Integration
description: Learn what the XERO33 export error means and how to update the year-end lock date in Xero before exporting from New Expensify.
keywords: XERO33, Xero year-end lock date, report before lock date Xero, financial settings lock dates Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO33 export error related to Xero lock dates. Does not cover authentication or category configuration issues.
---

# XERO33 Export Error in Xero Integration

If you see the error:

XERO33 Export Error: The report can’t be exported because it’s dated before the year-end lock date. Please update the year-end lock date in Xero and attempt to export again.

This means the report date or expense date falls before the financial lock date set in Xero.

Xero prevents new transactions from being posted before the configured lock date.

---

## Why the XERO33 Export Error Happens in Xero

The XERO33 error typically occurs when:

- The report date or expense date is earlier than the **Lock Date** set in Xero.
- Xero is configured to prevent transactions before that date.
- The export attempts to create a transaction in a locked financial period.

If the transaction date falls within a locked period, Xero blocks the export.

This is a financial lock setting issue in Xero, not a connection issue.

---

# How to Fix the XERO33 Export Error

Follow the steps below to update the lock date or adjust the report date.

---

## Update the Lock Date in Xero

1. Log in to Xero with appropriate admin permissions.
2. Go to **Accounting > Advanced > Financial Settings**.
3. Scroll to the **Lock Dates** section.
4. Review the current lock date.
5. Remove or adjust the lock date as needed.
6. Click **Save**.

Only modify the lock date if it aligns with your company’s accounting policies.

---

## Run Sync in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the transaction date falls within an open period, the export should complete successfully.

---

# FAQ

## Can I Change the Report Date Instead of Removing the Lock Date?

Yes. If appropriate, you can update the report or expense date so it falls within an open financial period instead of modifying Xero’s lock date.

## Do I Need Xero Admin Access to Fix the XERO33 Error?

Yes. Updating financial lock dates in Xero requires appropriate admin permissions.
