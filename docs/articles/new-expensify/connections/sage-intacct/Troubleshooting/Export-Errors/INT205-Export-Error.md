---
title: INT205 Export Error in Sage Intacct Integration
description: Learn what the INT205 export error means and how to ensure projects are properly linked to customers in Sage Intacct before retrying the export.
keywords: INT205, Sage Intacct project not associated with customer, project customer mismatch Intacct, project tag export error Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT205 export error caused by project and customer association issues. Does not cover employee, tax, or billable configuration errors.
---

# INT205 Export Error in Sage Intacct Integration

If you see the error:

INT205 Export Error: The selected project isn’t associated with the selected customer. Please verify the project tag on all expenses and retry the export.

This means the project selected on one or more expenses is not linked to the selected customer in Sage Intacct.

Sage Intacct requires projects to be associated with a customer when exporting customer-related or billable expenses.

---

## Why the INT205 Export Error Happens in Sage Intacct

The INT205 error typically occurs when:

- A **Project** tag is selected on an expense.
- The project is not associated with the corresponding **Customer** in Sage Intacct.
- The project–customer relationship is misconfigured or outdated.

If the project is not properly linked to the customer, Sage Intacct blocks the export.

This is a project configuration issue, not an employee, tax, or billable configuration issue.

---

# How to Fix the INT205 Export Error

Follow the steps below to correct the project configuration and retry the export.

---

## Confirm the Project Is Active and Linked to the Correct Customer

1. Log in to Sage Intacct.
2. Locate the project referenced in the error message.
3. Open the project record.
4. Confirm that:
   - The project is marked as **Active**.
   - The project is linked to the correct **Customer**.

If the project is not associated with a customer:

1. Update the project record.
2. Link it to the appropriate customer.
3. Click **Save**.

---

## Sync the Workspace

After updating the project:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes project and customer data from Sage Intacct.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the project is active and properly associated with the correct customer, the export should complete successfully.

---

# FAQ

## Does the Project Have to Be Active?

Yes. The project must be active in Sage Intacct for the export to succeed.

## Can I Fix This by Changing the Project on the Expense?

Yes. If the selected project is incorrect, update the expense to use a project that is properly associated with the correct customer.

## Does This Error Affect Non-Project Expenses?

No. This error only occurs when a project tag is selected and that project is not correctly linked to a customer in Sage Intacct.
