---
title: INT205 Export Error: Selected Project Isn’t Associated With the Selected Customer
description: Learn why the INT205 export error occurs and how to ensure projects are properly linked to customers in Sage Intacct before retrying the export.
keywords: INT205, project not associated with customer, Sage Intacct project customer mismatch, project tag export error, project customer configuration Sage Intacct
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT205 export error related to project and customer associations. Does not cover employee, tax, or billable configuration errors.
---

# INT205 Export Error: Selected Project Isn’t Associated With the Selected Customer

If you see the error message:

**“INT205 Export Error: The selected project isn’t associated with the selected customer. Please verify the project tag on all expenses and retry the export.”**

It means the project selected on one or more expenses is not linked to the selected customer in Sage Intacct.

Sage Intacct requires projects to be associated with a customer when exporting customer-related or billable expenses.

---

## Why the INT205 Export Error Happens

The INT205 export error occurs when:

- A project is selected on an expense, and  
- That project is not associated with the corresponding customer in Sage Intacct  

If the project–customer relationship is not configured correctly in Sage Intacct, the export fails.

---

# How to Fix the INT205 Export Error

Follow the steps below to correct the project configuration and retry the export.

---

## Step 1: Confirm Projects Are Active and Linked to Customers in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate the project referenced in the error message.  
3. Confirm that:
   - The project is active  
   - The project is linked to the correct customer  

If the project is not associated with a customer, update the project record to link it to the appropriate customer and save your changes.

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

This refreshes project and customer data.

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the project is active and properly associated with a customer, the export should complete successfully.

---

# FAQ

## Does the project have to be active?

Yes. The project must be active in Sage Intacct for the export to succeed.

## Can I fix this by changing the project on the expense?

Yes. If the selected project is incorrect, update the expense to use a project that is properly associated with the correct customer.

## Does this error affect non-project expenses?

No. This error only occurs when a project tag is selected and that project is not correctly linked to a customer in Sage Intacct.
