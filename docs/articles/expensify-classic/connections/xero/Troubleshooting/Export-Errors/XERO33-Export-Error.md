---
title: XERO33 Export Error in Xero Integration
description: Learn what the XERO33 export error means and how to update the year-end lock date in Xero before retrying your export.
keywords: XERO33, Xero year-end lock date, report before lock date Xero, Financial Settings lock dates Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO33 export error caused by Xero lock dates. Does not cover authentication or chart of accounts issues.
---

# XERO33 Export Error in Xero Integration

If you see the error:

XERO33 Export Error: The report can’t be exported because it’s dated before the year-end lock date. Please update the year-end lock date in Xero and attempt to export again.

This means the report date falls before the financial lock date set in Xero.

Xero prevents new transactions or changes from being posted before the configured lock date.

---

## Why the XERO33 Export Error Happens in Xero

The XERO33 error typically indicates:

- The report date or expense date is earlier than the **Year-End Lock Date** in Xero.
- Xero is configured to prevent transactions before that date.
- Xero validation failed because the transaction date is locked.

If the transaction date falls within a locked period, Xero blocks the export.

This is a financial lock date issue in Xero, not an authentication or chart of accounts error.

---

## How to Fix the XERO33 Export Error

Follow the steps below to update the lock date or adjust the report date.

### Update Lock Dates in Xero

1. Log in to Xero.
2. Go to **Accounting > Advanced > Financial Settings**.
3. Scroll to the **Lock Dates** section.
4. Review the current lock date.
5. Remove or adjust the lock date if appropriate for your accounting policies.
6. Click **Save**.

Only modify the lock date if it aligns with your accounting controls and period management.

### Sync the Workspace in Expensify

After updating the lock date:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the report date falls within an open period, the export should complete successfully.

---

# FAQ

## Can I Change the Report Date Instead of Removing the Lock Date?

Yes. If appropriate, you can update the report date to fall within an open period instead of modifying Xero’s lock date.

## Do I Need Xero Admin Access to Fix the XERO33 Export Error?

You need sufficient permissions in Xero to update financial lock dates.

## Does This Error Affect All Reports?

Only reports dated before the configured lock date will fail. Reports within open periods will export normally.
