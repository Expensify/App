---
title: XERO44 Export Error in Xero Integration
description: Learn what the XERO44 export error means and how to handle invoices that were previously voided in Xero before attempting to re-export from New Expensify.
keywords: XERO44, Xero invoice status cannot be modified, voided invoice Xero, re-export invoice Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO44 export error related to previously voided invoices in Xero. Does not cover bill exports or authentication issues.
---

# XERO44 Export Error in Xero Integration

If you see the error:

XERO44 Export Error: Invoice status in Xero cannot be modified. This invoice was previously exported and then voided in Xero. Voided invoices can’t be updated or re-exported.

This means the invoice was exported once and later marked as **Voided** in Xero.

Xero does not allow voided invoices to be reopened, edited, or re-exported.

---

## Why the XERO44 Export Error Happens in Xero

The XERO44 error typically occurs when:

- An invoice was previously exported from the Workspace to Xero.
- The invoice was marked as **Voided** in Xero.
- A re-export or update is attempted from the Workspace.

Once an invoice is voided in Xero, it is permanently locked and cannot be modified.

This is a document status restriction in Xero, not a connection issue.

---

# How to Fix the XERO44 Export Error

Because Xero does not allow voided invoices to be updated or unvoided, you must either recreate the invoice in the Workspace or manually recreate it in Xero.

---

## Recreate the Invoice in the Workspace

If the invoice status in the Workspace is:

- **Approved**
- **Done**
- **Paid** (but not reimbursed via ACH)

You can recreate it:

1. Open the invoice.
2. Click **Unapprove** or **Retract**.
3. Move the expenses to a new invoice.
4. Submit the new invoice.
5. Retry exporting to Xero.

If the invoice is listed as **Paid: Confirmed**, it cannot be reopened. In that case, proceed to manually recreate it in Xero.

---

## Manually Recreate the Invoice in Xero

If the invoice cannot be reopened in the Workspace:

1. Log in to Xero.
2. Create a new invoice manually.
3. Enter the required invoice details to match the original transaction.
4. Save the invoice.

Because the original invoice was voided, it cannot be replaced through re-export.

---

# FAQ

## Can a Voided Invoice Be Unvoided in Xero?

No. Xero permanently locks voided invoices and does not allow them to be restored.

## Will Re-Exporting Create a Duplicate Invoice?

No. Xero blocks re-exporting to prevent duplicates when an invoice has already been voided.
