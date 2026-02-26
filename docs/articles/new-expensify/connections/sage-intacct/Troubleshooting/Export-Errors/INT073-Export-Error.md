---
title: INT073 Export Error: Required Tag Missing for Account in Sage Intacct
description: Learn why the INT073 export error occurs and how to configure required account fields or tags before retrying the export.
keywords: INT073, required tag Sage Intacct account, account requires dimension error, Chart of Accounts required field, configure tag line item level, sync coding settings
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT073 export error related to required account fields and tag configuration. Does not cover employee or tax configuration errors.
---

# INT073 Export Error: Required Tag Missing for Account in Sage Intacct

If you see the error message:

**“INT073 Export Error: Sage Intacct requires a tag for account [XXXX], preventing the expense from being created. Either remove the required field from the account in Sage Intacct or configure the field as a tag in Expensify configurations.”**

It means the referenced account in Sage Intacct requires a specific dimension or field, but that value was not provided on the expense.

Sage Intacct blocks the transaction if a required account-level field is missing.

---

## Why the INT073 Export Error Happens

The INT073 export error occurs when:

- A specific field or dimension is required on the account in Sage Intacct, and  
- That required value is not included on the expense during export  

This is controlled within the **Chart of Accounts** settings in Sage Intacct.

---

# How to Fix the INT073 Export Error

You can resolve this in one of two ways.

---

## Option 1: Disable the Required Field in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to the **Chart of Accounts**.  
3. Locate the account referenced in the error message ([XXXX]).  
4. Open the account record.  
5. Review the section where specific fields or dimensions are marked as required.  
6. Disable the required field if it is not needed.  
7. Save your changes.  

---

## Option 2: Configure the Field as a Tag in the Workspace

If the field should remain required:

1. Go to **Workspace > [Workspace Name] > Accounting > Coding**.  
2. Locate the corresponding dimension or field.  
3. Enable the field for import if it is not already enabled.  
4. Configure it to import as a **Tag (line-item level)** if required.  
5. Save your changes.  

Then:

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the required field is either disabled in Sage Intacct or properly configured as a tag, the export should complete successfully.

---

# FAQ

## What is a required account field?

A required account field is a dimension or value that must be included whenever that account is used in a transaction.

## Should I disable the required field or configure it as a tag?

If your accounting process requires that dimension, configure it as a tag. If it is no longer needed, you can disable the requirement in Sage Intacct.

## Do I need to run Sync after updating settings?

Yes. Running **Sync Now** ensures the latest configuration is applied before retrying the export.
