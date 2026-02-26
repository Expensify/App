---
title: INT054 Export Error: Matching Employee Couldn’t Be Found in Sage Intacct
description: Learn why the INT054 export error occurs and how to ensure the employee record and email match before retrying the export.
keywords: INT054, employee not found Sage Intacct, employee email mismatch, duplicate employee profile error, Sage Intacct Time and Expenses employee
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT054 export error related to missing or duplicate employee records. Does not cover vendor record or approval configuration errors.
---

# INT054 Export Error: Matching Employee Couldn’t Be Found in Sage Intacct

If you see the error message:

**“INT054 Export Error: Expensify couldn’t find a matching employee for [X] in Sage Intacct. Ensure the employee exists and the email matches Expensify.”**

It means Sage Intacct cannot match the report creator or submitter to a valid employee record.

The employee must exist in Sage Intacct, and the email must match exactly.

---

## Why the INT054 Export Error Happens

The INT054 export error occurs when:

- The employee record does not exist in Sage Intacct, or  
- The employee’s email address does not match the email used in Expensify, or  
- Multiple employee profiles exist with the same email address  

If Sage Intacct cannot uniquely match the email to a single employee profile, the export fails.

---

# How to Fix the INT054 Export Error

Follow the steps below to verify the employee record and retry the export.

---

## Step 1: Confirm the Employee Record in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Time & Expenses > Employee**.  
3. Locate the employee profile for the report creator or submitter.  
4. Confirm that:
   - The employee profile exists  
   - The email address matches the email used in Expensify exactly  

If the employee does not exist, create a new employee record with the correct email address and save.

---

## Step 2: Remove Duplicate Employee Profiles

If multiple employee profiles have the same email address:

1. Remove the duplicate email from all but one profile, or  
2. Deactivate or delete duplicate employee records if appropriate.  

Each employee email must be unique.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 4: Retry the Export

Return to the report and retry the export.

If the employee record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the email need to match capitalization?

Yes. The email address must match exactly, including spelling and capitalization.

## Can multiple employees share the same email?

No. Each employee record must have a unique email address for exports to work correctly.

## Do I need to reconnect the integration?

No. Updating the employee record and running **Sync Now** is typically sufficient.
