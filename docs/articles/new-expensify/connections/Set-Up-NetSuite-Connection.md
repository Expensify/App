---
title: Set up NetSuite connection
description: Integrate NetSuite with Expensify
---
<div id="new-expensify" markdown="1">

# Connect to NetSuite

## Overview
Expensify’s integration with NetSuite allows you to sync data between the two systems. Before you start connecting Expensify with NetSuite, there are a few things to note:

- You must use NetSuite administrator credentials to initiate the connection
- A Control Plan in Expensify is required to integrate with NetSuite
- Employees don’t need NetSuite access or a NetSuite license to submit expense reports and sync them to NetSuite
- Each NetSuite subsidiary must be connected to a separate Expensify workspace
- The workspace currency in Expensify must match the NetSuite subsidiary's default currency

## Step 1: Install the Expensify Bundle in NetSuite
1. While logged into NetSuite as an administrator, go to **Customization > SuiteBundler > Search & Install Bundles**, then search for “Expensify”
2. Click on the Expensify Connect bundle (Bundle ID 283395)
3. Click **Install**
4. If you already have the Expensify Connect bundle installed, head to **Customization > SuiteBundler > Search & Install Bundles > List**, and update it to the latest version
5. Select "Show on Existing Custom Forms" for all available fields

## Step 2: Enable Token-Based Authentication
1. In NetSuite, go to **Setup > Company > Enable Features > SuiteCloud > Manage Authentication**
2. Make sure “Token Based Authentication” is enabled
3. Click **Save**


## Step 3: Add Expensify Integration Role to a User
1. In NetSuite, head to **Lists > Employees**, and find the user who you would like to add the Expensify Integration role to. The user you select must at least have access to the permissions included in the Expensify Integration Role, and Admin access works too, but Admin access is not required.
2. Click **Edit > Access**, then find the Expensify Integration role in the dropdown and add it to the user
3. Click **Save**

Remember that Tokens are linked to a User and a Role, not solely to a User. It’s important to note that you cannot establish a connection with tokens using one role and then switch to another role afterward. Once you’ve initiated a connection with tokens, you must continue using the same token/user/role combination for all subsequent sync or export actions.

## Step 4: Create Access Tokens
1. In NetSuite, enter “page: tokens” in the Global Search
2. Click **New Access Token**
3. Select Expensify as the application (this must be the original Expensify integration from the bundle)
4. Select the role Expensify Integration
5. Click **Save**
6. Copy and paste the token and token ID to a saved location on your computer (this is the only time you will see these details)

## Step 5: Confirm Expense Reports are enabled in NetSuite
Expense Reports must be enabled in order to use Expensify’s integration with NetSuite.

1. In NetSuite, go to **Setup > Company > Enable Features > Employees**
2. Confirm the checkbox next to "Expense Reports" is checked
3. If not, click the checkbox and then click **Save** to enable Expense Reports

## Step 6: Confirm Expense Categories are set up in NetSuite
Once Expense Reports are enabled, Expense Categories can be set up in NetSuite. Expense Categories are synced to Expensify as Categories. Each Expense Category is an alias mapped to a General Ledger account so that employees can more easily categorize expenses.

1. In NetSuite, go to **Setup > Accounting > Expense Categories** (a list of Expense Categories should show)
2. If no Expense Categories are visible, click **New** to create new ones

## Step 7: Confirm Journal Entry Transaction Forms are Configured Properly
1. In NetSuite, go to **Customization > Forms > Transaction Forms**
2. Click **Customize** or **Edit** next to the Standard Journal Entry form
3. Click **Screen Fields > Main**. Please verify the “Created From” label has “Show” checked and the "Display Type" is set to "Normal"
4. Click the sub-header **Lines** and verify that the “Show” column for “Receipt URL” is checked
5. Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the journal type have this same configuration

## Step 8: Confirm Expense Report Transaction Forms are Configured Properly
1. In NetSuite, go to **Customization > Forms > Transaction Forms**
2. Click **Customize** or **Edit** next to the Standard Expense Report form, then click **Screen Fields > Main**
3. Verify the “Created From” label has “Show” checked and the "Display Type" is set to "Normal"
4. Click the second sub-header, **Expenses**, and verify that the "Show" column for "Receipt URL" is checked
5. Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the expense report type have this same configuration

## Step 9: Confirm Vendor Bill Transactions Forms are Configured Properly
1. In NetSuite, go to **Customization > Forms > Transaction Forms**
2. Click **Customize** or **Edit** next to your preferred Vendor Bill form
3. Click **Screen Fields > Main** and verify that the “Created From” label has “Show” checked and that Departments, Classes, and Locations have the “Show” label unchecked
4. Under the **Expenses** sub-header (make sure to click the “Expenses” sub-header at the very bottom and not “Expenses & Items”), ensure “Show” is checked for Receipt URL, Department, Location, and Class
5. Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the vendor bill type have this same configuration

## Step 10: Confirm Vendor Credit Transactions Forms are Configured Properly
1. In NetSuite, go to **Customization > Forms > Transaction Forms**
2. Click **Customize** or **Edit** next to your preferred Vendor Credit form, then click **Screen Fields > Main** and verify that the “Created From” label has “Show” checked and that Departments, Classes, and Locations have the “Show” label unchecked
3. Under the **Expenses** sub-header (make sure to click the “Expenses” sub-header at the very bottom and not “Expenses & Items”), ensure “Show” is checked for Receipt URL, Department, Location, and Class
4. Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the vendor credit type have this same configuration

## Step 11: Set up Tax Groups (only applicable if tracking taxes)
Expensify imports NetSuite Tax Groups (not Tax Codes), which you can find in NetSuite under **Setup > Accounting > Tax Groups**.

Tax Groups are an alias for Tax Codes in NetSuite and can contain one or more Tax Codes (Please note: for UK and Ireland subsidiaries, please ensure your Tax Groups do not have more than one Tax Code). We recommend naming Tax Groups so your employees can easily understand them, as the name and rate will be displayed in Expensify.

To set up Tax Groups in NetSuite:

1. Go to **Setup > Accounting > Tax Groups**
2. Click **New**
3. Select the country for your Tax Group
4. Enter the Tax Name (this is what employees will see in Expensify)
5. Select the subsidiary for this Tax Group
6. Select the Tax Code from the table you wish to include in this Tax Group
7. Click **Add**
8. Click **Save**
9. Create one NetSuite Tax Group for each tax rate you want to show in Expensify

Ensure Tax Groups can be applied to expenses by going to **Setup > Accounting > Set Up Taxes** and setting the Tax Code Lists Include preference to “Tax Groups And Tax Codes” or “Tax Groups Only.” If this field does not display, it’s not needed for that specific country.

## Step 12: Connect Expensify to NetSuite
1. Log into Expensify as a workspace admin
2. Click your profile image or icon in the bottom left menu
3. Scroll down and click **Workspaces** in the left menu
4. Select the workspace you want to connect to NetSuite
5. Click **More features** in the left menu
6. Scroll down to the Integrate section and enable Accounting
7. Click **Accounting** in the left menu
8. Click **Set up** next to NetSuite
9. Click **Next** until you reach setup step 5 (If you followed the instructions above, then the first four setup steps will be complete)
10. On setup step 5, enter your NetSuite Account ID, Token ID, and Token Secret (the NetSuite Account ID can be found in NetSuite by going to **Setup > Integration > Web Services Preferences**)
11. Click **Confirm** to complete the setup

After completing the setup, the NetSuite connection will sync. It can take 1-2 minutes to sync with NetSuite.

Once connected, all reports exported from Expensify will be generated in NetSuite using SOAP Web Services (the term NetSuite employs when records are created through the integration).

## FAQ
### What type of Expensify plan is required to connect to NetSuite?
You need a Control workspace to integrate with NetSuite. If you have a Collect workspace, you will need to upgrade to Control.

### Page size
Make sure your page size is set to 1000 in NetSuite for importing your customers and vendors. Go to **Setup > Integration > Web Services Preferences** and search **Page Size** to determine your page size.


# Configure NetSuite integration
## Step 1: Configure import settings

The following section will help you determine how data will be imported from NetSuite into Expensify. To change your import settings, navigate to the Accounting settings for your workspace, then click **Import** under the NetSuite connection.

### Expense Categories
Your NetSuite Expense Categories are automatically imported into Expensify as categories. This cannot be amended, and any new categories you'd like to add must be added as Expense Categories in NetSuite.

Once imported, you can turn specific Categories on or off under **Settings > Workspaces > [Workspace Name] > Categories**.

### Departments, Classes, and Locations
The NetSuite integration allows you to import departments, classes, and locations from NetSuite into Expensify as Tags, Report Fields, or using the NetSuite Employee Default.

- **NetSuite Employee Default:** If default Department, Class, and Locations have been configured on NetSuite employee records, then you can choose to have the NetSuite employee default applied upon export from Expensify to NetSuite. With this selection, employees will not make a selection in Expensify.
- **Tags:** Employees can select the department, class, or location on each individual expense. If the employee's NetSuite employee record has a default value, then each expense will be defaulted to that tag upon creation, with the option for the employee to select a different value on each expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.


New departments, classes, and locations must be added in NetSuite. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.

### Customers and Projects
The NetSuite integration allows you to import customers and projects into Expensify as Tags or Report Fields.

- **Tags:** Employees can select the customer or project on each individual expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.

New customers and projects must be added in NetSuite. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.

When importing customers or projects, you can also choose to enable **Cross-subsidiary customers/projects**. This setting allows you to import Customers and Projects across all NetSuite subsidiaries to a single Expensify workspace. This setting requires you to enable “Intercompany Time and Expense” in NetSuite. To enable that feature in NetSuite, go to **Setup > Company > Setup Tasks: Enable Features > Advanced Features**.

### Tax
The NetSuite integration allows users to apply a tax rate and amount to each expense for non-US NetSuite subsidiaries. To do this, import Tax Groups from NetSuite:

1. In NetSuite, head to **Setup > Accounting > Tax Groups**
2. Once imported, go to the NetSuite connection configuration page in Expensify (under **Settings > Workspaces > [Workspace Name] > Accounting > NetSuite > Import**)
3. Enable Tax
4. Go back to the Accounting screen, click the three dots next to NetSuite, and click **Sync now**
5. All Tax Groups for the connected NetSuite subsidiary will be imported to Expensify as taxes.
6. After syncing, go to **Settings > Workspace > [Workspace Name] > Tax** to see the tax groups imported from NetSuite

### Custom Segments
You can import one or more Custom Segments from NetSuite for selection in Expensify. To add a Custom Segment to your Expensify workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**
2. Click **Import** under NetSuite
3. Click **Custom segments/records**
4. Click **Add custom segment/record**

From there, you'll walk through a simple setup wizard. You can find detailed instructions below for each setup step.

1. In Step 1, you'll select whether you'd like to import a custom segment or a custom record. For a Custom Segment, continue. We have separate instructions for [Custom Records](link) and [Custom Lists](link).
2. **Segment Name**
    a. Log into NetSuite as an administrator
    b. Go to **Customization > Lists, Records, & Fields > Custom Segments**
    c. You’ll see the Segment Name on the Custom Segments page
3. Internal ID
    a. Ensure you have internal IDs enabled in NetSuite under **Home > Set Preferences**
    b. Navigate back to the **Custom Segments** page
    c. Click the **Custom Record Type** link
    d. You’ll see the Internal ID on the Custom Record Type page
4. **Script ID/Field ID**
    a. If configuring Custom Segments as Report Fields, use the Field ID on the Transactions tab (under **Custom Segments > Transactions**). If no Field ID is shown, use the unified ID (just called “ID” right below the “Label”).
    b. If configuring Custom Segments as Tags, use the Field ID on the Transaction Columns tab (under **Custom Segments > Transaction Columns**). If no Field ID is shown, use the unified ID (just called “ID” right below the “Label”).
    c. Note that as of 2019.1, any new custom segments that you create automatically use the unified ID, and the "Use as Field ID" box is not visible. If you are editing a custom segment definition that was created before 2019.1, the "Use as Field ID" box is available. To use a unified ID for the entire custom segment definition, check the "Use as Field ID" box. When the box is checked, no field ID fields or columns are shown on the Application & Sourcing subtabs because one ID is used for all fields.
5. Select whether you'd like to import the custom segment as Tags or Report Fields
6. Finally, confirm that all the details look correct

**Note:** Don’t use the “Filtered by” feature available for Custom Segments. Expensify can’t make these dependent on other fields. If you do have a filter selected, we suggest switching that filter in NetSuite to “Subsidiary” and enabling all subsidiaries to ensure you don’t receive any errors upon exporting reports.

### Custom Records
You can import one or more Custom Records from NetSuite for selection in Expensify. To add a Custom Record to your Expensify workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**
2. Click **Import** under NetSuite
3. Click **Custom segments/records**
4. Click **Add custom segment/record**

From there, you'll walk through a simple setup wizard. You can find detailed instructions below for each setup step.

1. In Step 1, you'll select whether you'd like to import a custom segment or a custom record. For a Custom Record, continue. We have separate instructions for [Custom Segments](link) and [Custom Lists](link).
2. **Segment Name**
    a. Log into NetSuite as an administrator
    b. Go to **Customization > Lists, Records, & Fields > Custom Segments**
    c. You’ll see the Custom Record Name on the Custom Segments page
3. **Internal ID**
    a. Make sure you have Internal IDs enabled in NetSuite under **Home > Set Preferences**
    b. Navigate back to the **Custom Segment** page
    c. Click the **Custom Record Type** hyperlink
    d. You’ll see the Internal ID on the Custom Record Type page
4. **Transaction Column ID**
    a. If configuring Custom Records as Report Fields, use the Field ID on the Transactions tab (under **Custom Segments > Transactions**).
    b. If configuring Custom Records as Tags, use the Field ID on the Transaction Columns tab (under **Custom Segments > Transaction Columns**).
5. Select whether you'd like to import the custom record as Tags or Report Fields
6. Finally, confirm that all the details look correct

### Custom Lists
You can import one or more Custom Lists from NetSuite for selection in Expensify. To add a Custom List to your Expensify workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**
2. Click **Import** under NetSuite
3. Click **Custom list**
4. Click **Add custom list**

From there, you'll walk through a simple setup wizard. You can find detailed instructions below for each setup step.

1. In Step 1, you'll select which Custom List you'd like to import from a pre-populated list
2. **Transaction Line Field ID**
    a. Log into NetSuite as an admin
    b. Search **“Transaction Line Fields”** in the global search
    c. Click into the desired Custom List
    d. You'll find the transaction Line Field ID along the left-hand side of the page
3. Select whether you'd like to import the custom list as Tags or Report Fields
4. Finally, confirm that all the details look correct

From there, you should see the values for the Custom Lists under the Tag or Report Field settings in Expensify.
## Step 2: Configure export settings
There are numerous options for exporting data from Expensify to NetSuite. To access these settings, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Export** under NetSuite.

### Preferred Exporter
Any workspace admin can export reports to NetSuite. For auto-export, Concierge will export on behalf of the preferred exporter. The preferred exporter will also be notified of any expense reports that fail to export to NetSuite due to an error.

### Date
You can choose which date to use for the records created in NetSuite. There are three date options:

1. **Date of last expense:** This will use the date of the previous expense on the report
2. **Submitted date:** The date the employee submitted the report
3. **Exported date:** The date you export the report to NetSuite

### Export out-of-pocket expenses as
**Expense Reports**
Out-of-pocket expenses will be exported to NetSuite as expense reports, which will be posted to the payables account designated in NetSuite.

**Vendor Bills**
Out-of-pocket expenses will be exported to NetSuite as vendor bills. Each report will be posted as payable to the vendor associated with the employee who submitted the report. You can also set an approval level in NetSuite for vendor bills.

**Journal Entries**
Out-of-pocket expenses will be exported to NetSuite as journal entries. All the transactions will be posted to the payable account specified in the workspace. You can also set an approval level in NetSuite for the journal entries.

Note: By default, journal entry forms do not contain a customer column, so it is not possible to export customers or projects with this export option. Also, The credit line and header level classifications are pulled from the employee record.

### Export company card expenses as
**Expense Reports**
To export company card expenses as expense reports, you will need to configure your default corporate cards in NetSuite. To do this, you must select the correct card on the NetSuite employee records (for individual accounts) or the subsidiary record (If you use a non-One World account, the default is found in your accounting preferences).

To update your expense report transaction form in NetSuite:

1. Go to **Customization > Forms > Transaction Forms**
2. Click **Edit** next to the preferred expense report form
3. Go to the **Screen Fields > Main** tab
4. Check “Show” for "Account for Corporate Card Expenses"
5. Go to the **Screen Fields > Expenses** tab
6. Check “Show” for "Corporate Card"

You can also select the default account on your employee record to use individual corporate cards for each employee. Make sure you add this field to your employee entity form in NetSuite. If you have multiple cards assigned to a single employee, you cannot export to each account. You can only have a single default per employee record.

**Vendor Bills**
Company card expenses will be posted as a vendor bill payable to the default vendor specified in your workspace Accounting settings. You can also set an approval level in NetSuite for the bills.


**Journal Entries**
Company Card expenses will be posted to the Journal Entries posting account selected in your workspace Accounting settings.

Important Notes:

- Expensify Card expenses will always export as Journal Entries, even if you have Expense Reports or Vendor Bills configured for non-reimbursable expenses on the Export tab
- Journal entry forms do not contain a customer column, so it is not possible to export customers or projects with this export option
- The credit line and header level classifications are pulled from the employee record

### Export invoices to
Select the Accounts Receivable account where you want your Invoice reports to export. In NetSuite, the invoices are linked to the customer, corresponding to the email address where the invoice was sent.

### Export foreign currency amount
Enabling this feature allows you to send the original amount of the expense rather than the converted total when exporting to NetSuite. This option is only available when exporting out-of-pocket expenses as Expense Reports.

### Export to next open period
When this feature is enabled and you try exporting an expense report to a closed NetSuite period, we will automatically export to the next open period instead of returning an error.


## Step 3: Configure advanced settings
To access the advanced settings of the NetSuite integration, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Advanced** under NetSuite.


Let’s review the different advanced settings and how they interact with the integration.

### Auto-sync
We strongly recommend enabling auto-sync to ensure that the information in NetSuite and Expensify is always in sync. The following will occur when auto-sync is enabled:

**Daily sync from NetSuite to Expensify:** Once a day, Expensify will sync any changes from NetSuite into Expensify. This includes any new, updated, or removed departments/classes/locations/projects/etc.

**Auto-export:** When an expense report reaches its final state in Expensify, it will be automatically exported to NetSuite. The final state will either be reimbursement (if you reimburse members through Expensify) or final approval (if you reimburse members outside of Expensify).

**Reimbursement-sync:** If Sync Reimbursed Reports (more details below) is enabled, then we will sync the reimbursement status of reports between Expensify and NetSuite.

### Sync reimbursed reports
When Sync reimbursed reports is enabled, the reimbursement status will be synced between Expensify and NetSuite.

**If you reimburse members through Expensify:** Reimbursing an expense report will trigger auto-export to NetSuite. When the expense report is exported to NetSuite, a corresponding bill payment will also be created in NetSuite.

**If you reimburse members outside of Expensify:** Expense reports will be exported to NetSuite at time of final approval. After you mark the report as paid in NetSuite, the reimbursed status will be synced back to Expensify the next time the integration syncs.

To ensure this feature works properly for expense reports, make sure that the reimbursement account you choose within the settings matches the default account for Bill Payments in NetSuite. When exporting invoices, once marked as Paid, the payment is marked against the account selected after enabling the Collection Account setting.

### Invite employees and set approvals
Enabling this feature will invite all employees from the connected NetSuite subsidiary to your Expensify workspace. Once imported, Expensify will send them an email letting them know they’ve been added to a workspace.

In addition to inviting employees, this feature enables a custom set of approval workflow options, which you can manage in Expensify Classic:

- **Basic Approval:** A single level of approval, where all users submit directly to a Final Approver. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Manager Approval (default):** Two levels of approval route reports first to an employee’s NetSuite expense approver or supervisor, and second to a workspace-wide Final Approver. By NetSuite convention, Expensify will map to the supervisor if no expense approver exists. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Configure Manually:** Employees will be imported, but all levels of approval must be manually configured on the workspace’s People settings page. If you enable this setting, it’s recommended you review the newly imported employees and managers on the **Settings > Workspaces > Group > [Workspace Name] > People** page.

### Auto-create employees/vendors
With this feature enabled, Expensify will automatically create a new employee or vendor in NetSuite (if one doesn’t already exist) using the name and email of the report submitter.

### Enable newly imported categories
With this feature enabled, anytime a new Expense Category is created in NetSuite, it will be imported into Expensify as an enabled category. If the feature is disabled, then new Expense Categories will be imported into Expensify as disabled.

### Setting approval levels
You can set the NetSuite approval level for each different export type:

- **Expense report approval level:** Choose from "NetSuite default preference," “Only supervisor approved,” “Only accounting approved,” or “Supervisor and accounting approved.”
- **Vendor bill approval level and Journal entry approval level:** Choose from "NetSuite default preference," “Pending approval,” or “Approved for posting.”

If you have Approval Routing selected in your accounting preference, this will override the selections in Expensify. If you do not wish to use Approval Routing in NetSuite, go to **Setup > Accounting > Accounting Preferences > Approval Routing** and ensure Vendor Bills and Journal Entries are not selected.

### Custom form ID
By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you have the option to designate a specific transaction form to be used.



## FAQ

### How does Auto-sync work with reimbursed reports?
If a report is reimbursed via ACH or marked as reimbursed in Expensify and then exported to NetSuite, the report is automatically marked as paid in NetSuite.

If a report is exported to NetSuite, then marked as paid in NetSuite, the report will automatically be marked as reimbursed in Expensify during the next sync.

### Will enabling auto-sync affect existing approved and reimbursed reports?
Auto-sync will only export newly approved reports to NetSuite. Any reports that were approved or reimbursed before enabling auto-sync will need to be manually exported in order to sync them to NetSuite.


### When using multi-currency features in NetSuite, can expenses be exported with any currency?
When using multi-currency features with NetSuite, remember these points:

**Employee/Vendor currency:** The currency set for a NetSuite vendor or employee record must match the subsidiary currency for whichever subsidiary you export that user's reports to. A currency mismatch will cause export errors.
**Bank Account Currency:** When synchronizing bill payments, your bank account’s currency must match the subsidiary’s currency. Failure to do so will result in an “Invalid Account” error.
