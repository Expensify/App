---
title: Configure Certinia
description: Learn how to configure Certinia's export, coding, and advanced settings in Expensify.
keywords: [Certinia, export settings, coding, advanced settings, Expensify integration]
---
<div id="expensify-classic" markdown="1">

After connecting Certinia with Expensify, navigate to **Settings > Workspaces > [Workspace Name] > Connections > Certinia > Configure** to set up export, coding, and advanced settings.

# Configure Export Settings  
## Preferred Exporter  
Assign a preferred exporter—this member will be responsible for exporting reports and receiving error notifications.  

## Payable Invoice Status and Date  
Choose whether reports should be exported as **Complete** or **In Progress**, and select the relevant date:  
- **Date of last expense**  
- **Submitted date**  
- **Exported date**  

## Reimbursable and Non-Reimbursable Exports  
Both types of reports are exported as either **Payable Invoices (FFA)** or **Expense Reports (PSA/SRP)**.  
- If a report contains both reimbursable and non-reimbursable expenses, Expensify will create separate payable invoices or expense reports for each type.  

## Default Vendor (FFA)  
Select a vendor from your Certinia FFA account. This vendor will be assigned to non-reimbursable payable invoices.  

# Configure Coding Settings  
## Company  
Choose the FinancialForce company for importing and exporting data.  

## Chart of Accounts (FFA)  
- **Prepaid Expense Type** and **Profit & Loss** accounts are imported and used as expense categories.  

## Expense Type GLA Mappings (PSA/SRP)  
- When using both PSA and SRP, **Expense Type GLA Mappings** serve as expense categories.  
- PSA does not import or export categories, while SRP does.  

## Dimensions (FFA)  
Expensify imports up to four dimension levels, with three mapping options:  
- **Do not map**: FinancialForce defaults apply, and no data is imported.  
- **Tags**: Employees can select dimensions from the **Tags** section in Expensify.  
- **Report Fields**: Employees can apply dimensions at the report level.  

## Projects, Assignments, or Projects & Assignments (PSA/SRP)  
Projects and assignments can be imported as tags.  
- **Milestones** are optional.  
- If only projects are imported, the account is derived from the project.  
- If assignments are imported, both the account and project are derived from the assignment.  

**Note:** If using a project without an assignment, enable **Allow Expenses Without Assignment** in FinancialForce.  

## Tax  
Import tax rates from Certinia to apply to expenses.  

# Configure Advanced Settings  
## Auto Sync  
Auto Sync performs daily updates to your coding and automatically exports reports upon final approval.  
- **Non-Reimbursable expenses**: Export occurs immediately after final approval.  
- **Reimbursable expenses**: Export occurs when the report is reimbursed or marked as reimbursed.  

## Export Tax as Non-Billable  
Decide whether tax amounts should be billed to clients when exporting billable expenses.  

## Multi-Currency in Certinia PSA/SRP  
When employees submit expenses in multiple currencies, Certinia may display up to three different currencies per report:  
- **Summary Total Reimbursement Amount**: Uses the project currency.  
- **Amount field on Expense Line**: Uses the Expensify workspace default report currency.  
- **Reimbursable Amount on Expense Line**: Uses the submitter’s resource currency.  

# FAQ  

## What happens if a report fails to export to Certinia?  
If a report isn't exported:  
- The **preferred exporter** receives an email with error details.  
- Error messages are recorded in the **report history**.  
- The report appears in the **exporter’s Expensify Inbox** as "Awaiting Export".  

## If I enable Auto Sync, what happens to existing approved and reimbursed reports?  
Enabling **Auto Sync** does not affect previously approved or reimbursed reports.  
- If approved reports haven’t been exported, manually export them or mark them as manually entered.  

## How do I export tax?  
Expensify tax rates are managed under **Settings > Workspaces > Groups > [Workspace Name] > Tax**.  
- The tax amount calculated on expenses is exported to Certinia.  

## How do reports map to Payable Invoices in Certinia FFA?  
Reports are mapped as follows:  
- **Account Name**: Account linked to the submitter’s email.  
- **Reference 1**: Report URL.  
- **Invoice Description**: Report title.  

## How do reports map to Expense Reports in Certinia PSA/SRP?  
Reports are mapped as follows:  
- **Expense Report Name**: Report title.  
- **Resource**: Submitter’s email.  
- **Description**: Report URL.  
- **Approver**: Expensify report approver.  

</div>
