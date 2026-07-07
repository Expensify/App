---
title: XERO14 Export Error in Xero Integration
description: Learn what the XERO14 export error means and how to assign customers to billable expenses before exporting to Xero.
keywords: XERO14, Xero billable expense requires customer, billable expenses no customer Xero, Expensify Xero export error, associate customer billable expense, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO14 export error caused by missing customer assignments on billable expenses. Does not cover authentication or chart of accounts issues.
---

# XERO14 Export Error in Xero Integration

If you see the error:

XERO14 Export Error: Billable expenses require a customer. Please associate a customer on all billable transactions before exporting to Xero.

This means one or more expenses are marked as **Billable**, but do not have an associated customer.

Xero requires all billable expenses to be linked to a customer (Contact) before export.

---

## Why the XERO14 Export Error Happens in Xero

The XERO14 error typically indicates:

- An expense is marked as **Billable**.
- No customer is assigned to the expense.
- Xero validation failed because billable transactions must be linked to a Contact.

In Xero, billable transactions must be associated with a valid Contact (customer). If a customer is missing, the export will fail.

This is a customer assignment issue, not an authentication or chart of accounts error.

---

## How to Fix the XERO14 Export Error

Follow the steps below to assign customers and retry the export.

### Enable Billable Expenses in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Confirm **Billable expenses** are enabled.
7. Click **Save** if changes were made.

### Apply a Customer to Each Billable Expense

1. Open the report.
2. Review each expense marked as **Billable**.
3. Apply a valid **customer tag** to each billable expense.
4. Click **Save**.

Every billable expense must have a customer assigned.

### Confirm the Customer Exists in Xero

If the customer does not appear in the Workspace:

1. Log in to Xero.
2. Confirm the Contact exists.
3. If needed, create a temporary invoice for that Contact.
4. Save the invoice.
5. Void or delete the invoice if appropriate.

Creating an invoice ensures the Contact is recognized as a customer for syncing.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If all billable expenses have valid customers assigned, the export should complete successfully.

---

# FAQ

## Can I Export Billable Expenses Without a Customer?

No. Xero requires a customer to be associated with all billable expenses.

## Do I Need Xero Admin Access to Fix This?

You may need access to create or manage Contacts and invoices in Xero.

## Does This Error Affect Non-Billable Expenses?

No. This error only occurs when expenses are marked as billable and do not have an assigned customer.
