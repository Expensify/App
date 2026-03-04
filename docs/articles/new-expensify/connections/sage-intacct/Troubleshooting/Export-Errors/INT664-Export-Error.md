---
title: INT664 Export Error in Sage Intacct Integration
description: Learn what the INT664 export error means and how to ensure the vendor record email exactly matches the report submitter’s email before retrying the export.
keywords: INT664, Sage Intacct vendor record not found, vendor email mismatch Intacct, submitter vendor export error, Sage Intacct vendor email capitalization, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT664 export error caused by missing or mismatched vendor records. Does not cover employee record, approval workflow, or category configuration errors.
---

# INT664 Export Error in Sage Intacct Integration

If you see the error:

INT664 Export Error: Sage Intacct couldn’t find a vendor record for the report submitter. Verify a vendor record exists and the vendor email exactly matches the submitter’s Expensify email exactly, including capitalization.

This means Sage Intacct cannot match the report submitter’s email address to a vendor record.

Sage Intacct requires a vendor record with an email address that exactly matches the submitter’s email, including capitalization.

---

## Why the INT664 Export Error Happens in Sage Intacct

The INT664 error typically occurs when:

- A vendor record does not exist in Sage Intacct for the report submitter.
- The vendor email address does not exactly match the submitter’s email.
- The capitalization of the email address does not match exactly.

If Sage Intacct cannot find a vendor record with an exact email match, the export fails.

This is a vendor record matching issue, not an integration or approval issue.

---

# How to Fix the INT664 Export Error

Follow the steps below to correct the vendor record and retry the export.

---

## Verify the Vendor Record Email in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the vendor record associated with the report creator or submitter.
3. Confirm that:
   - A vendor record exists.
   - The email address matches the submitter’s email exactly.
   - The capitalization of the email address matches exactly.
4. Update the email address if necessary.
5. Click **Save**.

If no vendor record exists, create one using the submitter’s exact email address.

---

## Sync the Workspace

After updating the vendor record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes vendor data from Sage Intacct.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the vendor record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Capitalization Exactly?

Yes. The email address must match exactly, including capitalization, for Sage Intacct to recognize the vendor record.

## Can I Use a Different Email on the Vendor Record?

No. The vendor email must match the report submitter’s email for the export to succeed.

## Do I Need to Reconnect the Integration?

No. Updating the vendor record and running **Sync Now** is typically sufficient to resolve the error.
