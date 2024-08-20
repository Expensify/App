---
title: Connect to NetSuite
description: Integrate NetSuite with Expensify
order: 1
---

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
