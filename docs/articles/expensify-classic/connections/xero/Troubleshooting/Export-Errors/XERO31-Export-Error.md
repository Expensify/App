---
title: XERO31 Export Error in Xero Integration
description: Learn what the XERO31 export error means and how to remove and redo the payment in Xero before re-exporting a report.
keywords: XERO31, Xero expense already paid, re-export reimbursable expense Xero, remove and redo payment Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO31 export error caused by re-exporting reimbursable expenses already marked as paid in Xero. Does not cover category or authentication errors.
---

# XERO31 Export Error in Xero Integration

If you see the error:

XERO31 Export Error: This expense has already been marked as paid in Xero, so it can’t be updated.

This means the report was previously exported and marked as **Paid** in Xero.

Xero does not allow updates to bills that are already marked as paid.

---

## Why the XERO31 Export Error Happens in Xero

The XERO31 error typically indicates:

- A reimbursable expense report was already exported to Xero.
- The bill has been marked as **Paid** in Xero.
- You attempted to re-export or update the same report.

Because the bill is already paid, Xero blocks modifications.

This is a payment status issue in Xero, not a category or authentication error.

---

## How to Fix the XERO31 Export Error

Follow the steps below to remove the payment and retry the export.

### Remove the Payment in Xero

1. Log in to Xero.
2. Go to **Business > Bills to Pay**.
3. Click the **Paid** tab.
4. Locate and open the bill associated with the report.
5. Click the blue **Payment** link.
6. Click **Options > Remove and Redo**.

Important: Do not void the bill. Use **Remove and Redo** to keep the bill active but remove the payment.

### Retry the Export in Expensify

1. Return to the Workspace.
2. Open the report.
3. Retry exporting the report to Xero.

The new export will override the previous bill in Xero while retaining the same report ID.

---

# FAQ

## Should I Void the Bill Instead of Removing the Payment?

No. Voiding the bill can create reconciliation issues. Always use **Remove and Redo**.

## Will the New Export Create a Duplicate Bill?

No. The export will override the existing bill while keeping the same report ID.

## Does This Error Affect Non-Reimbursable Reports?

No. This error typically occurs when re-exporting reimbursable expense reports that have already been marked as paid in Xero.
