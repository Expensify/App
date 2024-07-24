---
title: Configure Certinia
description: Configure Certinia's export, coding, and advanced settings. 
order: 2
---
After Certinia and Expensify are connected, head to **Settings > Workspaces > [Workspace Name] > Connections > Certinia > Configure** to configure the export, coding, and advanced settings for the connection.

# Step 1: Configure Export Settings 
## Preferred Exporter
The preferred exporter is the user who will be the main exporter of reports. This person will receive the notifications for errors.

## Payable Invoice Status and Date
Reports can be exported as Complete or In Progress, using the date of last expense, submitted date, or exported date.

## Reimbursable and non-reimbursable exports
Both reimbursable and non-reimbursable reports are exported as payable invoices (FFA) or expense reports (PSA/SRP). If you have both Reimbursable and Non-Reimbursable expenses on a single report, Expensify will create a separate payable invoice/expense report for each type. 

## Default Vendor (FFA)
Choose from the full list of vendors from your Certinia FFA account. The amount will be applied to the non-reimbursable payable invoices.

# Step 2: Configure Coding Settings
## Company
Select which FinancialForce company to import from/export to.

## Chart of Accounts (FFA)
Prepaid Expense Type and Profit & Loss accounts are imported to be used as categories on each expense. 

## Expense Type GLA Mappings (PSA/SRP)
Your Expense Type GLA Mappings are enabled in Expensify to use as categories on each expense when using both PSA and SRP; however, PSA will not import or export categories, while SRP will.

## Dimensions (FFA)
We import four dimension levels and each has three options to select from:

* Do not map: FinancialForce defaults will apply to the payable invoice, without importing it into Expensify
* Tags: These are shown in the Tag section of your workspace, and employees can select them on each expense created
* Report fields: These will show in the Reports section of your workspace. Employees can select one to be applied at the header level, i.e., the entire report. 

## Projects, Assignments, or Projects & Assignments (PSA/SRP)
These can be imported as tags with **Milestones** being optional. When selecting to import only projects, we will derive the account from the project. If an assignment is selected, we will derive both the account and project from the assignment. 

**Note:** If you are using a project without an assignment, the box **Allow Expenses Without Assignment** must be checked on the project in FinancialForce.

## Tax
Import tax rates from Certinia to apply to expenses.

# Step 3: Configure Advanced Settings
## Auto Sync
Auto Sync in Certinia performs daily updates to your coding. Additionally, it automatically exports reports after they receive final approval. For Non-Reimbursable expenses, syncing happens immediately upon final approval of the report. In the case of Reimbursable expenses, syncing occurs as soon as the report is reimbursed or marked as reimbursed.

## Export tax as non-billable
When exporting Billable expenses, this dictates whether you will also bill the tax component to your clients/customers.

## Multi-Currency in Certinia PSA/SRP
When exporting to Certinia PSA/SRP, if employees are submitting expenses in more than one original currency, you may see up to three different currencies on the expense report in Certinia.
* Summary Total Reimbursement Amount: this currency is derived from the currency of the project selected on the expense.
* Amount field on the Expense line: this currency is derived from the Expensify workspace default report currency.
* Reimbursable Amount on the Expense line: this currency is derived from the currency of the resource with an email matching the report submitter.

{% include faq-begin.md %}

## What happens if the report can’t be exported to Certinia?

The following happens if a report isn't exported:
- The preferred exporter will receive an email outlining the issue and any specific error messages
- Any error messages preventing the export from taking place will be recorded in the report’s history
- The report will be listed in the exporter’s Expensify Inbox as awaiting export.

## If I enable Auto Sync, what happens to existing approved and reimbursed reports?

Enabling Auto-Sync afterward won't affect existing approved or reimbursed reports. For any approved reports that haven't been exported to Certinia, you'll need to either manually export them or mark them as manually entered.

## How do I export tax?

Tax rates are created in Expensify through the tax tracking feature under **Settings** > **Workspaces** > **Groups** > _[Workspace Name]_ > **Tax**. We export the tax amount calculated on the expenses. 

## How do reports map to Payable Invoices in Certinia FFA?

Reports map to FFA as follows:
- Account Name - Account associated with Expensify submitter’s email address
- Reference 1 - Report URL
- Invoice Description - Report title

## How do reports map to Expense Reports in Certinia PSA/SRP?

Reports map to PSA/SRP as follows:
- Expense report name - Report title
- Resource - User associated with Expensify submitter’s email address
- Description - Report URL
- Approver - Expensify report approver

{% include faq-end.md %}
