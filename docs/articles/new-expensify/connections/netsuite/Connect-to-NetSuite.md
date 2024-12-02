---
title: Connect to NetSuite
description: Integrate NetSuite with Expensify
order: 1
---

{% include info.html %}
To use the NetSuite connection, you must have a NetSuite account and an Expensify Control plan.
{% include end-info.html %}

Expensify’s integration with NetSuite supports syncing data between the two systems. Before you start connecting Expensify with NetSuite, there are a few things to note:

- You must use NetSuite administrator credentials to initiate the connection.
- A Control Plan in Expensify is required to integrate with NetSuite.
- Employees don’t need NetSuite access or a NetSuite license to submit expense reports and sync them to NetSuite.
- Each NetSuite subsidiary must be connected to a separate Expensify workspace.
- The workspace currency in Expensify must match the NetSuite subsidiary's default currency.

# Step 1: Install the Expensify Bundle in NetSuite

While logged into NetSuite as an administrator, go to **Customization > SuiteBundler > Search & Install Bundles**, then search for “Expensify”.
Click on the Expensify Connect bundle (Bundle ID 283395).
Click **Install**.
If you already have the Expensify Connect bundle installed, head to **Customization > SuiteBundler > Search & Install Bundles > List**, and update it to the latest version.
Select "Show on Existing Custom Forms" for all available fields.

# Step 2: Enable Token-Based Authentication

In NetSuite, go to **Setup > Company > Enable Features > SuiteCloud > Manage Authentication**.
Make sure “Token Based Authentication” is enabled.
Click **Save**.

# Step 3: Add Expensify Integration Role to a User

In NetSuite, head to **Lists > Employees**, and find the user to who you would like to add the Expensify Integration role. The user you select must at least have access to the permissions included in the Expensify Integration Role, and Admin access works too, but Admin access is not required.
Click **Edit > Access**, then find the Expensify Integration role in the dropdown and add it to the user.
Click **Save**.


{% include info.html %}
Remember that Tokens are linked to a **User** and a **Role**, not solely to a User. It’s important to note that you cannot establish a connection with tokens using one role and then switch to another role afterward. Once you’ve initiated a connection with tokens, you must continue using the same token/user/role combination for all subsequent sync or export actions.
{% include end-info.html %}

# Step 4: Create Access Tokens


In NetSuite, enter “page: tokens” in the Global Search.
Click **New Access Token**.
Select Expensify as the application (this must be the original Expensify integration from the bundle).
Select the role Expensify Integration.
Click **Save**.
Copy and paste the token and token ID to a saved location on your computer (this is the only time you will see these details.)


# Step 5: Confirm Expense Reports are enabled in NetSuite

{% include info.html %}
Expense Reports must be enabled in order to use Expensify’s integration with NetSuite.
{% include end-info.html %}


In NetSuite, go to **Setup > Company > Enable Features > Employees**.
Confirm the checkbox next to "Expense Reports" is checked.
If not, click the checkbox and then click **Save** to enable Expense Reports.


# Step 6: Confirm Expense Categories are set up in NetSuite

{% include info.html %}
Once Expense Reports are enabled, Expense Categories can be set up in NetSuite. Expense Categories are synced to Expensify as Categories. Each Expense Category is an alias mapped to a General Ledger account so that employees can more easily categorize expenses.
{% include end-info.html %}


In NetSuite, go to **Setup > Accounting > Expense Categories** (a list of Expense Categories should show.)
If no Expense Categories are visible, click **New** to create new ones.

# Step 7: Confirm Journal Entry Transaction Forms are Configured Properly

In NetSuite, go to **Customization > Forms > Transaction Forms.**
Click **Customize** or **Edit** next to the Standard Journal Entry form.
Click **Screen Fields > Main**. Please verify the “Created From” label has “Show” checked and the "Display Type" is set to "Normal."
Click the sub-header **Lines** and verify that the “Show” column for “Receipt URL” is checked.
Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the journal type have this same configuration.


# Step 8: Confirm Expense Report Transaction Forms are Configured Properly


In NetSuite, go to **Customization > Forms > Transaction Forms.**
Click **Customize** or **Edit** next to the Standard Expense Report form, then click **Screen Fields > Main.**
Verify the “Created From” label has “Show” checked and the "Display Type" is set to "Normal."
Click the second sub-header, **Expenses**, and verify that the "Show" column for "Receipt URL" is checked.
Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the expense report type have this same configuration.


# Step 9: Confirm Vendor Bill Transactions Forms are Configured Properly


In NetSuite, go to **Customization > Forms > Transaction Forms.**
Click **Customize** or **Edit** next to your preferred Vendor Bill form.
Click **Screen Fields > Main** and verify that the “Created From” label has “Show” checked and that Departments, Classes, and Locations have the “Show” label unchecked.
Under the **Expenses** sub-header (make sure to click the “Expenses” sub-header at the very bottom and not “Expenses & Items”), ensure “Show” is checked for Receipt URL, Department, Location, and Class.
Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the vendor bill type have this same configuration.


# Step 10: Confirm Vendor Credit Transactions Forms are Configured Properly


In NetSuite, go to **Customization > Forms > Transaction Forms**.
Click **Customize** or **Edit** next to your preferred Vendor Credit form, then click **Screen Fields > Main** and verify that the “Created From” label has “Show” checked and that Departments, Classes, and Locations have the “Show” label unchecked.
Under the **Expenses** sub-header (make sure to click the “Expenses” sub-header at the very bottom and not “Expenses & Items”), ensure “Show” is checked for Receipt URL, Department, Location, and Class.
Go to **Customization > Forms > Transaction Forms** and ensure that all other transaction forms with the vendor credit type have this same configuration.


# Step 11: Set up Tax Groups (only applicable if tracking taxes)

{% include info.html %}
**Things to note about tax.**
Expensify imports NetSuite Tax Groups (not Tax Codes). To ensure Tax Groups can be applied to expenses go to **Setup > Accounting > Set Up Taxes** and set the _Tax Code Lists Include_ preference to “Tax Groups And Tax Codes” or “Tax Groups Only.” If this field does not display, it’s not needed for that specific country.
Tax Groups are an alias for Tax Codes in NetSuite and can contain one or more Tax Codes (Please note: for UK and Ireland subsidiaries, please ensure your Tax Groups do not have more than one Tax Code). We recommend naming Tax Groups so your employees can easily understand them, as the name and rate will be displayed in Expensify.
{% include end-info.html %}

Go to **Setup > Accounting > Tax Groups**.
Click **New**.
Select the country for your Tax Group.
Enter the Tax Name (this is what employees will see in Expensify.)
Select the subsidiary for this Tax Group.
Select the Tax Code from the table you wish to include in this Tax Group.
Click **Add**.
Click **Save**.
Create one NetSuite Tax Group for each tax rate you want to show in Expensify.

# Step 12: Connect Expensify to NetSuite

Click your profile image or icon in the bottom left menu.
Scroll down and click **Workspaces** in the left menu.
Select the workspace you want to connect to NetSuite.
Click **More features** in the left menu.
Click **More features** in the left menu.
Scroll down to the Integrate section and enable the Accounting toggle.
Click **Accounting** in the left menu.
Click **Connect** next to NetSuite.
Click **Next** until you reach setup step 5 (If you followed the instructions above, then the first four setup steps will already be complete.)
On setup step 5, enter your NetSuite Account ID, Token ID, and Token Secret (the NetSuite Account ID can be found in NetSuite by going to **Setup > Integration > Web Services Preferences**.)
Click **Confirm** to complete the setup.


![The New Expensify workspace setting is open and the More Features tab is selected and visible. The toggle to enable Accounting is highlighted with an orange call out and is currently in the grey disabled position.]({{site.url}}/assets/images/ExpensifyHelp-Xero-1.png)

![The New Expensify workspace settings > More features tab is open with the toggle to enable Accounting enabled and green. The Accounting tab is now visible in the left-hand menu and is highlighted with an orange call out.]({{site.url}}/assets/images/ExpensifyHelp-Xero-2.png){:width="100%"}

After completing the setup, the NetSuite connection will sync. It can take 1-2 minutes to sync with NetSuite.

Once connected, all newly approved and paid reports exported from Expensify will be generated in NetSuite using SOAP Web Services (the term NetSuite employs when records are created through the integration).

{% include faq-begin.md %}

## If I have a lot of customer and vendor data in NetSuite, how can I help ensure that importing them all is seamless?

For importing your customers and vendors, make sure your page size is set to 1000 in NetSuite. 

Go to **Setup > Integration > Web Services Preferences** and search **Page Size** to determine your page size.

{% include faq-end.md %}
