---
title: DESK88 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK88 export error means and how to ensure the report submitter is set up as a vendor when exporting Journal Entries to Accounts Payable.
keywords: DESK88, QuickBooks Desktop journal entry vendor required, Accounts Payable journal entry error, vendor email QuickBooks Desktop, split lines journal entry error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK88 export error related to vendor record requirements when exporting split lines to Accounts Payable. Does not cover connection or category configuration errors.
---

# DESK88 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK88 Export Error: Split lines exported as a Journal Entry to Accounts Payable must be linked to a “vendor”, not an employee. Please ensure the vendor record includes the report creator’s email address.

This means the report submitter is not properly set up as a vendor in QuickBooks Desktop when exporting split lines as a **Journal Entry** to an **Accounts Payable** account.

QuickBooks requires Journal Entries posted to Accounts Payable to be linked to a vendor record.

---

## Why the DESK88 Export Error Happens in QuickBooks Desktop

The DESK88 error typically occurs when:

- Split lines are exported as a **Journal Entry** to an **Accounts Payable** account.
- The report submitter’s email is associated with an **employee** record instead of a vendor.
- No vendor record exists with the submitter’s email address.
- The vendor record exists but does not include the submitter’s email in the **Email** field.

When exporting to Accounts Payable, QuickBooks requires the transaction to be tied to a vendor, not an employee.

This is a vendor record configuration issue, not a connection issue.

---

# How to Fix the DESK88 Export Error

Follow the steps below to confirm or create the correct vendor record.

---

## Search for the Report Submitter’s Email in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Use the **global search** function.
3. Search for the report submitter’s email address.

Review the results carefully.

---

## Remove Email From Employee Record (If Applicable)

If the email is associated with an **employee** record:

1. Open the employee record.
2. Remove the email address from the record.
3. Click **Save**.

QuickBooks cannot use an employee record for Journal Entries to Accounts Payable.

---

## Confirm or Create a Vendor Record

If a vendor record already exists:

1. Open the vendor record.
2. Add the report submitter’s email address to the **Email** field.
3. Click **Save**.

If a vendor record does not exist:

1. Create a new vendor.
2. Enter the report submitter’s email address in the **Email** field.
3. Click **Save**.

The email must match the submitter’s email in the Workspace.

---

## Run Sync in the Workspace

After updating QuickBooks:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the vendor record is correctly configured, the export should complete successfully.

---

# FAQ

## Can the Report Submitter Be Both an Employee and a Vendor?

No. When exporting split lines as Journal Entries to Accounts Payable, QuickBooks requires the submitter to be set up as a vendor.

## Does the Email Have to Match Exactly?

Yes. The email in the vendor record must match the report submitter’s email in the Workspace.

## Do I Need to Reconnect the Integration?

No. Updating the vendor record and running **Sync now** is typically sufficient.
