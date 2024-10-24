---
title: Configure Xero
description: Configure your Xero connection
---

To configure your Xero connection, complete the steps below.

# Step 1: Configure import settings

The following steps help you determine how data will be imported from Xero to Expensify. 

<ol type="a">
   <li>Under the Accounting settings for your workspace, click <b>Import</b> under the Xero connection.</li>
   <li>Select an option for each of the following settings to determine what information will be imported from Xero into Expensify:</li>
       <ul>
           <li><b>Xero organization</b>: Select which Xero organization your Expensify workspace is connected to. Each organization can only be connected to one workspace at a time.</li>
           <li><b>Chart of Accounts</b>: Your Xero chart of accounts and any accounts marked as “Show In Expense Claims” will be automatically imported into Expensify as Categories. This cannot be amended.</li>
           <li><b>Tracking Categories</b>: Choose whether to import your Xero categories for cost centers and regions as tags in Expensify.</li>
           <li><b>Re-bill Customers</b>: When enabled, Xero customer contacts are imported into Expensify as tags for expense tracking. After exporting to Xero, tagged billable expenses can be included on a sales invoice to your customer.</li>
           <li><b>Taxes</b>: Choose whether to import tax rates and tax defaults from Xero.</li>
       </ul>  
</ol>

# Step 2: Configure export settings

The following steps help you determine how data will be exported from Expensify to Xero.

<ol type="a">
   <li>Under the Accounting settings for your workspace, click <b>Export</b> under the Xero connection.</li>
   <li>Review each of the following export settings:</li>
       <ul>
           <li><b>Preferred Exporter</b>: Choose whether to assign a Workspace Admin as the Preferred Exporter. Once selected, the Preferred Exporter automatically receives reports for export in their account to help automate the exporting process.</li>
       </ul>  
</ol> 
{% include info.html %}
- Other Workspace Admins will still be able to export to Xero. 
- If you set different export accounts for individual company cards under your domain settings, then your Preferred Exporter must be a Domain Admin.
{% include end-info.html %}

<ol type="a">
      <ul>
           <li><b>Export Out-of-Pocket Expenses as</b>: All out-of-pocket expenses will be exported as purchase bills. This cannot be amended.</li>
           <li><b>Purchase Bill Date</b>: Choose whether to use the date of the last expense, export date, or submitted date.</li>
           <li><b>Export invoices as</b>: All invoices exported to Xero will be as sales invoices. This cannot be amended.</li>
           <li><b>Export company card expenses as</b>: All company card expenses are exported to Xero as bank transactions. This cannot be amended.</li>
           <li><b>Xero Bank Account</b>: Select which bank account will be used to post bank transactions when non-reimbursable expenses are exported.</li>
      </ul>
</ol>
 
# Step 3: Configure advanced settings

The following steps help you determine the advanced settings for your connection, like auto-sync.

<ol type="a">
   <li>Under the Accounting settings for your workspace, click <b>Advanced</b> under the Xero connection.</li>
   <li>Select an option for each of the following settings:</li>
      <ul>
           <li><b>Auto-sync</b>: Choose whether to enable Xero to automatically communicate changes with Expensify to ensure that the data shared between the two systems is up-to-date. New report approvals/reimbursements will be synced during the next auto-sync period. Once you’ve added a business bank account for ACH reimbursement, any reimbursable expenses will be sent to Xero automatically when the report is reimbursed. For non-reimbursable reports, Expensify automatically queues the report to export to Xero after it has completed the approval workflow in Expensify.</li>
           <li><b>Set Purchase Bill Status</b>: Choose the status of your purchase bills:</li>
              <ul>
                 <li>Draft</li>
                 <li>Awaiting Approval</li>
                 <li>Awaiting Payment</li>                
              </ul>
           <li><b>Sync Reimbursed Reports</b>: Choose whether to enable report syncing for reimbursed expenses. If enabled, all reports that are marked as Paid in Xero will also show in Expensify as Paid. If enabled, you must also select the Xero account that reimbursements are coming out of, and Expensify will automatically create the payment in Xero.</li>
           <li><b>Xero Bill Payment Account</b>: If you enable Sync Reimbursed Reports, you must select the Xero Bill Payment account your reimbursements will come from.</li>
           <li><b>Xero Invoice Collections Account</b>: If you are exporting invoices from Expensify, select the invoice collection account that you want invoices to appear under once they are marked as paid.</li>
      </ul>
</ol>

{% include faq-begin.md %}

## How do I know if a report is successfully exported to Xero?

When a report exports successfully, a message is posted in the related Expensify Chat room.

![Insert alt text for accessibility here]({{site.url}}/assets/images/Xero_help_01.png){:width="100%"}

## What happens if I manually export a report that has already been exported?

When an admin manually exports a report, Expensify will warn them if the report has already been exported. If the admin chooses to export it again, it will create a duplicate report in Xero. You will need to delete the duplicate entries from within Xero.

![Insert alt text for accessibility here]({{site.url}}/assets/images/Xero_help_05.png){:width="100%"}

## What happens to existing reports that have already been approved and reimbursed if I enable Auto Sync?

- If Auto Sync was disabled when your Workspace was linked to Xero, enabling it won’t impact existing reports that haven’t been exported.
- If a report has been exported and reimbursed via ACH, it will be automatically marked as paid in Xero during the next sync.
- If a report has been exported and marked as paid in Xero, it will be automatically marked as reimbursed in Expensify during the next sync.
- If a report has not yet been exported to Xero, it won’t be automatically exported.
{% include faq-end.md %}
