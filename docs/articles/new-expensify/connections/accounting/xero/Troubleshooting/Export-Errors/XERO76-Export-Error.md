---
title: XERO76 Export Error in Xero Integration
description: Learn what the XERO76 export error means and how to handle reports that were previously voided in Xero before re-exporting from New Expensify.
keywords: XERO76, Xero voided bill cannot be updated, report voided in Xero, re-export voided bill Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO76 export error related to previously voided bills in Xero. Does not cover category, authentication, or organization selection issues.
---

# XERO76 Export Error in Xero Integration

If you see the error:

XERO76 Export Error: This report was previously exported and then voided in Xero. Voided bills can’t be updated or re-exported.

This means the report was exported to Xero and later marked as **Voided**.

Xero does not allow voided bills to be reopened, edited, or re-exported.

---

## Why the XERO76 Export Error Happens in Xero

The XERO76 error typically occurs when:

- A report was successfully exported from the Workspace to Xero.
- The bill was marked as **Voided** in Xero.
- A re-export or update is attempted.

Once voided, the bill is permanently locked in Xero and cannot be modified.

This is a document status restriction in Xero, not a connection issue.

---

# How to Fix the XERO76 Export Error

Because Xero does not allow voided bills to be updated or unvoided, you must recreate the report or manually recreate the bill in Xero.

---

## Recreate the Report in the Workspace

If the report status in the Workspace is:

- **Approved**
- **Done**
- **Paid** (not reimbursed via ACH)

You can recreate it:

1. Open the report.
2. Click **Unapprove** or **Retract**.
3. Move the expenses to a new report.
4. Submit the new report.
5. Retry exporting to Xero.

If the report is listed as **Paid: Confirmed**, it cannot be reopened. In that case, manually recreate the bill in Xero.

---

## Manually Recreate the Bill in Xero

If the report cannot be reopened in the Workspace:

1. Log in to Xero with appropriate permissions.
2. Create a new bill manually.
3. Enter the required details to match the original transaction.
4. Save the bill.

Because the original bill was voided, it cannot be replaced through re-export.

---

# FAQ

## Can a Voided Bill Be Unvoided in Xero?

No. Xero permanently locks voided bills and does not allow them to be restored.

## Will Creating a New Report Cause Duplicates?

No. Since the original bill was voided, creating and exporting a new report will generate a new bill in Xero.
