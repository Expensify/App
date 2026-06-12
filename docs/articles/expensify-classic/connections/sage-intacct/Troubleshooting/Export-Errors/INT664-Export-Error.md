---
title: INT664 Export Error in Sage Intacct Integration
description: Learn what the INT664 export error means and how to ensure the vendor record email exactly matches the report submitter’s email before exporting.
keywords: INT664, Sage Intacct vendor not found, vendor record email mismatch, submitter vendor export error, Sage Intacct vendor email capitalization, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT664 export error caused by missing or mismatched vendor records. Does not cover employee record or project configuration errors.
---

# INT664 Export Error in Sage Intacct Integration

If you see the error:

INT664 Export Error: Sage Intacct couldn’t find a vendor record for the report submitter. Verify a vendor record exists and the vendor email exactly matches the submitter’s Expensify email exactly, including capitalization.

This means Sage Intacct cannot match the report submitter’s email address to a vendor record.

Sage Intacct requires a vendor record with an email address that exactly matches the submitter’s email in Expensify.

---

## Why the INT664 Export Error Happens in Sage Intacct

The INT664 error typically indicates:

- A vendor record does not exist in Sage Intacct for the report submitter.
- The vendor email address does not exactly match the submitter’s email in Expensify.
- The email differs in spelling or capitalization.

The email must match exactly, including spelling and capitalization.

If Sage Intacct cannot find a matching vendor record, the export fails.

This is a vendor record configuration issue, not an employee record or project configuration error.

---

## How to Fix the INT664 Export Error

Follow the steps below to correct the vendor record and retry the export.

### Verify the Vendor Record in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the vendor record associated with the report creator or submitter.
3. Confirm that:
   - A vendor record exists.
   - The email address matches the submitter’s email in Expensify exactly.
   - The email address matches capitalization exactly.
4. If the email address is missing or incorrect:
   - Update the vendor record with the correct email address.
   - Click **Save**.

### Sync the Workspace in Expensify

After updating the vendor record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the vendor record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Capitalization Exactly?

Yes. The email address in Sage Intacct must match the submitter’s email in Expensify exactly, including capitalization.

## Can I Use a Different Email on the Vendor Record?

No. The email must match the report submitter’s Expensify email for the export to succeed.

## Do I Need to Reconnect the Integration?

No. Updating the vendor record and selecting **Sync Now** is typically sufficient.
