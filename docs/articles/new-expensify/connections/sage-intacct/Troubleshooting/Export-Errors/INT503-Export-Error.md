---
title: INT503 Export Error: Expense Type Isn’t Enabled in Sage Intacct
description: Learn why the INT503 export error occurs and how to enable Expense Type in Sage Intacct before retrying the export.
keywords: INT503, expense type not enabled Sage Intacct, Time and Expenses configuration error, expense record creation failure, enable expense type Sage Intacct
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT503 export error related to Expense Type configuration in Sage Intacct. Does not cover category mapping or project configuration errors.
---

# INT503 Export Error: Expense Type Isn’t Enabled in Sage Intacct

If you see the error message:

**“INT503 Export Error: Sage Intacct couldn’t create the expense record because ‘Expense Type’ isn’t enabled.”**

It means the **Expense Type** feature is not enabled in Sage Intacct.

Sage Intacct requires Expense Type to be enabled in order to create expense records during export.

---

## Why the INT503 Export Error Happens

The INT503 export error occurs when:

- The Workspace is exporting expense reports to Sage Intacct, and  
- The **Expense Type** setting is disabled in Sage Intacct  

If Expense Type is not enabled, Sage Intacct cannot generate the required expense record, and the export fails.

---

# How to Fix the INT503 Export Error

Follow the steps below to enable Expense Type and retry the export.

---

## Step 1: Enable Expense Type in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Time & Expenses > Setup > Configuration**.  
3. Enable **Expense Type**.  
4. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If Expense Type is enabled, the export should complete successfully.

---

# FAQ

## Do I need Sage Intacct admin permissions to enable Expense Type?

Yes. Updating configuration settings in Sage Intacct typically requires administrative permissions.

## Does this error affect vendor bill exports?

No. This error applies specifically to expense record creation that requires Expense Type to be enabled.

## Do I need to reconnect the integration?

No. Enabling Expense Type and running **Sync Now** is typically sufficient.
