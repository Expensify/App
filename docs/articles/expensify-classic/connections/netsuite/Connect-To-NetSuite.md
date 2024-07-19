---
title: NetSuite
description: Set up the direct connection from Expensify to NetSuite.
order: 1
---
# Overview
Expensify's integration with NetSuite allows you to automate report exports, tailor your coding preferences, and tap into NetSuite's array of advanced features. By correctly configuring your NetSuite settings in Expensify, you can leverage the connection's settings to automate most of the tasks, making your workflow more efficient.

**Before connecting NetSuite to Expensify, a few things to note:**
- Token-based authentication works by ensuring that each request to NetSuite is accompanied by a signed token which is verified for authenticity
- You must be able to login to NetSuite as an administrator to initiate the connection
- You must have a Control Plan in Expensify to integrate with NetSuite
- Employees don’t need NetSuite access or a NetSuite license to submit expense reports since the connection is managed by the Workspace Admin
- Each NetSuite subsidiary will need its own Expensify Group Workspace
- Ensure that your workspace's report output currency setting matches the NetSuite Subsidiary default currency
- Make sure your page size is set to 1000 for importing your customers and vendors. You can check this in NetSuite under **Setup > Integration > Web Services Preferences > 'Search Page Size'**

# Connect to NetSuite 

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

Once Expense Reports are enabled, Expense Categories can be set up in NetSuite. Expense Categories are an alias for General Ledger accounts used to code expenses.

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

{% include faq-begin.md %}

## Can negative expenses be exported to NetSuite? 
You can export reports with a negative total to NetSuite by selecting “Vendor Bill” as your export option. When a report total is negative, we’ll create a Vendor Credit in NetSuite instead of a bill.

**Important**: Only enable this if you pay your employees/vendors outside of Expensify. A Vendor Credit reduces the total amount payable in NetSuite, but not in Expensify.

To use this feature, make sure you have configured your Vendor Credit transaction form in NetSuite and are using the latest version of the Expensify bundle (version 1.4). If you need to update, go to **Customization > SuiteBundler > Search & Install Bundles > List** and click **Update** next to **Expensify Connect**.

## How do you switch the owner of the connection between NetSuite and Expensify? 

Follow the steps below to transfer ownership of the NetSuite connection to someone else:
1. Head to **Settings > Workspaces > Workspace Name > Connections > NetSuite**
2. Click **Configure** to review and save the settings for future reference
3. Select **Do not connect to NetSuite**
4. Select **Connect to NetSuite**
5. Enter the email address of the new admin who will take over as the NetSuite User ID
6. Enter the NetSuite Account ID (found in NetSuite under **Setup > Integration > Web Services Preferences**)
7. Click **Create a new NetSuite Connection**
8. Confirm completion of prerequisites and proceed by clicking Continue
9. You will be redirected to the NetSuite SSO page, where you will enter the email address of the new connection owner and the NetSuite password for that account
10. Once redirected to the NetSuite page, click **View all roles** and ensure you are logged in under the Administrator role
11. After confirmation, sign out
12. Return to Expensify to reconfigure the sync and export settings on the updated connection
13. Click **Save**

**If you run into any issues updating the connection, follow these additional troubleshooting steps:**
- In NetSuite, access the role of the current connection owner
- Click Edit > Access > Choose any role other than Administrator > Save
- Click Edit > Access > Select Administrator role > Save
- Repeat the steps outlined above

{% include faq-end.md %}
