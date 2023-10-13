---
title: NetSuite
description: Connect and configure NetSuite directly to Expensify.
---
# Overview
Expensify's seamless integration with NetSuite enables you to streamline your expense reporting process. This integration allows you to automate the export of reports, tailor your coding preferences, and tap into NetSuite's array of advanced features. By correctly configuring your NetSuite settings in Expensify, you can leverage the connection's settings to automate most of the tasks, making your workflow more efficient.

Before getting started with connecting NetSuite to Expensify, there are a few things to note:
- Token-based authentication works by ensuring that each request to NetSuite is accompanied by a signed token which is verified for authenticity
- You must be able to login to NetSuite as an administrator to initiate the connection
- You must have a Control Plan in Expensify to integrate with NetSuite
- Employees don’t need NetSuite access or a NetSuite license to submit expense reports since the connection is managed by the Workspace Admin
- Each NetSuite subsidiary will need its own Expensify Group Workspace
- Ensure that your workspace's report output currency setting matches the NetSuite Subsidiary default currency
- Make sure your page size is set to 1000 for importing your customers and vendors. Go to Setup > Integration > Web Services Preferences > 'Search Page Size'

# How to Connect to NetSuite 

## Step 1: Install the Expensify Bundle in NetSuite

1. While logged into NetSuite as an administrator, go to Customization > SuiteBundler > Search & Install Bundles, then search for "Expensify"
2. Click on the Expensify Connect bundle (Bundle ID 283395)
3. Click Install
4. If you already have the Expensify Connect bundle installed, head to _Customization > SuiteBundler > Search & Install Bundles > List_ and update it to the latest version
5. Select **Show on Existing Custom Forms** for all available fields

## Step 2: Enable Token-Based Authentication

1. Head to _Setup > Company > Enable Features > SuiteCloud > Manage Authentication_
2. Make sure “Token Based Authentication” is enabled
3. Click **Save**

## Step 3: Add Expensify Integration Role to a User

The user you select must have access to at least the permissions included in the Expensify Integration Role, but they're not required to be an Admin.
1. In NetSuite, head to Lists > Employees, and find the user you want to add the Expensify Integration role to
2. Click _Edit > Access_, then find the Expensify Integration role in the dropdown and add it to the user
3. Click **Save**

Remember that Tokens are linked to a User and a Role, not solely to a User. It's important to note that you cannot establish a connection with tokens using one role and then switch to another role afterward. Once you've initiated a connection with tokens, you must continue using the same token/user/role combination for all subsequent sync or export actions.

## Step 4: Create Access Tokens

1. Using Global Search in NetSuite, enter “page: tokens”
2. Click **New Access Token**
3. Select Expensify as the application (this must be the original Expensify integration from the bundle)
4. Select the role Expensify Integration
5. Press **Save**
6. Copy and Paste the token and token ID to a saved location on your computer (this is the only time you will see these details)

## Step 5: Confirm Expense Reports are Enabled in NetSuite.

Enabling Expense Reports is required as part of Expensify's integration with NetSuite:
1. Logged into NetSuite as an administrator, go to Setup > Company > Enable Features > Employees
2. Confirm the checkbox next to Expense Reports is checked
3. If not, click the checkbox and then Save to enable Expense Reports

## Step 6: Confirm Expense Categories are set up in NetSuite.

Once Expense Reports are enabled, Expense Categories can be set up in NetSuite. Expense Categories are an alias for General Ledger accounts for coding expenses.

1. Logged into NetSuite as an administrator, go to Setup > Accounting > Expense Categories (a list of Expense Categories should show)
2. If no Expense Categories are visible, click **New** to create new ones

## Step 7: Confirm Journal Entry Transaction Forms are Configured Properly

1. Logged into NetSuite as an administrator, go to _Customization > Forms > Transaction Forms_
2. Click **Customize** or **Edit** next to the Standard Journal Entry form
3. Then, click Screen Fields > Main. Please verify the "Created From" label has "Show" checked and the Display Type is set to Normal
4. Click the sub-header Lines and verify that the "Show" column for "Receipt URL" is checked
5. Go to _Customization > Forms > Transaction Forms_ and ensure all other transaction forms with the journal type have this same configuration

## Step 8: Confirm Expense Report Transaction Forms are Configured Properly

1. Logged into NetSuite as an administrator, go to _Customization > Forms > Transaction Forms_
2. Click **Customize** or **Edit** next to the Standard Expense Report form, then click **Screen Fields > Main**
3. Verify the "Created From" label has "Show" checked and the Display Type is set to Normal
4. Click the second sub-header, Expenses, and verify that the 'Show' column for 'Receipt URL' is checked
5. Go to _Customization > Forms > Transaction Forms_ and ensure all other transaction forms with the expense report type have this same configuration

## Step 9: Confirm Vendor Bill Transactions Forms are Configured Properly

1. Logged into NetSuite as an administrator, go to _Customization > Forms > Transaction Forms_ 
2. Click **Customize** or **Edit** next to your preferred Vendor Bill form
3. Then, click _Screen Fields > Main_ and verify that the "Created From" label has "Show" checked and that Departments, Classes, and Locations have the "Show" label unchecked
4. Under the Expenses sub-header (make sure to click the "Expenses" sub-header at the very bottom and not "Expenses & Items"), ensure "Show" is checked for Receipt URL, Department, Location, and Class
5. Go to _Customization > Forms > Transaction Forms_ and provide all other transaction forms with the vendor bill type have this same configuration

## Step 10: Confirm Vendor Credit Transactions Forms are Configured Properly

1. While logged in as an administrator, go to _Customization > Forms > Transaction Forms_
2. Click **Customize** or **Edit** next to your preferred Vendor Credit form, then click _Screen Fields > Main_ and verify that the "Created From" label has "Show" checked and that Departments, Classes, and Locations have the "Show" label unchecked
3. Under the Expenses sub-header (make sure to click the "Expenses" sub-header at the very bottom and not "Expenses & Items"), ensure "Show" is checked for Receipt URL, Department, Location, and Class
4. Go to _Customization > Forms > Transaction Forms_ and ensure all other transaction forms with the vendor credit type have this same configuration

## Step 11: Set up Tax Groups (only applicable if tracking taxes)

Expensify imports NetSuite Tax Groups (not Tax Codes), which you can find in NetSuite under _Setup > Accounting > Tax Groups_.

Tax Groups are an alias for Tax Codes in NetSuite and can contain one or more Tax Codes (Please note: for UK and Ireland subsidiaries, please ensure your Tax Groups do not have more than one Tax Code). We recommend naming Tax Groups so your employees can easily understand them, as the name and rate will be displayed in Expensify.

Before importing NetSuite Tax Groups into Expensify:
1. Create your Tax Groups in NetSuite by going to _Setup > Accounting > Tax Groups_
2. Click **New**
3. Select the country for your Tax Group
4. Enter the Tax Name (this is what employees will see in Expensify)
5. Select the subsidiary for this Tax Group
6. Select the Tax Code from the table you wish to include in this Tax Group
7. Click **Add**
8. Click **Save**
9. Create one NetSuite Tax Group for each tax rate you want to show in Expensify

Ensure Tax Groups can be applied to expenses by going to _Setup > Accounting > Set Up Taxes_ and setting the Tax Code Lists Include preference to "Tax Groups And Tax Codes" or "Tax Groups Only." 

If this field does not display, it’s not needed for that specific country.

## Step 12: Connect Expensify and NetSuite

1. Log into Expensify as a Policy Admin and go to **Settings > Workspaces > _[Workspace Name]_ > Connections > NetSuite**
2. Click **Connect to NetSuite**
3. Enter your Account ID (Account ID can be found in NetSuite by going to _Setup > Integration > Web Services Preferences_)
4. Then, enter the token and token secret 
5. Click **Connect to NetSuite**

From there, the NetSuite connection will sync, and the configuration dialogue box will appear.

Please note that you must create the connection using a NetSuite account with the Expensify Integration role

Once connected, all reports exported from Expensify will be generated in NetSuite using SOAP Web Services (the term NetSuite employs when records are created through the integration).

# How to Configure Export Settings

There are numerous options for exporting Expensify reports to NetSuite. Let's explore how to configure these settings to align with your business needs.
To access these settings, head to **Settings > Workspace > Group > Connections** and select the **Configure** button. 

## Export Options

### Subsidiary

The subsidiary selection will only appear if you use NetSuite OneWorld and have multiple subsidiaries active. If you add a new subsidiary to NetSuite, sync the workspace connection, and the new subsidiary should appear in the dropdown list under **Settings > Workspaces > _[Workspace Name]_ > Connections**.

### Preferred Exporter

This option allows any admin to export, but the preferred exporter will receive notifications in Expensify regarding the status of exports.

### Date

The three options for the date your report will export with are:
- Date of last expense: This will use the date of the previous expense on the report
- Submitted date: The date the employee submitted the report
- Exported date: The date you export the report to NetSuite

## Reimbursable Expenses

### Expense Reports

Expensify transactions will export reimbursable expenses as expense reports by default, which will be posted to the payables account designated in NetSuite. 

### Vendor Bills

Expensify transactions export as vendor bills in NetSuite and will be mapped to the subsidiary associated with the corresponding policy. Each report will be posted as payable to the vendor associated with the employee who submitted the report. 
You can also set an approval level in NetSuite for vendor bills.

### Journal Entries

Expensify transactions that are set to export as journal entries in NetSuite will be mapped to the subsidiary associated with this policy. All the transactions will be posted to the payable account specified in the policy. 

You can also set an approval level in NetSuite for the journal entries.

**Important Notes:**
- Journal entry forms by default do not contain a customer column, so it is not possible to export customers or projects with this export option
- The credit line and header level classifications are pulled from the employee record

## Non-Reimbursable Expenses

### Vendor Bills

Non-reimbursable expenses will be posted as a vendor bill payable to the default vendor specified in your policy's connection settings. If you centrally manage your company cards through Domains, you can export expenses from each card to a specific vendor in NetSuite. You can also set an approval level in NetSuite for the bills. 

### Journal Entries

Non-reimbursable expenses will be posted to the Journal Entries posting account selected in your policy's connection settings. If you centrally manage your company cards through Domains, you can export expenses from each card to a specific account in NetSuite.

**Important Notes:**
- Expensify Card expenses will always export as Journal Entries, even if you have Expense Reports or Vendor Bills configured for non-reimbursable expenses on the Export tab
- Journal entry forms do not contain a customer column, so it is not possible to export customers or projects with this export option
- The credit line and header level classifications are pulled from the employee record

### Expense Reports

To use the expense report option for your corporate card expenses, you will need to set up your default corporate cards in NetSuite. 

To use a default corporate card for non-reimbursable expenses, you must select the correct card on the employee records (for individual accounts) or the subsidiary record (If you use a non-one world account, the default is found in your accounting preferences).

Add the corporate card option and corporate card main field to your expense report transaction form in NetSuite by: 
1. Heading to _Customization > Forms > Transaction Forms > Preferred expense report form > Screen Fields_
2. Under the Main tab, check “Show” for Account for Corporate Card Expenses
3. On the Expenses tab, check “Show” for Corporate Card

You can select the default account on your employee record to use individual corporate cards for each employee. Make sure you add this field to your employee entity form in NetSuite.
If you have multiple cards assigned to a single employee, you cannot export to each account. You can only have a single default per employee record. 

### Export Invoices

Select the Accounts Receivable account you want your Invoice Reports to export. In NetSuite, the Invoices are linked to the customer, corresponding to the email address where the Invoice was sent.

### Default Vendor Bills

The list of vendors will be available in the dropdown when selecting the option to export non-reimbursable expenses as vendor bills.

# How to Configure Coding Settings 

The Coding tab is where NetSuite information is configured in Expensify, which allows employees to code expenses and reports accurately. There are several coding options in NetSuite. Let’s go over each of those below. 

## Expense Categories

Expensify's integration with NetSuite automatically imports NetSuite Expense Categories as Categories in Expensify.

Please note that each expense must have a Category selected to export to NetSuite. The category chosen must be imported from NetSuite and cannot be manually created in Expensify. 

If you want to delete Categories, you must do this in NetSuite. Categories are added and modified on the integration’s side and then synced with Expensify.
Once imported, you can turn specific Categories on or off under **Settings > Workspaces > _[Workspace Name]_ > Categories**. 

## Tags

The NetSuite integration allows you to configure Customers, Projects, Departments, Classes, and Locations as line-item expense classifications. These are called Tags in Expensify.

Suppose a default Customer, Project, Department, Class, or Location ties to the employee record in NetSuite. In that case, Expensify will create a rule that automatically applies that tag to all expenses made by that employee (the Tag is still editable if necessary).

If you want to delete Tags, you must do this in NetSuite. Tags are added and modified on the integration’s side and then synced with Expensify.

Once imported, you can turn specific Tags on or off under **Settings > Workspaces > _[Workspace Name]_ > Tags**. 

## Report Fields

The NetSuite integration allows you to configure Customers, Projects, Departments, Classes, and Locations as report-level classifications. These are called Report Fields in Expensify.

## NetSuite Employee Default

The NetSuite integration allows you to set Departments, Classes, and Locations according to the NetSuite Employee Default for expenses exported as both Expense Reports and Journal Entries. 

These fields must be set in NetSuite's employee(s) record(s) to be successfully applied to expenses upon export.

You cannot use the employee default setting with a vendor bill export if you have both a vendor and an employee set up for the user under the same email address and subsidiary.

## Tax

The NetSuite integration allows users to apply a tax rate and amount to each expense. To do this, import Tax Groups from NetSuite: 
1. In NetSuite, head to _Setup > Accounting > Tax Groups_
2. Once imported, go to the NetSuite connection configuration page in Expensify (under **Settings > Workspaces > Group > _[Workspace Name]_ > Connection > NetSuite > Coding**), refresh the subsidiary list, and the Tax option will appear
3. From there, enable Tax
4. Click **Save**
5. Sync the connection
6. All Tax Groups for the connected NetSuite subsidiary will be imported to Expensify as taxes.
7. After syncing, go to **Settings > Workspace > Group > _[Workspace Name]_ > Tax** to see the tax groups imported from NetSuite
8. Use the turn on/off button to choose which taxes to make available to your employees
9. Select a default tax to apply to the workspace (that tax rate will automatically apply to all new expenses)

## Custom Segments

To add a Custom Segment to your workspace, you’ll need to locate three fields in NetSuite:
- Segment Name
- Internal ID
- Script/Field ID

**To find the Segment Name:**
1. Log in as an administrator in NetSuite
2. Head to _Customization > Lists, Records, & Fields > Custom Segments_
3. You’ll see the Segment Name on the Custom Segments page

**To find the Internal ID:**
1. Ensure you have internal IDs enabled in NetSuite under _Home > Set Preferences_
2. Navigate back to the Custom Segment page
3. Click the **Custom Record Type** hyperlink
4. You’ll see the Internal ID on the Custom Record Type page

**To find the Script/Field ID:**

If configuring Custom Segments as Report Fields, use the Field ID on the Transactions tab (under _Custom Segments > Transactions_).

If configuring Custom Segments as Tags, use the Field ID on the Transaction Columns tab (under _Custom Segments > Transaction Columns_). 

Lastly, head over to Expensify and do the following:
1. Navigate to **Settings > Workspace > Group > _[Workspace Name]_ > Connections > Configure > Coding tab**
2. Choose how to import Custom Segments (Report Fields or Tags) 
3. Fill out the three fields (Segment Name, Internal ID, Script ID)
4. Click **Submit**

From there, you should see the values for the Custom Segment under the Tag or Report Field settings in Expensify. 

Don’t use the "Filtered by" feature available for Custom Segments. Expensify can’t make these dependent on other fields. If you do have a filter selected, we suggest switching that filter in NetSuite to "Subsidiary" and enabling all subsidiaries to ensure you don't receive any errors upon exporting reports. 

### Custom Records

Custom Records are added through the Custom Segments feature.

To add a Custom Record to your workspace, you’ll need to locate three fields in NetSuite:
- The name of the record
- Internal ID
- Transaction Column ID

**To find the Internal ID:**
1. Make sure you have Internal IDs enabled in NetSuite under Home > Set Preferences
2. Navigate back to the Custom Segment page
3. Click the Custom Record Type hyperlink
4. You’ll see the Internal ID on the Custom Record Type page

**To find the Transaction Column ID:**
If configuring Custom Segments as Report Fields, use the Field ID on the Transactions tab (under _Custom Segments > Transactions_).

If configuring Custom Segments as Tags, use the Field ID on the Transaction Columns tab (under _Custom Segments > Transaction Columns_). 

Lastly, head over to Expensify and do the following:
1. Navigate to **Settings > Workspace > Group > [Workspace Name]_ > Connections > Configure > Coding tab**
2. Choose how to import Custom Records (Report Fields or Tags) 
3. Fill out the three fields (the name or label of the record, Internal ID, Transaction Column ID)
4. Click **Submit**

From there, you should see the values for the Custom Records under the Tag or Report Field settings in Expensify. 

### Custom Lists

To add Custom Lists to your workspace, you’ll need to locate two fields in NetSuite:
- The name of the record
- The ID of the Transaction Line Field that holds the record

**To find the record:**
1. Log into Expensify
2. Head to **Settings > Workspace > Group > _[Workspace Name]_ > Connections > Configure > Coding tab**
3. The name of the record will be populated in a dropdown list

The name of the record will populate in a dropdown list. If you don't see the one you are looking for, click **Refresh Custom List Options**.

**To find the Transaction Line Field ID:**
1. Log into NetSuite
2. Search "Transaction Line Fields" in the global search
3. Open the option that is holding the record to get the ID

Lastly, head over to Expensify, and do the following:
1. Navigate to **Settings > Workspaces > Group > _[Workspace Name]_ > Connections > Configure > Coding tab**
2. Choose how to import Custom Lists (Report Fields or Tags)
3. Enter the ID in Expensify in the configuration screen
4. Click **Submit**

From there, you should see the values for the Custom Lists under the Tag or Report Field settings in Expensify. 

# How to Configure Advanced Settings

The NetSuite integration’s advanced configuration settings are accessed under **Settings > Workspaces > Group > _[Workspace Name]_ > Connections > NetSuite > Configure > Advanced tab**.

Let’s review the different advanced settings and how they interact with the integration.

## Auto Sync

Enabling Auto Sync ensures that the information in NetSuite and Expensify is always in sync through automating exports, tracking direct deposits, and communicating export errors.

**Automatic Export:**
- When you turn on the Auto Sync feature in Expensify, any final report you approve will automatically be sent to NetSuite.
- This happens every day at approximately the same time.

**Direct Deposit Alert:**
- If you use Expensify's Direct Deposit ACH and have Auto Sync, getting reimbursed for an Expensify report will automatically create a Bill Payment in NetSuite.

**Tracking Exports and Errors:**
- In the comments section of an Expensify report, you can find extra details about the report.
- The comments section will tell you when the report was sent to NetSuite, and if there were any problems during the export, it will show the error.

## Newly Imported Categories

With this enabled, all submitters can add any newly imported Categories to an Expense. 

## Invite Employees & Set Approval Workflow

### Invite Employees

Use this option in Expensify to bring your employees from a specific NetSuite subsidiary into Expensify.
Once imported, Expensify will send them an email letting them know they've been added to a workspace.

### Set Approval Workflow

Besides inviting employees, you can also establish an approval process in NetSuite.

By doing this, the Approval Workflow in Expensify will automatically follow the same rules as NetSuite, typically starting with Manager Approval.

- **Basic Approval:** A single level of approval, where all users submit directly to a Final Approver. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Manager Approval (default):** Two levels of approval route reports first to an employee's NetSuite expense approver or supervisor, and second to a workspace-wide Final Approver. By NetSuite convention, Expensify will map to the supervisor if no expense approver exists. The Final Approver defaults to the workspace owner but can be edited on the people page. 
- **Configure Manually:** Employees will be imported, but all levels of approval must be manually configured on the workspace's People settings page. If you enable this setting, it’s recommended you review the newly imported employees and managers on the **Settings > Workspaces > Group > _[Workspace Name]_ > People page**. You can set a user role for each new employee and enforce an approval workflow.

## Automatically Create Employees/Vendors

With this feature enabled, Expensify will automatically create a new employee or vendor (if one doesn’t already exist) from the email of the report submitter in NetSuite. 

## Export Foreign Currency Amount

Using this feature allows you to send the original amount of the expense rather than the converted total when exporting to NetSuite. This option is available if you are exporting reimbursable expenses as Expense Reports.

## Cross-Subsidiary Customers/Projects 

This allows you to import Customers and Projects across all subsidiaries to a single group workspace. For this functionality, you must enable "Intercompany Time and Expense" in NetSuite. 

That feature is found in NetSuite under _Setup > Company > Setup Tasks: Enable Features > Advanced Features_.

## Sync Reimbursed Reports

If you're using Expensify's Direct Deposit ACH feature and you want to export reimbursable expenses as either Expense Reports or Vendor Bills in NetSuite, here's what to do:
1. In Expensify, go to the Advanced Settings tab
2. Look for a toggle or switch related to this feature
3. Turn it on by clicking the toggle
4. Select the correct account for the Bill Payment in NetSuite
5. Ensure the account you choose matches the default account for Bill Payments in NetSuite

That's it! When Expensify reimburses an expense report, it will automatically create a corresponding Bill Payment in NetSuite.

Alternatively, if reimbursing outside of Expensify, this feature will automatically update the expense report status in Expensify from Approved to Reimbursed when the respective report is paid in NetSuite and the corresponding workspace syncs via Auto-Sync or when the integration connection is manually synced.

## Setting Approval Levels

With this setting enabled, you can set approval levels based on your export type. 

- **Expense Reports:** These options correspond to the default preferences in NetSuite – “Supervisor approval only,” “Accounting approval only,” or “Supervisor and Accounting approved.”
- **Vendor Bills or Journal Entries:** These options correspond to the default preferences in NetSuite –  “Pending Approval” or “Approved for Posting.”

If you have Approval Routing selected in your accounting preference, this will override the selections in Expensify. 

If you do not wish to use Approval Routing in NetSuite, go to _Setup > Accounting > Accounting Preferences > Approval Routing_ and ensure Vendor Bills and Journal Entries are not selected. 

### Collection Account

When exporting invoices, once marked as Paid, the payment is marked against the account selected after enabling the Collection Account setting.

# Deep Dive

## Categories

You can use the Auto-Categorization feature so that expenses are automatically categorized. 

To set Category Rules (e.g., receipt requirements or comments), go to the categories page in the workspace under **Settings > Workspaces > _[Workspace Name]_ > Categories**. 

With this setting enabled, when an Expense Category updates in NetSuite, it will update in Expensify automatically. 

## Company Cards

NetSuite's company card feature simplifies exporting reimbursable and non-reimbursable transactions to your General Ledger (GL). This approach is recommended for several reasons:

1. **Separate Employees from Vendors:** NetSuite allows you to maintain separate employee and vendor records. This feature proves especially valuable when integrating with Expensify. By utilizing employee defaults for classifications, your employees won't need to apply tags to all their expenses manually.
2. **Default Accounts Payable (A/P) Account:** Expense reports enable you to set a default A/P account for export on your subsidiary record. Unlike vendor bills, where the A/P account defaults to the last selected account, the expense report export option allows you to establish a default A/P account.
3. **Mix Reimbursable and Non-Reimbursable Expenses:** You can freely mix reimbursable and non-reimbursable expenses without categorizing them in NetSuite after export. NetSuite's corporate card feature automatically categorizes expenses into the correct GL accounts, ensuring a neat and organized GL impact.

#### Let’s go over an example! 

Consider an expense report with one reimbursable and one non-reimbursable expense. Each needs to be exported to different accounts and expense categories.

In NetSuite, you can quickly identify the non-reimbursable expense marked as a corporate card expense. Reviewing the GL impact, you'll notice that the reimbursable expense is posted to the default A/P account set on the subsidiary record. On the other hand, the company card expense is assigned to the Credit Card account, which can either be set as a default on the subsidiary record (for a single account) or the employee record (for individual credit card accounts in NetSuite).

Furthermore, each expense is categorized according to your selected expense category.

You'll need to set up default corporate cards in NetSuite to use the expense report option for your corporate card expenses.

For non-reimbursable expenses, choose the appropriate card on the subsidiary record. You can find the default in your accounting preferences if you're not using a OneWorld account.

Add the corporate card option and the corporate card main field to configure your expense report transaction form in NetSuite:
1. Go to _Customization > Forms > Transaction Forms > Preferred expense report form > Screen Fields_
2. Under the Main tab, check "Show for Account for Corporate Card Expenses"
3. On the Expenses tab, check "Show for Corporate Card"

If you prefer individual corporate cards for each employee, you can select the default account on the employee record. Add this field to your employee entity form in NetSuite (under _Customize > Customize Form_ from any employee record). Note that each employee can have only one corporate card account default.

### Exporting Company Cards to GL Accounts in NetSuite

If you need to export company card transactions to individual GL accounts, you can set that up at the domain level. 

Let’s go over how to do that: 
1. Go to **Settings > Domain > _[Domain name]_ > Company Cards**
2. Click the Export Settings cog on the right-hand side of the card and select the GL account where you want the expenses to export

After setting the account, exported expenses will be mapped to that designated account.

## Tax 

You’ll want to set up Tax Groups in Expensify if you're keeping track of taxes.

Expensify can import "NetSuite Tax Groups" (not Tax Codes) from NetSuite. Tax Groups can contain one or more Tax Codes. If you have subsidiaries in the UK or Ireland, ensure your Tax Groups have only one Tax Code.

You can locate these in NetSuite by setting up> Accounting > Tax Groups.

You’ll want to name Tax Groups something that makes sense to your employees since both the name and the tax rate will appear in Expensify.

To bring NetSuite Tax Groups into Expensify, here's what you need to do:
1. Create your Tax Groups in NetSuite by going to _Setup > Accounting > Tax Groups_
2. Click **New**
3. Pick the country for your Tax Group
4. Enter the Tax Name (this will be visible to your employees in Expensify)
5. Next, select the subsidiary for this Tax Group 
6. Finally, from the table, choose the Tax Code you want to include in this Tax Group
7. Click **Add**, then click **Save**

Repeat those steps for each tax rate you want to use in Expensify. 

Next, ensure that Tax Groups can be applied to expenses: 
1. In NetSuite, head to _Setup > Accounting > Set Up Taxes_
2. Set the preference for "Tax Code Lists Include" to either "Tax Groups And Tax Codes" or "Tax Groups Only." If you don't see this field, don't worry; it means you don't need to set it for that specific country

NetSuite has a pre-made list of tax groups for specific locations, but you can also create your own. We'll import both your custom tax groups and the default ones. It's important not to deactivate the default NetSuite tax groups because we rely on them for exporting specific types of expenses.

For example, there's a default Canadian tax group called CA-Zero, which we use when exporting mileage and per diem expenses that don't have any taxes applied in 

Expensify. If you deactivate this group in NetSuite, it will lead to export errors.

Additionally, some tax nexuses in NetSuite have specific settings that need to be configured in a certain way to work seamlessly with the Expensify integration:
- ​​In the Tax Code Lists Include field, choose "Tax Groups" or "Tax Groups and Tax Codes." This setting determines how tax information is handled.
- In the Tax Rounding Method field, select "Round Off." Although it won't cause connection errors, not using this setting can result in exported amounts differing from what NetSuite expects.

If your tax groups are importing into Expensify but not exporting to NetSuite, check that each tax group has the right subsidiaries enabled. That is crucial for proper data exchange.

## Multi-Currency

When using multi-currency features with NetSuite, remember these points:

**Matching Currencies:** The currency set for a vendor or employee record must match the currency chosen for the subsidiary in your Expensify configuration. This alignment is crucial for proper handling.

**Foreign Currency Conversion:** If you create expenses in one currency and then convert them to another currency within Expensify before exporting, you can include both the original and converted amounts in the exported expense reports. This option, called "Export foreign currency amount," can be found in the Advanced tab of your configuration. Note that Expensify sends only the amounts; the actual currency conversion is performed in NetSuite.

**Bank Account Currency:** When synchronizing bill payments, make sure your bank account's currency matches the subsidiary's currency. Failure to do so will result in an "Invalid Account" error. This alignment is necessary to prevent issues during payment processing.

## Exporting Invoices

When you mark an invoice as paid in Expensify, the paid status syncs with NetSuite and vice versa!

Let's dive right in:
1. Access Configuration Settings: Go to **Settings > Workspace > Group > _[Workspace Name]_ > Connections > Configuration**
2. Choose Your Accounts Receivable Account: Scroll down to "Export Expenses to" and select the appropriate Accounts Receivable account from the dropdown list. If you don't see any options, try syncing your NetSuite connection by returning to the Connections page and clicking **Sync Now**

### Exporting an Invoice to NetSuite

Invoices will be automatically sent to NetSuite when they are in the "Processing" or "Paid" status. This ensures you always have an up-to-date record of unpaid and paid invoices.

If you have Auto Sync disabled, you'll need to export your invoices, along with your expense reports, manually. Follow these three simple steps:
1. Filter Invoices: From your Reports page, use filters to find the invoices you want to export.
2. Select Invoices: Pick the invoices ready for export.
3. Export to NetSuite: Click **Export to NetSuite** in the top right-hand corner.

When exporting to NetSuite, we match the recipient's email address on the invoice to a customer record in NetSuite, meaning each customer in NetSuite must have an email address in their profile. If we can't find a match, we'll create a new customer in NetSuite.

Once exported, the invoice will appear in the Accounts Receivable account you selected during your NetSuite Export configuration.

### Updating an Invoice to paid

When you mark an invoice as "Paid" in Expensify, this status will automatically update in NetSuite. Similarly, if the invoice is marked as "Paid" in NetSuite, it will sync with Expensify. The payment will be reflected in the Collection account specified in your Advanced Settings Configuration.

## Download NetSuite Logs

Sometimes, we might need more details from you to troubleshoot issues with your NetSuite connection. Providing the NetSuite web services usage logs is incredibly useful. 

Here's how you can send them to us:
1. **Generate the Logs:** Start by trying to export a report from your system. This action will create the most recent logs that we require.
2. **Access Web Services Usage Logs:** You can locate these logs in your NetSuite account. Just use the global search bar at the top of the page and type in "Web Services Usage Log."
3. **Identify the Logs:** Look for the most recent log entry. It should have "FAILED" under the STATUS column. Click on the two blue "view" links under the REQUEST and RESPONSE columns. These are the two .xml files we need to examine.

Send these two files to your Account Manager or Concierge so we can continue troubleshooting! 

# FAQ

## What type of Expensify plan is required for connecting to NetSuite?

You need a group workspace on a Control Plan to integrate with NetSuite. 

## How does Auto Sync work with reimbursed reports? 

If a report is reimbursed via ACH or marked as reimbursed in Expensify and then exported to NetSuite, the report is automatically marked as paid in NetSuite during the next sync.

If a report is exported to NetSuite and then marked as paid in NetSuite, the report is automatically marked as reimbursed in Expensify during the next sync. 

## If I enable Auto Sync, what happens to existing approved and reimbursed reports? 

If you previously had Auto Sync disabled but want to allow that feature to be used going forward, you can safely turn on Auto Sync without affecting existing reports. Auto Sync will only take effect for reports created after enabling that feature.
