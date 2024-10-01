---
title: Connect to Sage Intacct
description: Integrate Sage Intacct with Expensify
order: 1
---

# Connect to Sage Intacct

Enjoy automated syncing and reduce manual entries with the Expensify and Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).

{% include info.html %}
The Sage Intacct integration is only available on the Control plan.
{% include end-info.html %}

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

## FAQ

### Why wasn't my report automatically exported to Sage Intacct?
There are a number of factors that can cause auto-export to fail. If this happens, you will find the specific export error in the report comments for the report that failed to export. Once you’ve resolved any errors, you can manually export the report to Sage Intacct.

### Can I export negative expenses to Sage Intacct?
Yes, you can export negative expenses to Sage Intacct. If you are exporting out-of-pocket expenses as expense reports, then the total of each exported report cannot be negative.
