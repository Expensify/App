---
title: Set up QuickBooks Online connection
description: Integrate QuickBooks Online with Expensify
---
<div id="new-expensify" markdown="1">

{% include info.html %}
To use the QuickBooks Online connection, you must have a QuickBooks Online account and an Expensify Collect plan. The QuickBooks Self-employed subscription is not supported.
{% include end-info.html %}

The features available for the Expensify connection with QuickBooks Online vary based on your QuickBooks subscription. The features may still be visible in Expensify even if you don’t have access, but you will receive an error if the feature isn't available with your subscription. 

Here is a list of the features supported by each QuickBooks Online subscription: 

| Feature                    | Simple Start | Essentials | Essentials Plus |
|----------------------------|--------------|------------|-----------------|
| Expense Reports            | &#10004;     | &#10004;   | &#10004;        |
| GL Accounts as Categories  | &#10004;     | &#10004;   | &#10004;        |
| Credit Card Transactions   | &#10004;     | &#10004;   | &#10004;        |
| Debit Card Transaction     |              | &#10004;   | &#10004;        |
| Classes                    |              | &#10004;   | &#10004;        |
| Customers                  |              | &#10004;   | &#10004;        |
| Projects                   |              | &#10004;   | &#10004;        |
| Vendor Bills               |              | &#10004;   | &#10004;        |
| Journal Entries            |              | &#10004;   | &#10004;        |
| Tax                        |              | &#10004;   | &#10004;        |
| Billable                   |              |            | &#10004;        |
| Location                   |              |            | &#10004;        |

To set up your QuickBooks Online connection, complete the 5 steps below.

# Step 1: Set up employees in QuickBooks Online

Log in to QuickBooks Online and ensure all of your employees are setup as either Vendors or Employees using the same email address that they are listed under in Expensify. This process may vary by country, but you can go to **Payroll** and select **Employees** in QuickBooks Online to add new employees or edit existing ones. 

# Step 2: Connect Expensify to QuickBooks Online

<ol type="a">
   <li>Click your profile image or icon in the bottom left menu.</li>
   <li>Scroll down and click <b>Workspaces</b> in the left menu.</li>
   <li>Select the workspace you want to connect to QuickBooks Online.</li>
   <li>Click <b>More features</b> in the left menu.</li>
   <li>Scroll down to the Integrate section and enable the Accounting toggle.</li>
   <li>Click <b>Accounting</b> in the left menu.</li>
   <li>Click <b>Set up</b> to the right of QuickBooks Online.</li>
   <li>Enter your Intuit login details to import your settings from QuickBooks Online to Expensify.</li>
</ol>

![The toggle location to enable accounting integrations like QuickBooks Online]({{site.url}}/assets/images/ExpensifyHelp-QBO-1.png){:width="100%"}

![How to enable accounting integrations like QuickBooks Online]({{site.url}}/assets/images/ExpensifyHelp-QBO-2.png){:width="100%"}

![The QuickBooks Online Connect button]({{site.url}}/assets/images/ExpensifyHelp-QBO-3.png){:width="100%"}

![The QuickBooks Online Connect Accounting button]({{site.url}}/assets/images/ExpensifyHelp-QBO-4.png){:width="100%"}

![The QuickBooks Online Connect Connect button]({{site.url}}/assets/images/ExpensifyHelp-QBO-5.png){:width="100%"}



# Step 3: Configure import settings

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

# Step 4: Configure export settings

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

# Step 5: Configure advanced settings

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

**Why do I see a red dot next to my connection?** 
If there is an error with your connection, you’ll see a red dot next to Accounting in the left menu. When you click Accounting, you’ll also see a red dot displayed next to the QuickBooks Online connection card.

This may occur if you incorrectly enter your QuickBooks Online login information when trying to establish the connection. To resubmit your login details,
1. Click the three-dot menu to the right of the QuickBooks Online connection.
2. Click **Enter credentials**.
3. Enter your Intuit login details (the login information you use for QuickBooks Online) to establish the connection.

{% include faq-end.md %}

</div>
