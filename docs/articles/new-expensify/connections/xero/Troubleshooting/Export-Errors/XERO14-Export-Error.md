---
title: XERO14 Export Error in Xero Integration
description: Learn what the XERO14 export error means and how to assign customers to billable expenses before exporting to Xero in New Expensify.
keywords: XERO14, Xero billable expense requires customer, billable expenses no customer Xero, Expensify Xero export error, associate customer billable expense, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO14 export error related to missing customer assignments on billable expenses. Does not cover authentication or chart of accounts configuration issues.
---

# XERO14 Export Error in Xero Integration

If you see the error:

XERO14 Export Error: Billable expenses require a customer. Please associate a customer on all billable transactions before exporting to Xero.

This means one or more expenses are marked as **Billable** but do not have an associated customer.

Xero requires all billable expenses to be linked to a customer before export.

---

## Why the XERO14 Export Error Happens in Xero

The XERO14 error typically occurs when:

- An expense is marked as **Billable**.
- No **customer** is assigned to that expense.
- The export attempts to create a billable transaction in Xero.

In Xero, billable transactions must be associated with a valid Contact (customer). If a customer is missing, the export will fail.

This is a billable expense configuration issue, not a connection issue.

---

# How to Fix the XERO14 Export Error

Follow the steps below to assign customers to billable expenses and retry the export.

---

## Enable Billable Expenses in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Coding**.
5. Enable **Billable expenses**.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap **Coding**.
6. Enable **Billable expenses**.
7. Tap **Save**.

---

## Assign a Customer to Each Billable Expense

1. Open the report that failed to export.
2. Review each expense marked as **Billable**.
3. Select a valid **customer** for each billable expense.
4. Click **Save**.

Every billable expense must have a customer before exporting to Xero.

---

## Confirm the Customer Exists in Xero

If the customer does not appear in the dropdown:

1. Log in to Xero.
2. Confirm the Contact exists.
3. Ensure the Contact is active.

If needed, create the Contact in Xero and then run **Sync now** in the Workspace to import updated customer data.

---

## Run Sync and Retry the Export

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the Xero connection.
3. Click **Sync now**.
4. Return to the report and retry exporting to Xero.

If all billable expenses have customers assigned, the export should complete successfully.

---

# FAQ

## Can I Export Billable Expenses Without a Customer?

No. Xero requires a customer to be associated with all billable expenses.

## Do I Need Xero Admin Access to Fix This Error?

You may need appropriate permissions in Xero to create or manage Contacts if the required customer does not already exist.
