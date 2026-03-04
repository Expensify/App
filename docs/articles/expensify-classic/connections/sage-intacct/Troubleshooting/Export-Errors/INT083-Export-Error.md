---
title: INT083 Export Error in Sage Intacct Integration
description: Learn what the INT083 export error means in Sage Intacct and how to configure billable expense types or account mappings to restore successful exports.
keywords: INT083, Sage Intacct billable expense type error, expense item not mapped Intacct, billable expenses Intacct configuration, category not billable Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT083 export error caused by billable expense type mapping issues in Sage Intacct. Does not cover authentication or employee configuration errors.
---

# INT083 Export Error in Sage Intacct Integration

If you see the error:

INT083 Export Error: Expense item [X] isn’t mapped to a valid billable expense type in Sage Intacct. Please select a category that supports billable expenses.

This means the selected category in Expensify is not configured to allow billable expenses in Sage Intacct.

Sage Intacct requires categories to be mapped to expense types or accounts that support billable transactions.

---

## Why the INT083 Export Error Happens in Sage Intacct

The INT083 error typically indicates:

- An expense is marked as **billable** in Expensify.
- The selected category does not allow billable expenses in Sage Intacct.
- The expense type or account mapping does not support billable transactions.

If the category does not support billable expenses, Sage Intacct blocks the export.

This is a category or expense type configuration issue in Sage Intacct, not an authentication or employee setup error.

---

## How to Fix the INT083 Export Error

You must update the category mapping or expense type configuration in Sage Intacct.

### Review the Category on the Report in Expensify

1. Open the report.
2. Review the category selected for each billable expense.
3. Identify the category referenced in the error.

### Update Expense Type Configuration in Sage Intacct (Expense Report Export)

If you export as Expense Reports:

1. Log in to Sage Intacct.
2. Go to **Time & Expense**.
3. Locate the relevant **Expense Types**.
4. Confirm the expense type supports billable expenses.
5. Update the configuration if needed.
6. Save your changes.

### Update Account Configuration in Sage Intacct (Vendor Bill Export)

If you export as Vendor Bills:

1. Log in to Sage Intacct.
2. Go to the **Chart of Accounts**.
3. Open the account used for the category.
4. Confirm the account allows billable transactions.
5. Update the configuration if needed.
6. Save your changes.

After updating Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Does This Error Only Affect Billable Expenses?

Yes. This error appears when exporting expenses marked as billable.

## Do I Need Sage Intacct Admin Access?

You need sufficient permissions in Sage Intacct to update expense types or account configurations.
