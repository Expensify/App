---
title: CER076 Export Error: Employee Not Found in Certinia
description: Learn why CER076 appears when exporting to Certinia and how to add the report creator or submitter’s Expensify email address to their employee record.
keywords: CER076, Certinia error CER076, employee not found in Certinia, add employee email Certinia, Expensify email mismatch, Certinia export error, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER076 employee record mismatch error and re-syncing the Workspace. Does not cover unrelated Certinia employee configuration or HR record management.
---

# CER076 Export Error: Employee Not Found in Certinia

If you see the error:

**“CER076 Export Error: Employee not found in Certinia. Please add the report creator or submitter’s Expensify email address to their employee record in Certinia.”**

this means the report creator or submitter’s Expensify email address is not associated with an employee record in Certinia.

Until the email address is correctly linked, Certinia cannot match the report to an employee and will block the export.

---

## Why CER076 Happens

Certinia requires the report creator or submitter’s email address to match an existing employee record.

If the Expensify email address is:

- Not added to the employee record, or  
- Linked to multiple employee records  

Certinia cannot validate the user and returns error **CER076**.

This is a Certinia employee record configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER076

You must have access to manage employee records in Certinia (typically a Certinia Admin) to resolve this error.

---

## How to Add the Expensify Email Address to an Employee Record in Certinia

1. Log in to Certinia.
2. Go to **Contacts**.
3. Locate the employee record for the report creator or submitter.
4. Add the user’s **Expensify email address** to their employee record.
5. Save your changes.

If a record already exists:

- Search for the email address to confirm it is not linked to multiple employee records.
- Ensure the email is associated with only one employee record.

Properly linking the email address allows Certinia to match the report to the correct employee during export.

---

## How to Sync Certinia After Updating the Employee Record

After updating the employee record, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER076

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that the email address in Certinia exactly matches the email address used in Expensify.

---

# FAQ

## Does CER076 mean the employee does not exist in Certinia?

Not necessarily. It means Certinia cannot find a matching employee record based on the Expensify email address.

---

## Is CER076 caused by Expensify settings?

No. CER076 is triggered by a missing or mismatched employee email record in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, adding or correcting the employee email and selecting **Sync Now** resolves the issue.
