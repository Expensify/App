---
title: ONL118 Export Error in QuickBooks Online Integration
description: Learn what the ONL118 export error means in QuickBooks Online and how to associate billable transactions with an active customer or project.
keywords: ONL118, QuickBooks Online export error, associate customer project QuickBooks, billable customer required QuickBooks, inactive customer project QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL118 export error caused by missing or inactive customer or project associations. Does not cover other QuickBooks Online error codes.
---

# ONL118 Export Error in QuickBooks Online Integration

If you see the error:

ONL118: Associate a customer or project on all billable transactions.

This means one or more billable expenses are not linked to a valid QuickBooks Online customer or project, preventing the export from completing.

---

## Why the ONL118 Export Error Happens in QuickBooks Online

The ONL118 error typically indicates:

- A billable expense does not have a customer or project selected.
- The selected customer or project is inactive or deleted in QuickBooks Online.
- A manually created tag is being used instead of a synced QuickBooks customer or project.

QuickBooks Online requires every billable transaction to be linked to an active customer or project.

This is a customer or project mapping issue, not a connection issue.

---

## How to Fix the ONL118 Export Error

This issue can be resolved by verifying customer and project selections.

### Confirm All Billable Expenses Have a Customer or Project

1. Open the affected report.
2. Review all billable expenses.
3. Confirm each billable expense has a valid customer or project selected.
4. Save any updates.

### Confirm the Customer or Project Is Active in QuickBooks Online

1. Log in to QuickBooks Online.
2. Verify the customer or project exists.
3. Confirm it is active and not deleted or archived.

If the customer or project is inactive, reactivate it or select a different active customer or project in the report.

### Sync QuickBooks Online

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

After syncing, retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating customer or project selections and selecting **Sync Now**, retry the export.

## Does ONL118 Mean Billable Is Disabled?

No. It means billable transactions are not properly linked to an active customer or project.

## Do I Need to Reconnect QuickBooks Online?

No. Running **Sync Now** and correcting customer or project selections is typically sufficient.
