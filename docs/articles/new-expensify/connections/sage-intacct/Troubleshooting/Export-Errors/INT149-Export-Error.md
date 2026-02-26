---
title: INT149 Export Error: Employee Record Couldn’t Be Found in Sage Intacct
description: Learn why the INT149 export error occurs and how to resolve missing or duplicate employee records before retrying the export.
keywords: INT149, employee record not found Sage Intacct, duplicate employee email error, employee email mismatch, Sage Intacct employee sync error
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT149 export error related to missing or duplicate employee records based on email address. Does not cover vendor record or approval configuration errors.
---

# INT149 Export Error: Employee Record Couldn’t Be Found in Sage Intacct

If you see the error message:

**“INT149 Export Error: The employee record couldn’t be found in Sage Intacct. Ensure the employee record exists, the email matches Expensify exactly, and there are no duplicate employee records using the same email.”**

It means Sage Intacct cannot match the report creator or submitter to a single employee record.

The employee must exist in Sage Intacct, and the email must match exactly.

---

## Why the INT149 Export Error Happens

The INT149 export error occurs when:

- The report creator’s email in Expensify does not exist on any employee record in Sage Intacct, or  
- The same email address is assigned to multiple employee records in Sage Intacct  

Sage Intacct must be able to uniquely match the email address to one employee profile. If it cannot, the export fails.

---

# How to Fix the INT149 Export Error

Follow the steps below to correct the employee record and retry the export.

---

## Step 1: Confirm the Employee Record in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate the employee record for the report creator or submitter.  
3. Confirm that the email address:
   - Matches the email used in Expensify exactly  
   - Is assigned to only one employee record  

---

## Step 2: Update the Employee Email if Needed

If an employee record exists but does not list the correct email:

1. Add the correct email address to the employee profile.  
2. Save your changes.  

If multiple employee records are tied to the same email address:

1. Remove the email address from all but one employee record.  
2. Save your changes.  

Each email address must be associated with only one employee profile.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 4: Retry the Export

Return to the report and retry the export.

If the employee record exists and the email matches exactly with no duplicates, the export should complete successfully.

---

# FAQ

## Does the email need to match capitalization exactly?

Yes. The email must match exactly, including spelling and capitalization.

## Can multiple employees share the same email?

No. Each employee record must have a unique email address.

## Do I need to reconnect the integration?

No. Updating the employee record and running **Sync Now** is typically sufficient.
