---
title: Configure Quickbooks Online
description: Configure your QuickBooks Online connection with Expensify
---

Once you've set up your QuickBooks Online connection, you'll be able to configure your import and export settings.

# Step 1: Configure import settings

The following steps help you determine how data will be imported from QuickBooks Online to Expensify. 

<ol type="a">
   <li>Under the Accounting settings for your workspace, click Import under the QuickBooks Online connection.</li>
   <li>Review each of the following import settings:</li>
       <ul>
           <li><b>Chart of accounts</b>: The chart of accounts are automatically imported from QuickBooks Online as categories. This cannot be amended.</li>
           <li><b>Classes</b>: Choose whether to import classes, which will be shown in Expensify as tags for expense-level coding.</li>
           <li><b>Customers/projects</b>: Choose whether to import customers/projects, which will be shown in Expensify as tags for expense-level coding.</li>
           <li><b>Locations</b>: Choose whether to import locations, which will be shown in Expensify as tags for expense-level coding.</li>
{% include info.html %}
As Locations are only configurable as tags, you cannot export expense reports as vendor bills or checks to QuickBooks Online. To unlock these export options, either disable locations import or upgrade to the Control Plan to export locations encoded as a report field.
{% include end-info.html %}
           <li><b>Taxes</b>: Choose whether to import tax rates and defaults.</li>
       </ul>
</ol>

# Step 2: Configure export settings

The following steps help you determine how data will be exported from Expensify to QuickBooks Online.

<ol type="a">
   <li>Under the Accounting settings for your workspace, click Export under the QuickBooks Online connection.</li>
   <li>Review each of the following export settings:</li>
       <ul>
           <li><b>Preferred Exporter</b>: Choose whether to assign a Workspace Admin as the Preferred Exporter. Once selected, the Preferred Exporter automatically receives reports for export in their account to help automate the exporting process.</li>  

{% include info.html %}
* Other Workspace Admins will still be able to export to QuickBooks Online. 
* If you set different export accounts for individual company cards under your domain settings, then your Preferred Exporter must be a Domain Admin.
{% include end-info.html %}

           <li><b>Date</b>: Choose whether to use the date of last expense, export date, or submitted date.</li>  
           <li><b>Export Out-of-Pocket Expenses as</b>: Select whether out-of-pocket expenses will be exported as a check, journal entry, or vendor bill.</li>  

{% include info.html %}
These settings may vary based on whether tax is enabled for your workspace. 
* If tax is not enabled on the workspace, you’ll also select the Accounts Payable/AP. 
* If tax is enabled on the workspace, journal entry will not be available as an option. If you select the journal entries option first and later enable tax on the workspace, you will see a red dot and an error message under the “Export Out-of-Pocket Expenses as” options. To resolve this error, you must change your export option to vendor bill or check to successfully code and export expense reports.
{% include end-info.html %}
 
           <li><b>Invoices</b>: Select the QuickBooks Online invoice account that invoices will be exported to.</li>  
           <li><b>Export as</b>: Select whether company cards export to QuickBooks Online as a credit card (the default), debit card, or vendor bill. Then select the account they will export to.</li>  
               <li>If you select vendor bill, you’ll also select the accounts payable account that vendor bills will be created from, as well as whether to set a default vendor for credit card transactions upon export. If this option is enabled, you will select the vendor that all credit card transactions will be applied to.</li>
      </ul>
</ol>   

# Step 3: Configure advanced settings

The following steps help you determine the advanced settings for your connection, like auto-sync and employee invitation settings.

<ol type="a">
   <li>Under the Accounting settings for your workspace, click Advanced under the QuickBooks Online connection.</li>
   <li>Select an option for each of the following settings:</li>
       <ul>
           <li><b>Auto-sync</b>: Choose whether to enable QuickBooks Online to automatically communicate changes with Expensify to ensure that the data shared between the two systems is up-to-date. New report approvals/reimbursements will be synced during the next auto-sync period.</li>    
           <li><b>Invite Employees</b>: Choose whether to enable Expensify to import employee records from QuickBooks Online and invite them to this workspace.</li>    
           <li><b>Automatically Create Entities</b>: Choose whether to enable Expensify to automatically create vendors and customers in QuickBooks Online if a matching vendor or customer does not exist.</li>    
           <li><b>Sync Reimbursed Reports</b>: Choose whether to enable report syncing for reimbursed expenses. If enabled, all reports that are marked as Paid in QuickBooks Online will also show in Expensify as Paid. If enabled, you must also select the QuickBooks Online account that reimbursements are coming out of, and Expensify will automatically create the payment in QuickBooks Online.</li>    
           <li><b>Invoice Collection Account</b>: Select the invoice collection account that you want invoices to appear under once the invoice is marked as paid.</li>    
      </ul>
</ol>

{% include faq-begin.md %}

## How do I know if a report is successfully exported to QuickBooks Online?

When a report exports successfully, a message is posted in the expense’s related chat room:

![Confirmation message posted in the expense chat room](https://help.expensify.com/assets/images/QBO_help_01.png){:width="100%"}

## What happens if I manually export a report that has already been exported?

When an admin manually exports a report, Expensify will notify them if the report has already been exported. Exporting the data again will create a duplicate report in QuickBooks Online.

## What happens to existing approved and reimbursed reports if I enable Auto Sync?

- If Auto Sync was disabled when your Workspace was linked to QuickBooks Online, enabling it won’t impact existing reports that haven’t been exported.
- If a report has been exported and reimbursed via ACH, it will be automatically marked as paid in QuickBooks Online during the next sync.
- If a report has been exported and marked as paid in QuickBooks Online, it will be automatically marked as reimbursed in Expensify during the next sync.

Reports that have yet to be exported to QuickBooks Online won’t be automatically exported.

{% include faq-end.md %}
