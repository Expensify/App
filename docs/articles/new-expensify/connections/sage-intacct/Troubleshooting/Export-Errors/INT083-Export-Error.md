---
title: INT083 Export Error in Sage Intacct Integration
description: Learn what the INT083 export error means and how to select or map categories that support billable expenses in Sage Intacct.
keywords: INT083, Sage Intacct billable expense type error, expense type not billable Intacct, billable category mapping Sage Intacct, vendor bill billable mapping, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT083 export error caused by billable expense type or account mapping configuration. Does not cover general category or tax configuration errors.
---

# INT083 Export Error in Sage Intacct Integration

If you see the error:

INT083 Export Error: Expense item [X] isn’t mapped to a valid billable expense type in Sage Intacct. Please select a category that supports billable expenses.

This means the selected category does not allow billable expenses in Sage Intacct.

If an expense is marked as **Billable**, the corresponding category or expense type must support billable transactions.

---

## Why the INT083 Export Error Happens in Sage Intacct

The INT083 error typically occurs when:

- An expense is marked as **Billable** in the Workspace.
- The selected category does not support billable expenses in Sage Intacct.

Category behavior depends on the export type:

- **Expense Reports** → Categories are based on **Expense Types** in Sage Intacct.
- **Vendor Bills** → Categories are based on the **Chart of Accounts (GL codes)**.

If the selected Expense Type or GL account is not configured to allow billable transactions, Sage Intacct rejects the export.

This is a billable configuration issue, not a tax or general category configuration error.

---

# How to Fix the INT083 Export Error

Follow the steps below to update the category configuration.

---

## Review the Category on the Billable Expense

1. Open the report that failed to export.
2. Identify the expense marked as **Billable**.
3. Note the category selected for that expense.

---

## Confirm the Category Supports Billable Expenses in Sage Intacct

Log in to Sage Intacct and review the configuration based on your export type.

### If Exporting as Expense Reports

1. Go to **Time & Expenses > Expense Types**.
2. Open the Expense Type used on the report.
3. Confirm the Expense Type supports **Billable** transactions.
4. Update the configuration if needed.
5. Click **Save**.

### If Exporting as Vendor Bills

1. Go to **General Ledger > Chart of Accounts**.
2. Locate the GL account mapped to the category.
3. Confirm the account supports billable transactions.
4. Update the configuration if required.
5. Click **Save**.

---

## Sync the Workspace

After updating the category settings:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Return to the report.
2. Retry exporting to Sage Intacct.

If the selected category supports billable expenses, the export should complete successfully.

---

# FAQ

## Can I Fix This by Removing the Billable Designation?

Yes. If the expense should not be billable, remove the **Billable** flag and retry the export.

## Do I Need to Change the Export Type?

Not typically. The issue is usually related to how the selected category or Expense Type is configured.

## Do I Need to Run Sync After Updating Sage Intacct?

Yes. Selecting **Sync Now** ensures updated category settings are reflected before retrying the export.
