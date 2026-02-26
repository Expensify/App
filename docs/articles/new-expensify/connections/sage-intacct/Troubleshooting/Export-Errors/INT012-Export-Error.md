---
title: INT012 Export Error: Reason for Expense Field Is Required in Sage Intacct
description: Learn why the INT012 export error occurs and how to update Sage Intacct settings when the Reason for Expense field is required.
keywords: INT012, Sage Intacct reason for expense required, expense report requirements error, Time and Expenses configuration, Sage Intacct export failure
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT012 export error related to the Reason for Expense requirement in Sage Intacct. Does not cover approval or journal configuration errors.
---

# INT012 Export Error: Reason for Expense Field Is Required in Sage Intacct

If you see the error message:

**“INT012 Export Error: Sage Intacct requires a 'Reason for Expense' note. Please update your Intacct settings to continue.”**

It means Sage Intacct is configured to require a **Reason for Expense** note, but one was not provided on the report.

---

## Why the INT012 Export Error Happens

The INT012 export error occurs when:

- The **Reason for Expense** field is required in Sage Intacct, and  
- The report being exported does not include a value for that field  

If the field is required but not populated, Sage Intacct blocks the export.

---

# How to Fix the INT012 Export Error

You can resolve this by updating the requirement setting in Sage Intacct.

---

## Step 1: Disable the Reason for Expense Requirement

1. Log in to Sage Intacct.  
2. Go to **Time & Expenses > Configure Time & Expenses > Expense Report Requirements**.  
3. Uncheck the **Reason for Expense** field requirement.  
4. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the Reason for Expense requirement is disabled, the export should complete successfully.

---

# FAQ

## Can I keep the Reason for Expense field required?

Yes. If you prefer to keep it required, ensure that each expense report includes a Reason for Expense before exporting.

## Does this error affect vendor bill exports?

No. This error applies specifically to expense report exports using the Time & Expenses module.

## Do I need Sage Intacct admin permissions to change this setting?

Yes. Updating expense report requirements typically requires administrative access in Sage Intacct.
