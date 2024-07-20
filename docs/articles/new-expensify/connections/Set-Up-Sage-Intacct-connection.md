---
title: Set up Sage Intacct connection
description: Integrate Sage Intacct with Expensify
---
<div id="new-expensify" markdown="1">

# Connect to Sage Intacct

## Overview
Expensify’s integration with Sage Intacct allows you to connect using either role-based permissions or user-based permissions and exporting either expense reports or vendor bills.

Checklist of items to complete:

1. Create a web services user and configure permissions
1. Enable the T&E module (only required if exporting out-of-pocket expenses as Expense Reports)
1. Set up Employees in Sage Intacct (only required if exporting expenses as Expense Reports)
1. Set up Expense Types (only required if exporting expenses as Expense Reports)
1. Enable Customization Services
1. Download the Expensify Package
1. Upload the Expensify Package in Sage Intacct
1. Add web services authorization
1. Enter credentials and connect Expensify and Sage Intacct
1. Configure integration sync options

## Step 1a: Create a web services user (Connecting with User-based permissions)
Note: If the steps in this section look different in your Sage Intacct instance, you likely use role-based permissions. If that’s the case, follow the steps [here].

To connect to Sage Intacct, you’ll need to create a special web services user (please note that Sage Intacct does not charge extra for web services users).

1. Go to **Company > Web Services Users > New**.
2. Configure the user as outlined below:
    - **User ID**: “xmlgateway_expensify”
    - **Last Name and First Name:** “Expensify”
    - **Email Address:** Your shared accounting team email
    - **User Type:** “Business”
    - **Admin Privileges:** “Full”
    - **Status:** “Active”

Next, configure correct permissions for the new web services user.

1. Go to the subscription link for this user in the user list
1. Click on the checkbox next to the Application/Module
1. Click **Permissions**

These are the permissions required for this integration when exporting out-of-pocket expenses as vendor bills:

- **Administration (All)**
- **Company (Read-only)**
- **Cash Management (All)**
- **General Ledger (All)**
- **Time & Expense (All)** - Only required if exporting out-of-pocket expenses as expense reports
- **Projects (Read-only)** - Only required if using Projects or Customers
- **Accounts Payable (All)** - Only required if exporting any expenses expenses as vendor bills

## Step 1b: Create a web services user (Connecting with Role-based permissions)
Note: If the steps in this section look different in your Sage Intacct instance, you likely use role-based permissions. If that’s the case, follow the steps [here].

**First, you'll need to create the new role:**

1. In Sage Intacct, click **Company**, then click on the **+ button** next to Roles
1. Name the role "Expensify", then click **Save**
1. Go to **Roles > Subscriptions** and find the “Expensify” role you just created
1. Configure correct permissions for this role by clicking the checkbox and then clicking on the Permissions hyperlink. These are the permissions required for this integration when exporting out-of-pocket expenses as vendor bills:
    - **Administration (All)**
    - **Company (Read-only)**
    - **Cash Management (All)**
    - **General Ledger (All)**
    - **Time & Expense (All)** - Only required if exporting out-of-pocket expenses as expense reports
    - **Projects (Read-only)** - Only required if using Projects or Customers
    - **Accounts Payable (All)** - Only required if exporting any expenses expenses as vendor bills

**Next, you’ll create a web services user and assign the role to that user:**

1. Go to **Company > Web Services Users > New**
2. Set up the user as described below:
    - **User ID:** “xmlgateway_expensify”
    - **Last name and First name:** “Expensify”
    - **Email address:** your shared accounting team email
    - **User type:** “Business”
    - **Admin privileges:** “Full”
    - **Status:** “Active”
3. Assign the role to that user: click the **+ button**, then select the “Expensify” role and click **Save**


## Step 2: Enable and configure the Time & Expenses Module
**Note: This step is only required if exporting out-of-pocket expenses from Expensify to Sage Intacct as Expense Reports.**

Enabling the T&E module is a paid subscription through Sage Intacct and the T&E module is often included in your Sage Intacct instance. For information on the costs of enabling this module, please contact your Sage Intacct account manager.

**To enable the Time & Expenses module:**

In Sage Intacct, go to **Company menu > Subscriptions > Time & Expenses** and toggle the switch to subscribe.

**After enabling T&E, configure it as follows:**

1. Ensure that **Expense types** is checked
2. Under **Auto-numbering sequences** set the following:
    - **Expense Report:** EXP
    - **Employee:** EMP
    - **Duplicate Numbers:** Select “Do not allow creation”
    - To create the EXP sequence, click on the down arrow on the expense report line and select **Add:
        1. **Sequence ID:** EXP
        1. **Print Title:** EXPENSE REPORT
        1. **Starting Number:** 1
        1. **Next Number:** 2
3. Select **Advanced Settings** and configure the following:
    a. **Fixed Number Length:** 4
    b. **Fixed Prefix:** EXP
4. Click **Save**
5. Under Expense Report approval settings, ensure that **Enable expense report approval** is unchecked
6. Click **Save** to confirm your configuration


## Step 3: Set up Employees in Sage Intacct
**Note: This step is only required if exporting out-of-pocket expenses from Expensify to Sage Intacct as Expense Reports.**

To set up employees in Sage Intacct:

1. Navigate to Time & Expenses and click the **plus button** next to Employees.
    - If you don’t see the Time & Expense option in the top ribbon, you may need to adjust your settings. Go to **Company > Roles > Time & Expenses** and enable all permissions.
2. To create an employee, you’ll need to provide the following information:
    - Employee ID
    - Primary contact name
    - Email address
        1. In the "Primary contact name" field, click the dropdown arrow.
        1. Select the employee if they’ve already been created.
        1. Otherwise, click **+ Add** to create a new employee.
        1. Fill in their Primary Email Address along with any other required information


## Step 4: Set up Expense Types in Sage Intacct
**Note: This step is only required if exporting out-of-pocket expenses from Expensify to Sage Intacct as Expense Reports.**

Expense Types provide a user-friendly way to display the names of your expense accounts to your employees. To set up expense types in Sage Intacct:

1. **Setup Your Chart of Accounts**
    - Before configuring Expense Types, ensure your Chart of Accounts is set up. You can set up accounts in bulk by going to **Company > Open Setup > Company Setup Checklist** and clicking **Import**.
2. **Set up Expense Types**
    - Go to Time & Expense
    - Open Setup and click the **plus button** next to Expense Types
3. For each Expense Type, provide the following information:
    - **Expense Type**
    - **Description**
    - **Account Number** (from your General Ledger)

## Step 5: Enable Customization Services
**Note:** If you already have Platform Services enabled, you can skip this step.

To enable Customization Services, go to **Company > Subscriptions > Customization Services**.


## Step 6: Download the Expensify Package
1. In Expensify, go to Settings > Workspaces
1. Click into the workspace where you'd like to connect to Sage Intacct
    - If you already use Expensify, you can optionally create a test workspace by clicking **New Workspace** at the top-right of the Workspaces page. A test workspace allows you to have a sandbox environment for testing before implementing the integration live.
1. Go to **Connections > Sage Intacct > Connect to Sage Intacct**
1. Select **Download Package** (You only need to download the file; we’ll upload it from your Downloads folder later)

## Step 7: Upload Package in Sage Intacct
If you use Customization Services:

1. Go to **Customization Services > Custom Packages > New Package**
1. Click on **Choose File** and select the Package file from your downloads folder
1. Click **Import**

If you use Platform Services:

1. Go to **Platform Services > Custom Packages > New Package**
1. Click on **Choose File** and select the Package file from your downloads folder
1. Click **Import**


## Step 8: Add Web Services Authorization
1. Go to **Company > Company Info > Security** in Sage Intacct and click **Edit**
2. Scroll down to **Web Services Authorizations** and add “expensify” (all lower case) as a Sender ID

## Step 9: Enter Credentials and Connect Expensify and Sage Intacct
1. In Expensify, go to **Settings > Workspaces > [Workspace Name] > Accounting**
1. Click **Set up** next to Sage Intacct
1. Enter the credentials you set for your web services user in Step 1
1. Click **Confirm**



# Configure Sage Intacct integration

## Step 1: Select entity (multi-entity setups only)
If you have a multi-entity setup in Sage Intacct, you will be able to select in Expensify which Sage Intacct entity to connect each workspace to. Each Expensify workspace can either be connected to a single entity or connected at the Top Level.

To select or change the Sage Intacct entity that your Expensify workspace is connected to, navigate to the Accounting settings for your workspace and click **Entity** under the Sage Intacct connection.

## Step 2: Configure import settings
The following section will help you determine how data will be imported from Sage Intacct into Expensify. To change your import settings, navigate to the Accounting settings for your workspace, then click **Import** under the Sage Intacct connection.

### Expense Types / Chart of Accounts
The categories in Expensify depend on how you choose to export out-of-pocket expenses:

- If you choose to export out-of-pocket expenses as Expense Reports, your categories in Expensify will be imported from your Sage Intacct Expense Types
- If you choose to export out-of-pocket expenses as Vendor Bills, your categories will be imported directly from your Chart of Accounts (also known as GL Codes or Account Codes).

You can disable unnecessary categories in Expensify by going to **Settings > Workspaces > [Workspace Name] > Categories**. Note that every expense must be coded with a Category, or it will fail to export.

### Billable Expenses
Enabling billable expenses allows you to map your expense types or accounts to items in Sage Intacct. To do this, you’ll need to enable the correct permissions on your Sage Intacct user or role. This may vary based on the modules you use in Sage Intacct, so you should enable read-only permissions for relevant modules such as Projects, Purchasing, Inventory Control, and Order Entry.

Once permissions are set, you can map categories to specific items, which will then export to Sage Intacct. When an expense is marked as Billable in Expensify, users must select the correct billable Category (Item), or there will be an error during export.


### Standard dimensions: Departments, Classes, and Locations
The Sage Intacct integration allows you to import standard dimensions into Expensify as tags, report fields, or using the Sage Intacct employee default.

- **Sage Intacct Employee default:** This option is only available when exporting as expense reports. When this option is selected, nothing will be imported into Expensify - instead, the employee default will be applied to each expense upon export.
- **Tags:** Employees can select the department, class, or location on each individual expense. If the employee's Sage Intacct employee record has a default value, then each expense will default to that tag, with the option for the employee to select a different value on each expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.

New departments, classes, and locations must be added in Sage Intacct. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.

Please note that when importing departments as tags, expense reports may show the tag name as "Tag" instead of "Department."

### Customers and Projects
The Sage Intacct integration allows you to import customers and projects into Expensify as Tags or Report Fields.

- **Tags:** Employees can select the customer or project on each individual expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.

New customers and projects must be added in Sage Intacct. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.


### Tax
The Sage Intacct integration supports native VAT and GST tax. To enable this feature, go to **Settings > Workspaces > [Workspace Name] > Accounting**, click **Import** under Sage Intacct, and enable Tax. Enabling this option will import your native tax rates from Sage Intacct into Expensify. From there, you can select default rates for each category under **Settings > Workspaces > [Workspace Name] > Categories**.

For older Sage Intacct connections that don't show the Tax option, simply resync the connection by going to **Settings > Workspaces > [Workspace Name] > Accounting** and clicking the three dots next to Sage Intacct, and the tax toggle will appear.

### User-Defined Dimensions
You can add User-Defined Dimensions (UDDs) to your workspace by locating the “Integration Name” in Sage Intacct. Please note that you must be logged in as an administrator in Sage Intacct to find the required fields.

To find the Integration Name in Sage Intacct:

1. Go to **Platform Services > Objects > List**
1. Set “filter by application” to “user-defined dimensions”
1. In Expensify, go to **Settings > Workspaces > [Workspace Name] > Accounting** and click **Import** under Sage Intacct
1. Enable User Defined Dimensions
1. Enter the “Integration name” and choose whether to import it into Expensify as expense-level tags or as report fields
1. Click **Save**

Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.


## Step 5: Configure export settings
To access export settings, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Export** under Sage Intacct.

### Preferred exporter
Any workspace admin can export reports to Sage Intacct. For auto-export, Concierge will export on behalf of the preferred exporter. The preferred exporter will also be notified of any expense reports that fail to export to Sage Intacct due to an error.

### Export date
You can choose which date to use for the records created in Sage Intacct. There are three date options:

1. **Date of last expense:** This will use the date of the previous expense on the report
1. **Export date:** The date you export the report to Sage Intacct
1. **Submitted date:** The date the employee submitted the report

### Export out-of-pocket expenses as
Out-of-pocket expenses can be exported to Sage Intacct as **expense reports** or as **vendor bills**. If you choose to export as expense reports, you can optionally select a **default vendor**, which will apply to reimbursable expenses that don't have a matching vendor in Sage Intacct.

### Export company card expenses as
Company Card expenses are exported separately from out-of-pocket expenses, and can be exported to Sage Intacct as credit card charges** or as **vendor bills**.

- **Credit card charges:** When exporting as credit card charges, you must select a credit card account. You can optionally select a default vendor, which will apply to company card expenses that don't have a matching vendor in Sage Intacct.
    - Credit card charges cannot be exported to Sage Intacct at the top-level if you have multi-currency enabled, so you will need to select an individual entity if you have this setup.
- **Vendor bills:** When exporting as vendor bills, you can select a default vendor, which will apply to company card expenses that don't have a matching vendor in Sage Intacct.

If you centrally manage your company cards through Domains in Expensify Classic, you can export expenses from each individual card to a specific account in Sage Intacct in the Expensify Company Card settings.

### 6. Configure advanced settings
To access the advanced settings of the Sage Intacct integration, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Advanced** under Sage Intacct.


Let’s review the different advanced settings and how they interact with the integration.

### Auto-sync
We strongly recommend enabling auto-sync to ensure that the information in Sage Intacct and Expensify is always in sync. The following will occur when auto-sync is enabled:

**Daily sync from Sage Intacct to Expensify:** Once a day, Expensify will sync any changes from Sage Intacct into Expensify. This includes any changes or additions to your Sage Intacct dimensions.

**Auto-export:** When an expense report reaches its final state in Expensify, it will be automatically exported to Sage Intacct. The final state will either be reimbursement (if you reimburse members through Expensify) or final approval (if you reimburse members outside of Expensify).

**Reimbursement-sync:** If Sync Reimbursed Reports (more details below) is enabled, then we will sync the reimbursement status of reports between Expensify and Sage Intacct.

### Invite employees
Enabling this feature will invite all employees from the connected Sage Intacct entity to your Expensify workspace. Once imported, each employee who has not already been invited to that Expensify workspace will receive an email letting them know they’ve been added to the workspace.

In addition to inviting employees, this feature enables a custom set of approval workflow options, which you can manage in Expensify Classic:

- **Basic Approval:** A single level of approval, where all users submit directly to a Final Approver. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Manager Approval (default):** Each user submits to their manager, who is imported from Sage Intacct. You can optionally select a final approver who each manager forwards to for second-level approval.
- **Configure Manually:** Employees will be imported, but all levels of approval must be manually configured in Expensify. If you enable this setting, you can configure approvals by going to **Settings > Workspaces > [Workspace Name] > People**.


### Sync reimbursed reports
When Sync reimbursed reports is enabled, the reimbursement status will be synced between Expensify and Sage Intacct.

**If you reimburse employees through Expensify:** Reimbursing an expense report will trigger auto-export to Sage Intacct. When the expense report is exported to Sage Intacct, a corresponding bill payment will also be created in Sage Intacct in the selected Cash and Cash Equivalents account.  If you don't see the account you'd like to select in the dropdown list, please confirm that the account type is Cash and Cash Equivalents.

**If you reimburse employees outside of Expensify:** Expense reports will be exported to Sage Intacct at time of final approval. After you mark the report as paid in Sage Intacct, the reimbursed status will be synced back to Expensify the next time the integration syncs.

To ensure this feature works properly for expense reports, make sure that the account you choose within the settings matches the default account for Bill Payments in NetSuite. When exporting invoices, once marked as Paid, the payment is marked against the account selected after enabling the Collection Account setting.
## FAQ

### Why wasn't my report automatically exported to Sage Intacct?
There are a number of factors that can cause auto-export to fail. If this happens, you will find the specific export error in the report comments for the report that failed to export. Once you’ve resolved any errors, you can manually export the report to Sage Intacct.

### Will enabling auto-sync affect existing approved and reimbursed reports?
Auto-sync will only export newly approved reports to Sage Intacct. Any reports that were approved or reimbursed before enabling auto-sync will need to be manually exported in order to sync them to Sage Intacct.


### Can I export negative expenses to Sage Intacct?
Yes, you can export negative expenses to Sage Intacct. If you are exporting out-of-pocket expenses as expense reports, then the total of each exported report cannot be negative.
