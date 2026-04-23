---
title: INT012 Export Error in Sage Intacct Integration
description: Learn what the INT012 export error means in Sage Intacct and how to update settings to remove the required Reason for Expense field.
keywords: INT012, Sage Intacct export error, reason for expense required Intacct, expense report requirements Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT012 export error caused by required Reason for Expense settings in Sage Intacct. Does not cover other Sage Intacct error codes.
---

# INT012 Export Error in Sage Intacct Integration

If you see the error:

INT012: Reason for Expense note required.

This means Sage Intacct is configured to require a **Reason for Expense** note, but one was not provided during export, preventing the transaction from completing.

---

## Why the INT012 Export Error Happens in Sage Intacct

The INT012 error typically indicates:

- The **Reason for Expense** field is set as required in Sage Intacct.
- The field is not populated during export.
- Sage Intacct validation failed due to missing required data.

If the field is mandatory, Sage Intacct blocks the export.

This is an Expense Report requirement configuration issue, not an authentication or approval configuration issue.

---

## How to Fix the INT012 Export Error

This issue must be resolved in Sage Intacct.

### Update Expense Report Requirements

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Navigate to **Expense Report Requirements**.
4. Locate the **Reason for Expense** field.
5. Uncheck the requirement so it is no longer mandatory.
6. Save your changes.

After updating the setting:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating the Expense Report Requirements and selecting **Sync Now**, retry the export.

## Can I Keep the Reason for Expense Field Required?

Yes. However, you must ensure the field is populated before exporting, or Sage Intacct will continue to block the transaction.

## Do I Need Sage Intacct Admin Access?

Yes. Updating Expense Report Requirements requires appropriate permissions in Sage Intacct.
