---
title: Certinia Troubleshooting
description: Troubleshoot common Certinia sync and export errors. 
---
# Overview of Certinia Troubleshooting
Occasionally, users may encounter errors that prevent reports from exporting or the connection from syncing successfully. These errors often arise from discrepancies in settings, missing data, or configuration issues within Certinia or Expensify. 

This troubleshooting guide aims to help you identify and resolve common sync and export errors, ensuring a seamless connection between your financial management systems. 

By following the step-by-step solutions provided for each specific error, you can quickly address issues and maintain accurate and efficient expense reporting and data management.

# ExpensiError FF0047: You must have an Ops Edit permission to edit approved records.
This error indicates that the permission control setup between the connected user and the report submitter or region is missing Ops Edit permission.

In Certinia go to Permission Controls and click the one you need to edit. Make sure that Expense Ops Edit is selected under Permissions.

# ExpensiError FF0061: Object validation has failed. The credit terms…
To resolve the error "Object validation has failed. The credit terms for the selected account on this document are not correctly defined," follow these steps:

1. Identify the account used for the report being exported. This could be the account on the project for PSA/SRP or the account linked to the resource for FFA.
2. In Certinia, under this account:
   - Ensure that Base Date 1 is configured to invoice.
   - Set Days Offset to 1 or more.
   - Verify that a currency is selected for the account.

By following these guidelines, you can correct the issue and ensure proper validation of the credit terms for the selected account.

# ExpensiError FF0074: You do not have permissions for this resource
This error message indicates a requirement to establish permission controls for the report creator/submitter within Certinia.

To set this up:
1. Navigate to Permission Controls in Certinia.
2. Select "New" to create a new permission control.
3. Enter the User and Resource Fields.
4. Ensure all necessary permission fields are checked or configured appropriately.

By completing these steps, you can effectively manage and grant the required permissions to the report creator/submitter in Certinia.

# ExpensiError FF0076: Could not find employee in Certinia
Go to Contacts in Certinia and add the report creator/submitter's Expensify email address to their employee record, or create a record with that email listed.

If a record already exists then search for their email address to confirm it is not associated with multiple records.

# ExpensiError FF0089: Expense Reports for this Project require an Assignment
This error indicates that the project needs to have the permissions adjusted in Certinia

Go to Projects > [project name] > Project Attributes and check Allow Expense Without Assignment. 

# ExpensiError FF0091: Bad Field Name — [field] is invalid for [object]
This means the field in question is not accessible to the user profile in Certinia for the user whose credentials were used to make the connection within Expensify. 

To correct this:
* Go to Setup > Build > expand Create > Object within Certinia
* Then go to Payable Invoice > Custom Fields and Relationships
* Click View Field Accessibility 
* Find the employee profile in the list and select Hidden
* Make sure both checkboxes for Visible are selected

Once this step has been completed, sync the connection within Expensify by going to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** > **Sync Now** and then attempt to export the report again. 

# ExpensiError FF0132: Insufficient access. Make sure you are connecting to Certinia with a user that has the 'Modify All Data' permission

Log into Certinia, go to Setup > Manage Users > Users and find the user whose credentials made the connection. 

* Click on their profile on the far right side of the page
* Go to System > System Permissions
* Enable Modify All Data and save

Sync the connection within Expensify by going to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** > **Sync Now** and then attempt to export the report again

# Error: Certinia PSA: Duplicate Value on Record
When exporting multiple projects from Expensify to Certinia, each project generates its own Expense Report in Certinia. If any project fails during the initial export, all subsequent projects will also fail. In such cases, if you attempt to export again, an error may indicate that some projects were already successfully exported, potentially causing duplicates.

To resolve this issue, delete any existing expense reports associated with the Expensify report ID in Certinia.

Then, sync the connection within Expensify by going to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** > **Sync Now** and then attempt to export the report again

Following these steps ensures that any duplicate entries are cleared and that the export process can proceed without errors.
