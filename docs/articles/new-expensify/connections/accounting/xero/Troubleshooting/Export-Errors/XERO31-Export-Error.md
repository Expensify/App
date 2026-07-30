---
title: XERO31 Export Error in Xero Integration
description: Learn what the XERO31 export error means and how to remove and redo the payment in Xero before re-exporting from New Expensify.
keywords: XERO31, Xero expense already paid, re-export reimbursable expense Xero, remove and redo payment Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO31 export error related to re-exporting reimbursable expenses already marked as paid in Xero. Does not cover category, authentication, or organization selection errors.
---

# XERO31 Export Error in Xero Integration

If you see the error:

XERO31 Export Error: This expense has already been marked as paid in Xero, so it can’t be updated.

This means the report was previously exported and marked as **Paid** in Xero.

Xero does not allow updates to bills that are already marked as paid.

---

## Why the XERO31 Export Error Happens in Xero

The XERO31 error typically occurs when:

- A reimbursable expense report has already been exported to Xero.
- The bill has been marked as **Paid** in Xero.
- You attempt to re-export or update the report.

Because the bill is already paid, Xero blocks modifications to the transaction.

This is a payment status restriction in Xero, not a connection issue.

---

# How to Fix the XERO31 Export Error

Follow the steps below to remove the payment in Xero and retry the export.

---

## Remove and Redo the Payment in Xero

1. Log in to Xero with appropriate permissions.
2. Go to **Business > Bills to Pay**.
3. Select the **Paid** tab.
4. Locate and open the bill associated with the report.
5. Click the blue **Payment** link.
6. Click **Options > Remove and Redo**.

Do not void the bill. Use **Remove and Redo** to remove the payment while keeping the bill active.

---

## Retry the Export in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Open the affected report.
4. Retry exporting the report to Xero.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Open the affected report.
5. Retry exporting to Xero.

The new export will update the existing bill in Xero while retaining the same report ID.

---

# FAQ

## Should I Void the Bill Instead of Removing the Payment?

No. Voiding the bill will prevent it from being updated or re-exported. Always use **Remove and Redo**.

## Will the New Export Create a Duplicate Bill?

No. Removing and redoing the payment allows the export to update the existing bill rather than creating a duplicate.
