---
title: ONL583 Export Error in QuickBooks Online
description: Learn how to fix the ONL583 export error in QuickBooks Online when a vendor already exists but cannot be matched to the report submitter.
keywords: ONL583, QuickBooks Online vendor already exists, vendor could not be matched, submitter email mismatch, duplicate vendor record, Automatically create employees vendors, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL583 export error caused by vendor email mismatches or duplicate records. Does not cover other export error codes.
---

# ONL583 Export Error in QuickBooks Online

If you see the error:

ONL583: A vendor with this name already exists in QuickBooks Online, but couldn’t be matched. Please confirm the existing vendor record uses the same email as the submitter.

This means QuickBooks Online already has a vendor with the same name, but Expensify cannot match it to the report submitter based on email address.

---

## Why the ONL583 Export Error Happens in QuickBooks Online

The ONL583 error occurs when:

- Expensify attempts to create a vendor for the report submitter.
- A vendor with the same name already exists in QuickBooks Online.
- The existing vendor record does not have the same email address as the submitter in Expensify.
- The submitter’s email address is associated with multiple records (for example, both an employee and a vendor).

Expensify matches vendors using email addresses. If the email does not match exactly, the export will fail.

---

## How to Confirm the Vendor Email in QuickBooks Online

1. Log in to QuickBooks Online.
2. Go to **Expenses**.
3. Select **Vendors**.
4. Search for the vendor with the same name as the report submitter.
5. Open the vendor record.
6. Confirm the **Email** field exactly matches the submitter’s email address in Expensify.
7. Update the email if needed and click **Save**.

After updating the email, retry exporting the report.

---

## How to Check for Duplicate Records in QuickBooks Online

If the export still fails:

1. Use the global search bar in QuickBooks Online.
2. Search for the report submitter’s email address.
3. Review all associated records (vendor, employee, etc.).
4. Identify any duplicate records using the same email.
5. Remove or deactivate duplicate records as appropriate.
6. Save your changes.

Retry exporting the report after cleaning up duplicate records.

---

## How to Disable Automatically Create Employees/Vendors in Expensify

If you prefer to manage vendors manually:

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Turn off **Automatically create employees/vendors**.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Turn off **Automatically create employees/vendors**.
6. Tap **Save**.

After disabling automatic creation, retry exporting the report.

---

# FAQ

## Does the Vendor Email Have to Match Exactly?

Yes. The vendor email in QuickBooks Online must exactly match the submitter’s email address in Expensify for the export to work.

## Can Duplicate Vendor or Employee Records Cause This Error?

Yes. If multiple records share the same email address, QuickBooks Online may not correctly match the vendor during export, resulting in the ONL583 error.
