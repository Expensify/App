---
title: INT012 Export Error in Sage Intacct Integration
description: Learn what the INT012 export error means and how to update Sage Intacct settings when the Reason for Expense field is required.
keywords: INT012, Sage Intacct Reason for Expense required, expense report requirements Sage Intacct, Time & Expenses configuration Intacct, Sage Intacct export failure Reason for Expense, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT012 export error caused by the Reason for Expense requirement in Sage Intacct. Does not cover approval or journal configuration errors.
---

# INT012 Export Error in Sage Intacct Integration

If you see the error:

INT012 Export Error: Sage Intacct requires a 'Reason for Expense' note. Please update your Intacct settings to continue.

This means Sage Intacct is configured to require a **Reason for Expense** note, but the report being exported does not include one.

Sage Intacct will block the export when a required field is not populated.

---

## Why the INT012 Export Error Happens in Sage Intacct

The INT012 error typically occurs when:

- The **Reason for Expense** field is marked as required in Sage Intacct.
- The expense report being exported does not include a value for that field.

If the field is required but not populated, Sage Intacct rejects the transaction.

This applies specifically to expense report exports using the **Time & Expenses** module.

---

# How to Fix the INT012 Export Error

You can resolve this by either disabling the requirement in Sage Intacct or ensuring the field is completed before export.

---

## Disable the Reason for Expense Requirement in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Open **Expense Report Requirements**.
4. Uncheck **Reason for Expense** as a required field.
5. Click **Save**.

---

## Sync the Workspace

After updating the setting:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the requirement is disabled, the export should complete successfully.

---

# FAQ

## Can I Keep the Reason for Expense Field Required?

Yes. If you prefer to keep it required, make sure each expense report includes a **Reason for Expense** before exporting.

## Does the INT012 Export Error Affect Vendor Bill Exports?

No. This error applies specifically to expense report exports using the **Time & Expenses** module.

## Do I Need Sage Intacct Admin Permissions to Change This Setting?

Yes. Updating expense report requirements requires administrative access in Sage Intacct.
