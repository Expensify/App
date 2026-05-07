---
title: XERO76 Export Error in Xero Integration
description: Learn what the XERO76 export error means and how to handle reports that were previously voided in Xero.
keywords: XERO76, Xero voided bill cannot be updated, report voided in Xero, re-export voided bill Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO76 export error caused by previously voided bills in Xero. Does not cover category or authentication issues.
---

# XERO76 Export Error in Xero Integration

If you see the error:

XERO76 Export Error: This report was previously exported and then voided in Xero. Voided bills can’t be updated or re-exported.

This means the report was exported to Xero and later marked as **Voided**.

Xero does not allow voided bills to be reopened, edited, or re-exported.

---

## Why the XERO76 Export Error Happens in Xero

The XERO76 error typically indicates:

- A report was successfully exported from the Workspace to Xero.
- The bill was marked as **Voided** in Xero.
- A re-export or update of that same report was attempted.

Once voided, the bill is permanently locked in Xero and cannot be modified.

This is a bill status limitation in Xero, not a category or authentication issue.

---

## How to Fix the XERO76 Export Error

Xero does not allow voided bills to be restored. You have two options depending on the report status in the Workspace.

---

## Recreate the Report in the Workspace

If the report status in the Workspace is:

- **Approved**
- **Done**
- **Paid** (not reimbursed via ACH)

You can create a new report.

1. Open the report.
2. Click **Unapprove** or **Retract**.
3. Move the expenses to a new report.
4. Submit the new report.
5. Export the new report to Xero.

Important: If the report is listed as **Paid: Confirmed**, it cannot be reopened. In that case, follow the next option.

---

## Manually Recreate the Bill in Xero

If the report cannot be reopened in the Workspace:

- Recreate the bill directly in Xero.
- Enter the required details manually.

Because the original bill was voided, it cannot be replaced via re-export.

---

# FAQ

## Can a Voided Bill Be Unvoided in Xero?

No. Xero permanently locks voided bills and does not allow them to be restored.

## Will Creating a New Report Cause Duplicates?

No. Since the original bill was voided, creating and exporting a new report will generate a new bill in Xero.

## Does This Error Affect All Reports?

No. This error only applies to reports that were previously exported and then voided in Xero.
