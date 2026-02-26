---
title: INT205 Export Error in Sage Intacct Integration
description: Learn what the INT205 export error means and how to ensure projects are properly linked to customers in Sage Intacct before exporting.
keywords: INT205, Sage Intacct project not associated with customer, Sage Intacct project customer mismatch, project tag export error, Sage Intacct project configuration, Expensify Sage Intacct integration, Sync Now Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT205 export error caused by project and customer association issues. Does not cover employee record or billable configuration errors.
---

# INT205 Export Error in Sage Intacct Integration

If you see the error:

INT205 Export Error: The selected project isn’t associated with the selected customer. Please verify the project tag on all expenses and retry the export.

This means the project selected on one or more expenses is not linked to the selected customer in Sage Intacct.

Sage Intacct requires projects to be associated with a customer when exporting billable or customer-related expenses.

---

## Why the INT205 Export Error Happens in Sage Intacct

The INT205 error typically indicates:

- A project is selected on an expense.
- That project is not associated with the corresponding customer in Sage Intacct.
- Sage Intacct validation failed due to an invalid project–customer relationship.

If the project–customer relationship is not configured correctly in Sage Intacct, the export will fail.

This is a project configuration issue in Sage Intacct, not an employee record or billable configuration error.

---

## How to Fix the INT205 Export Error

Follow the steps below to correct the project configuration and retry the export.

### Confirm Project and Customer Association in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the project used on the report.
3. Confirm that:
   - The project is active.
   - The project is linked to the correct customer.
4. If the project is not associated with a customer, update the project record to link it to the appropriate customer.
5. Save your changes.

### Sync the Workspace in Expensify

After confirming projects are active and properly linked:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Confirm the correct project is selected on each expense.
3. Retry exporting to Sage Intacct.

If the project is correctly associated with the customer, the export should complete successfully.

---

# FAQ

## Does the Project Have to Be Active?

Yes. The project must be active in Sage Intacct for the export to succeed.

## Can I Fix This by Changing the Project on the Expense?

Yes. If the selected project is incorrect, update the expense to use a project that is properly associated with the correct customer.

## Does This Error Affect Non-Project Expenses?

No. This error only occurs when a project tag is selected and that project is not correctly linked to a customer in Sage Intacct.
