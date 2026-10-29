---
title: ONL945 Export Error in QuickBooks Online Integration
description: Learn what the ONL945 export error means in QuickBooks Online and how to resolve vendor record conflicts caused by duplicate or mismatched email associations.
keywords: ONL945, QuickBooks Online export error, vendor not found QuickBooks, supplier not found QuickBooks, duplicate email vendor conflict QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL945 export error caused by duplicate or conflicting vendor email records. Does not cover other QuickBooks Online error codes.
---

# ONL945 Export Error in QuickBooks Online Integration

If you see the error:

ONL945: Vendor or supplier not found.

This means Expensify could not match the report submitter to a valid Vendor record in QuickBooks Online, preventing the export from completing.

---

## Why the ONL945 Export Error Happens in QuickBooks Online

The ONL945 error typically indicates:

- The vendor email used in Expensify is already associated with another record in QuickBooks Online.
- Multiple records (such as an Employee and a Vendor) share the same email address.
- QuickBooks cannot determine which record to use for the export.

QuickBooks requires a clear one-to-one match between the report submitter and a single Vendor record.

This is a QuickBooks Online vendor record conflict, not a Workspace configuration issue.

---

## How to Fix the ONL945 Export Error

This issue can be resolved by reviewing and correcting Vendor records in QuickBooks Online.

### Search for the Submitter’s Email

1. Log in to QuickBooks Online.
2. Use the global search function.
3. Search for the report submitter’s email address.
4. Review all matching records.

### Remove or Correct Duplicate Records

If multiple records are associated with the same email:

- Remove the email address from duplicate or incorrect records, or  
- Deactivate duplicate records as appropriate.

Only one active Vendor record should contain the email address used in Expensify.

After correcting records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After correcting duplicate records and selecting **Sync Now**, retry the export.

## Does ONL945 Mean the Vendor Does Not Exist?

Not necessarily. It usually means there is a conflict due to duplicate or mismatched email associations.

## Do I Need to Reconnect QuickBooks Online?

No. Correcting duplicate records and running **Sync Now** is typically sufficient.
