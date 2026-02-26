---
title: INT664 Export Error: Vendor Record Couldn’t Be Found for the Report Submitter
description: Learn why the INT664 export error occurs and how to ensure the vendor record email exactly matches the submitter’s email before retrying the export.
keywords: INT664, vendor record not found Sage Intacct, vendor email mismatch, submitter vendor export error, Sage Intacct vendor email capitalization
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT664 export error related to missing or mismatched vendor records. Does not cover employee record or approval configuration errors.
---

# INT664 Export Error: Vendor Record Couldn’t Be Found for the Report Submitter

If you see the error message:

**“INT664 Export Error: Sage Intacct couldn’t find a vendor record for the report submitter. Verify a vendor record exists and the vendor email exactly matches the submitter’s Expensify email exactly, including capitalization.”**

It means Sage Intacct cannot match the report submitter’s email address to a vendor record.

Sage Intacct requires a vendor record with an email address that exactly matches the submitter’s email.

---

## Why the INT664 Export Error Happens

The INT664 export error occurs when:

- A vendor record does not exist in Sage Intacct for the report submitter, or  
- The vendor email address does not exactly match the submitter’s email, including capitalization  

If Sage Intacct cannot find a matching vendor record, the export fails.

---

# How to Fix the INT664 Export Error

Follow the steps below to correct the vendor record and retry the export.

---

## Step 1: Verify the Vendor Record in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate the vendor record associated with the report creator or submitter.  
3. Confirm that:
   - A vendor record exists  
   - The email address matches the submitter’s email exactly  
   - The email address matches capitalization exactly  

If the email address is missing:

1. Add the correct email address to the vendor record.  
2. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the vendor record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the email have to match capitalization exactly?

Yes. The email address must match exactly, including capitalization.

## Can I use a different email on the vendor record?

No. The vendor email must match the report submitter’s email for the export to succeed.

## Do I need to reconnect the integration?

No. Updating the vendor record and running **Sync Now** is typically sufficient.
