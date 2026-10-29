---
title: XERO44 Export Error in Xero Integration
description: Learn what the XERO44 export error means and how to handle invoices that were previously voided in Xero.
keywords: XERO44, Xero invoice status cannot be modified, voided invoice Xero, re-export invoice Xero, Expensify Xero invoice error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO44 export error caused by previously voided invoices in Xero. Does not cover bill exports or authentication issues.
---

# XERO44 Export Error in Xero Integration

If you see the error:

XERO44 Export Error: Invoice status in Xero cannot be modified. This invoice was previously exported and then voided in Xero. Voided invoices can’t be updated or re-exported.

This means the invoice was exported once and later marked as **Voided** in Xero.

Xero does not allow voided invoices to be reopened, edited, or re-exported.

---

## Why the XERO44 Export Error Happens in Xero

The XERO44 error typically indicates:

- An invoice was previously exported from the Workspace to Xero.
- The invoice was marked as **Voided** in Xero.
- A re-export or update of that same invoice was attempted.

Once an invoice is voided in Xero, it is permanently locked and cannot be modified.

This is an invoice status limitation in Xero, not a bill export or authentication issue.

---

## How to Fix the XERO44 Export Error

You have two options depending on the invoice status in the Workspace.

---

## Reopen the Invoice in the Workspace and Create a New Invoice

If the invoice status in the Workspace is:

- **Approved**
- **Done**
- **Paid** (not reimbursed via ACH)

You can create a new invoice.

1. Open the invoice.
2. Click **Unapprove** or **Retract**.
3. Move the expenses to a new invoice.
4. Submit the new invoice.
5. Export the new invoice to Xero.

Important: If the invoice is listed as **Paid: Confirmed**, it cannot be reopened. In that case, follow the next option.

---

## Manually Recreate the Invoice in Xero

If the invoice cannot be reopened in the Workspace:

- Recreate the invoice directly in Xero.
- Enter the required invoice details manually.

Because voided invoices cannot be restored or re-exported, manual entry in Xero is required in this scenario.

---

# FAQ

## Can a Voided Invoice Be Unvoided in Xero?

No. Xero permanently locks voided invoices and does not allow them to be reopened or modified.

## Will Re-Exporting Create a Duplicate Invoice?

No. Xero blocks re-exporting when an invoice has already been voided to prevent duplicates.

## Does This Error Affect Bill Exports?

No. This error applies specifically to invoice exports that were previously voided in Xero.
