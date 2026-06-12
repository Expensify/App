---
title: ONL583 Export Error in QuickBooks Online Integration
description: Learn what the ONL583 export error means in QuickBooks Online and how to resolve vendor record matching conflicts.
keywords: ONL583, QuickBooks Online export error, vendor already exists QuickBooks, vendor could not be matched QuickBooks, duplicate vendor record QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL583 export error caused by duplicate or mismatched vendor records. Does not cover other QuickBooks Online error codes.
---

# ONL583 Export Error in QuickBooks Online Integration

If you see the error:

ONL583: A vendor with this name already exists but could not be matched.

This means Expensify attempted to create or match a Vendor record for the report submitter, but QuickBooks Online could not confidently match it to an existing vendor, preventing the export from completing.

---

## Why the ONL583 Export Error Happens in QuickBooks Online

The ONL583 error typically indicates:

- A Vendor record already exists in QuickBooks Online.
- The email address on the Vendor record does not exactly match the email address used in Expensify.
- The same email address appears on multiple records (such as both an Employee and a Vendor).
- QuickBooks cannot determine which record to use.

QuickBooks requires a clear one-to-one match between the report submitter and a single Vendor record.

This is a QuickBooks Online vendor matching issue, not a Workspace configuration issue.

---

## How to Fix the ONL583 Export Error

This issue can be resolved by reviewing and correcting Vendor records in QuickBooks Online.

### Confirm the Vendor Email Matches Expensify

1. Log in to QuickBooks Online.
2. Open the Vendor record for the report creator or submitter.
3. Confirm the email address exactly matches the email listed in Expensify.
4. Save any changes.

The email must match exactly for Expensify to link the records correctly.

---

### Check for Duplicate Records

1. Use the QuickBooks Online search function.
2. Search for the report submitter’s email address.
3. Confirm the email is not listed on multiple records (such as both an Employee and Vendor).

If duplicates exist:

- Remove the email from the incorrect record, or  
- Deactivate duplicate records if appropriate.

Only one active Vendor record should contain the matching email.

---

### Disable Automatic Entity Creation (If Needed)

If matching issues continue:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Advanced** tab.
6. Disable **Automatically Create Employees/Vendors**.
7. Click **Save**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After correcting Vendor records and selecting **Sync Now**, retry the export.

## Does ONL583 Mean the Vendor Does Not Exist?

Not necessarily. It usually means the Vendor exists but could not be matched due to email differences or duplicate records.

## Do I Need to Reconnect QuickBooks Online?

No. Correcting Vendor records and retrying the export is typically sufficient.
