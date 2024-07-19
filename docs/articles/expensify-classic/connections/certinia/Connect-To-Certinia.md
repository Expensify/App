---
title: Certinia
description: Guide to connecting Expensify and Certinia FFA and PSA/SRP (formerly known as FinancialForce)
order: 1
---
# Overview
[Cetinia](https://use.expensify.com/financialforce) (formerly known as FinancialForce) is a cloud-based software solution that provides a range of financial management and accounting applications built on the Salesforce platform. There are two versions: PSA/SRP and FFA and we support both. 

# Before connecting to Certinia
Install the Expensify bundle in Certinia using the relevant installer:
* [PSA/SRP](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BHD%252Fpackaging%252FinstallPackage.apexp%253Fp0%253D04t2M000002J0BH)
* [FFA](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVj)

## Check contact details in Certinia 
First, make sure you have a user and contact in Certinia that match your main email in Expensify. Then, create contacts for all employees who will be sending expense reports. Ensure that each contact's email matches the one they use in their Expensify account.

## If you use PSA/SRP
Each report approver needs both a User and a Contact. The user does not need to have a SalesForce license. These can be free chatter users.
Set permission controls in Certinia for your user for each contact/resource. 
* Go to Permission Controls
  - Create a new permission control
  - Set yourself (exporter) as the user 
  - Select the resource (report submitter)
  - Grant all available permissions
* Set permissions on any project you are exporting to
  - Go to **Projects** > _select a project_ > **Project Attributes** > **Allow Expenses Without Assignment**
  - Select the project > **Edit**
  - Under the Project Attributes section, check **Allow Expenses Without Assignment**
* Set up Expense Types (categories in Expensify - _SRP only_)
  - Go to **Main Menu** > _+ symbol_ > **Expense Type GLA Mappings**
  - Click **New** to add new mappings

# How to connect to Certinia
1. Go to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** in Expensify
2. Click **Create a New Certinia (FinancialForce) Connection**
3. Log into your Certinia account
4. Expensify and Certinia will begin to sync (in Expensify)

# How to configure export settings for Certinia
## Preferred Exporter
The preferred exporter is the user who will be the main exporter of reports. This person will receive the notifications for errors.

## Payable Invoice Status and Date
Reports can be exported as Complete or In Progress, using date of last expense, submitted date or exported date.

## Reimbursable and non-reimbursable exports
Both reimbursable and non-reimbursable reports are exported as payable invoices (FFA) or expense reports (PSA/SRP). If you have both Reimbursable and Non-Reimbursable expenses on a single report, we will create a separate payable invoice/expense report for each type. 

## Default Vendor (FFA)
Choose from the full list of vendors from your Certinia FFA account, this will be applied to the non-reimbursable payable invoices.

# How to Configure coding for Certinia
## Company
Select which FinancialForce company to import from/export to.

## Chart of Accounts (FFA)
Prepaid Expense Type and Profit & Loss accounts are imported to be used as categories on each expense. 

## Expense Type GLA Mappings (PSA/SRP)
Your Expense Type GLA Mappings are enabled in Expensify to use as categories on each expense when using both PSA and SRP; however, PSA will not import or export categories, while SRP will.

## Dimensions (FFA)
We import four dimension levels and each has three options to select from:

* Do not map: FinancialForce defaults will apply to the payable invoice, without importing into Expensify
* Tags: These are shown in the Tag section of your workspace, and employees can select them on each expense created
* Report fields: These will show in the Reports section of your workspace. Employees can select one to be applied at the header level i.e. the entire report. 

## Projects, Assignments, or Projects & Assignments (PSA/SRP)
These can be imported as tags with **Milestones** being optional. When selecting to import only projects, we will derive the account from the project. If an assignment is selected, we will derive both the account and project from the assignment. 

Note: If you are using a project that does not have an assignment, the box **Allow Expenses Without Assignment** must be checked on the project in FinancialForce.

## Tax
Import tax rates from Certinia to apply to expenses.

# How to configure advanced settings for Certinia
## Auto Sync
Auto Sync in Certinia performs daily updates to your coding. Additionally, it automatically exports reports after they receive final approval. For Non-Reimbursable expenses, syncing happens immediately upon final approval of the report. In the case of Reimbursable expenses, syncing occurs as soon as the report is reimbursed or marked as reimbursed.

## Export tax as non-billable
When exporting Billable expenses, this dictates whether you will also bill the tax component to your clients/customers.

# Deep Dive
## Multi-Currency in Certinia PSA/SRP
When exporting to Certinia PSA/SRP you may see up to three different currencies on the expense report in Certinia, if employees are submitting expenses in more than one original currency.
* Summary Total Reimbursement Amount: this currency is derived from the currency of the project selected on the expense.
* Amount field on the Expense line: this currency is derived from the Expensify workspace default report currency.
* Reimbursable Amount on the Expense line: this currency is derived from the currency of the resource with an email matching the report submitter.

{% include faq-begin.md %}
## What happens if the report can’t be exported to Certinia?
* The preferred exporter will receive an email outlining the issue and any specific error messages
* Any error messages preventing the export from taking place will be recorded in the report’s history
* The report will be listed in the exporter’s Expensify Inbox as awaiting export.

## If I enable Auto Sync, what happens to existing approved and reimbursed reports?
You can activate Auto Sync without worry because it relies on Final Approval to trigger auto-export. Existing Approved reports won't be affected. However, for Approved reports that haven't been exported to Certinia, you'll need to either manually export them or mark them as manually entered.

## How do I export tax?
Tax rates are created in Expensify through the tax tracking feature under **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Tax**. We export the tax amount calculated on the expenses. 

## How do reports map to Payable Invoices in Certinia FFA?
* Account Name - Account associated with Expensify submitter’s email address
* Reference 1 - Report URL
* Invoice Description - Report title

## How do reports map to Expense Reports in Certinia PSA/SRP?
* Expense report name - Report title
* Resource - User associated with Expensify submitter’s email address
* Description - Report URL
* Approver - Expensify report approver

# Sync and Export Errors

## ExpensiError FF0047: You must have an Ops Edit permission to edit approved records.
This error indicates that the permission control setup between the connected user and the report submitter or region is missing Ops Edit permission.

In Certinia go to Permission Controls and click the one you need to edit. Make sure that Expense Ops Edit is selected under Permissions.

## ExpensiError FF0076: Could not find employee in Certinia
Go to Contacts in Certinia and add the report creator/submitter's Expensify email address to their employee record, or create a record with that email listed.

If a record already exists then search for their email address to confirm it is not associated with multiple records.

## ExpensiError FF0089: Expense Reports for this Project require an Assignment
This error indicates that the project needs to have the permissions adjusted in Certinia

Go to Projects > [project name] > Project Attributes and check Allow Expense Without Assignment. 

## ExpensiError FF0091: Bad Field Name — [field] is invalid for [object]
This means the field in question is not accessible to the user profile in Certinia for the user whose credentials were used to make the connection within Expensify. 

To correct this:
* Go to Setup > Build > expand Create > Object within Certinia
* Then go to Payable Invoice > Custom Fields and Relationships
* Click View Field Accessibility 
* Find the employee profile in the list and select Hidden
* Make sure both checkboxes for Visible are selected

Once this step has been completed, sync the connection within Expensify by going to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** > **Sync Now** and then attempt to export the report again. 

## ExpensiError FF0132: Insufficient access. Make sure you are connecting to Certinia with a user that has the 'Modify All Data' permission

Log into Certinia and go to Setup > Manage Users > Users and find the user whose credentials made the connection. 

* Click on their profile on the far right side of the page
* Go to System > System Permissions
* Enable Modify All Data and save

Sync the connection within Expensify by going to **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Connections** > **Sync Now** and then attempt to export the report again

{% include faq-end.md %}
