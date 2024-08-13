---
title: Connect to Xero
description: Integrate Xero with Expensify
order: 1
---

{% include info.html %}
To use the Xero connection, you must have a Xero account and an Expensify Collect plan.
{% include end-info.html %}
 
To set up your Xero connection, complete the 4 steps below.

# Step 1: Connect Expensify to Xero

<ol type="a">
   <li>Click your profile image or icon in the bottom left menu.</li>
   <li>Scroll down and click <b>Workspaces</b> in the left menu.</li>
   <li>Select the workspace you want to connect to Xero.</li>
   <li>Click <b>More features</b> in the left menu.</li>
   <li>Scroll down to the Integrate section and enable the Accounting toggle.</li>
   <li>Click <b>Accounting</b> in the left menu.</li>
   <li>Click <b>Set up</b> to the right of Xero.</li>
   <li>Enter your Xero login details to import your settings from Xero to Expensify.</li>
</ol>

![The toggle location to enable accounting integrations like QuickBooks Online]({{site.url}}/assets/images/ExpensifyHelp-Xero-1.png){:width="100%"}

![How to enable accounting integrations like QuickBooks Online]({{site.url}}/assets/images/ExpensifyHelp-Xero-2.png){:width="100%"}

![The QuickBooks Online Connect button]({{site.url}}/assets/images/ExpensifyHelp-Xero-3.png){:width="100%"}

# Step 2: Configure import settings

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

# Step 3: Configure export settings
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
           <li><b>Purchase Bill Date</b>: Choose whether to use the date of last expense, export date, or submitted date.</li>
           <li><b>Export invoices as</b>: All invoices exported to Xero will be as a sales invoice. This cannot be amended.</li>
           <li><b>Export company card expenses as</b>: All company card expenses export to Xero as bank transactions. This cannot be amended.</li>
           <li><b>Xero Bank Account</b>: Select which bank account will be used to post bank transactions when non-reimbursable expenses are exported.</li>
      </ul>
</ol>
 
# Step 4: Configure advanced settings

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

**How do I disconnect Xero from Expensify?**

1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select the workspace you want to disconnect from Xero. 
4. Click **Accounting** in the left menu.
5. Click the three dot menu icon to the right of Xero and select **Disconnect**.
6. Click **Disconnect** to confirm. 

You will no longer see the imported options from Xero.
{% include faq-end.md %}
