---
title: INT771 Export Error: Reporting Period Batches Are Closed in Sage Intacct
description: Learn why the INT771 export error occurs and how to update export date settings or permissions when the reporting period is closed.
keywords: INT771, reporting period closed Sage Intacct, batches closed export error, change export date workspace, xml_gateway open closed books permissions
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT771 export error related to closed reporting periods and export date configuration. Does not cover tax or employee validation errors.
---

# INT771 Export Error: Reporting Period Batches Are Closed in Sage Intacct

If you see the error message:

**“INT771 Export Error: Export not completed. The batches for this reporting period are closed in Sage Intacct. Reopen the period or change the export date in workspace configurations.”**

It means the reporting period associated with the export is closed in Sage Intacct.

Sage Intacct does not allow transactions to post to closed reporting periods.

---

## Why the INT771 Export Error Happens

The INT771 export error occurs when:

- The export date falls within a closed reporting period in Sage Intacct, and  
- Sage Intacct prevents new transactions from being created in that period  

This commonly happens when the export date is based on the submitted date or the date of the last expense, and that accounting period has already been closed.

---

# How to Fix the INT771 Export Error

You can resolve this by confirming permissions or updating the export date configuration.

---

## Step 1: Confirm xml_gateway User Permissions

1. Log in to Sage Intacct.  
2. Confirm that the **xml_gateway** user has permissions for:
   - Open books  
   - Closed books  

If these permissions are not enabled, update them and save your changes.

---

## Step 2: Change the Export Date Configuration

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. In the **Date** field, change the selection:
   - From **Submitted date** or **Date of last expense**  
   - To **Exported date**  
3. Save your changes.  

This ensures exports post to the current open reporting period instead of a closed one.

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the export date now falls within an open reporting period, the export should complete successfully.

---

# FAQ

## Do I need to reopen the reporting period?

Not necessarily. Changing the export date to **Exported date** is often the simplest solution.

## Does this error mean the integration is disconnected?

No. The integration is functioning, but Sage Intacct is preventing transactions from posting to a closed period.

## What does the xml_gateway user do?

The xml_gateway user is the integration user that allows Expensify to communicate with Sage Intacct and post transactions.
