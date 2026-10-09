---
title: Connect to NetSuite
description: Connect NetSuite to Expensify for streamlined expense reporting and accounting integration.
keywords: [NetSuite, integration, Expensify Classic, expense reporting, accounting, automated reporting, NetSuite OAuth 2.0]
order: 1
---


Expensify integrates directly with NetSuite to automate report exports, customize your coding preferences, and leverage NetSuite's advanced features. Follow the steps below to set up the integration.

**Note:** New NetSuite connections use OAuth 2.0, which you can only set up in New Expensify. To connect NetSuite, switch to New Expensify and follow the steps in [Connect to NetSuite in New Expensify](/articles/new-expensify/connections/netsuite/Connect-To-NetSuite). After you connect, the connection works in both Expensify Classic and New Expensify.

# Before You Connect NetSuite to Expensify

- **OAuth 2.0** is how new connections are set up. You set it up in New Expensify, and you need two-factor authentication enabled on your Expensify account.
- You must have **administrator access** in NetSuite to initiate the connection.
- **Control Plan** in Expensify is required for this integration.
- Employees do not need NetSuite access or a license to submit expense reports; the integration is managed by the Workspace Admin.
- Each NetSuite subsidiary requires its own **Expensify Group Workspace**.
- Verify that your workspace's **report output currency** matches the NetSuite Subsidiary's default currency.
- Set your **Search Page Size** to **1000** in NetSuite under **Setup > Integration > Web Services Preferences > 'Search Page Size'**.

---

# Step 1: Install the Expensify Bundle in NetSuite

1. Log into NetSuite as an administrator and go to **Customization > SuiteBundler > Search & Install Bundles**.
2. Search for "Expensify" and select the **Expensify Connect bundle** (Bundle ID 283395).
3. Click **Install**.
4. If you already have the Expensify Connect bundle installed, go to **Customization > SuiteBundler > Search & Install Bundles > List** and update to the latest version.
5. Ensure **Show on Existing Custom Forms** is selected for all available fields.

The latest bundle version includes the permissions Expensify needs for OAuth 2.0 and REST web services, so update it before you connect.

---

# Step 2: Enable Token-Based Authentication

**Note:** Steps 2–4 and Step 12 describe how existing token-based connections were set up. You can no longer create a new token-based connection. Existing token-based connections keep working until they migrate to OAuth 2.0, and we'll let you know well before token-based authentication is removed. To set up a new connection, follow the steps in [Connect to NetSuite in New Expensify](/articles/new-expensify/connections/netsuite/Connect-To-NetSuite).

1. In NetSuite, navigate to **Setup > Company > Enable Features > SuiteCloud > Manage Authentication**.
2. Enable **Token-Based Authentication**.
3. Click **Save**.

---

# Step 3: Add Expensify Integration Role to a User

The user you assign this role to must have the required permissions, but does not need to be an administrator.

1. Go to **Lists > Employees** in NetSuite and find the employee you wish to add the Expensify Integration role to.
2. Click **Edit > Access**, select the **Expensify Integration** role from the dropdown, and assign it to the user.
3. Click **Save**.

**Note:** Tokens are tied to both the user and role. Once the token-based connection has been established, you cannot change the role. Always use the same user/role combination for syncing or exporting.

---

# Step 4: Create Access Tokens

1. Use **Global Search** in NetSuite to search for "page: tokens".
2. Click **New Access Token**.
3. Select **Expensify** as the application.
4. Choose the **Expensify Integration** role.
5. Click **Save**.
6. Copy the **Token** and **Token ID** and save them securely, as they will only be visible once.

---

# Step 5: Confirm Expense Reports are Enabled in NetSuite

1. Log into NetSuite as an administrator and go to **Setup > Company > Enable Features > Employees**.
2. Ensure the **Expense Reports** checkbox is checked.
3. If not, check it and click **Save**.

---

# Step 6: Confirm Expense Categories are Set Up in NetSuite

1. Go to **Setup > Accounting > Expense Categories** in NetSuite.
2. If no Expense Categories are visible, click **New** to create them.

---

# Step 7: Confirm Journal Entry Transaction Forms are Configured Properly

1. Navigate to **Customization > Forms > Transaction Forms**.
2. Click **Customize** or **Edit** next to the **Standard Journal Entry** form.
3. Under **Screen Fields > Main**, ensure the **"Created From"** label is set to **Show** and the **Display Type** is set to **Normal**.
4. Under the **Lines** sub-header, verify that **Receipt URL** is set to **Show**.
5. Repeat this for all other journal-type transaction forms.

---

# Step 8: Confirm Expense Report Transaction Forms are Configured Properly

1. Go to **Customization > Forms > Transaction Forms** in NetSuite.
2. Click **Customize** or **Edit** next to the **Standard Expense Report** form.
3. Under **Screen Fields > Main**, ensure the **"Created From"** label is set to **Show** and the **Display Type** is **Normal**.
4. Under the **Expenses** sub-header, verify that **Receipt URL** is set to **Show**.
5. Repeat this for all other expense report-type transaction forms.

---

# Step 9: Confirm Vendor Bill Transactions Forms are Configured Properly

1. Navigate to **Customization > Forms > Transaction Forms** in NetSuite.
2. Click **Customize** or **Edit** next to your preferred **Vendor Bill** form.
3. Under **Screen Fields > Main**, ensure the **"Created From"** label is set to **Show** and that **Departments**, **Classes**, and **Locations** have the **"Show"** label unchecked.
4. Under the **Expenses** sub-header, ensure **Receipt URL**, **Department**, **Location**, and **Class** are set to **Show**.
5. Repeat for all other vendor bill-type transaction forms.

---

# Step 10: Confirm Vendor Credit Transactions Forms are Configured Properly

1. Navigate to **Customization > Forms > Transaction Forms** in NetSuite.
2. Click **Customize** or **Edit** next to your preferred **Vendor Credit** form.
3. Under **Screen Fields > Main**, ensure the **"Created From"** label is set to **Show** and that **Departments**, **Classes**, and **Locations** have the **"Show"** label unchecked.
4. Under the **Expenses** sub-header, ensure **Receipt URL**, **Department**, **Location**, and **Class** are set to **Show**.
5. Repeat for all other vendor credit-type transaction forms.

---

# Step 11: Set Up Tax Groups (only if tracking taxes)

Tax Groups in NetSuite are imported into Expensify, and they act as aliases for Tax Codes.

1. Go to **Setup > Accounting > Tax Groups** in NetSuite.
2. Click **New** to create a new Tax Group.
3. Select the **country** and **Tax Name** (this will be visible to employees in Expensify).
4. Choose the relevant **Tax Code** and **Subsidiary**.
5. Click **Save**.

Ensure **Tax Groups** can be applied to expenses by setting the **Tax Code Lists Include** preference to **Tax Groups And Tax Codes** or **Tax Groups Only** in **Setup > Accounting > Set Up Taxes**.

---

# Step 12: Connect Expensify and NetSuite

**Note:** You can no longer create a new token-based connection. New connections use OAuth 2.0, and Expensify Classic directs you to New Expensify to complete the connection. The steps below show how existing token-based connections were set up.

1. Log into Expensify as a **Workspace Admin** and go to **Settings > Workspaces > [Workspace Name] > Accounting > NetSuite**.
2. Click **Connect to NetSuite**.
3. Enter your **Account ID** (found in NetSuite under **Setup > Integration > Web Services Preferences**).
4. Enter the **token** and **token secret**.
5. Click **Connect to NetSuite**.

After connecting, the NetSuite connection will sync, and the configuration dialogue box will appear.

**Note:** The connection must be created using a NetSuite account with the **Expensify Integration** role.

---

# FAQ

## Can negative expenses be exported to NetSuite? 

Yes, you can export reports with negative totals to NetSuite by selecting **Vendor Bill** as your export option. Instead of a bill, a vendor credit will be created in NetSuite. 

**Important**: Only enable this if you pay employees/vendors outside of Expensify.

---

## How do you switch the owner of the connection between NetSuite and Expensify?

To transfer the connection ownership:
1. Navigate to **Settings > Workspaces > Workspace Name > Accounting > NetSuite**.
2. Click **Configure** to review the current settings.
3. Select **Do not connect to NetSuite**, then **Connect to NetSuite** again.
4. Enter the new admin's email address and NetSuite account ID.
5. Follow the steps to reconfigure the connection.

Reconnecting creates a new connection, so you'll complete it in New Expensify using OAuth 2.0.

---

## Why do I need New Expensify to connect NetSuite?

The OAuth 2.0 connection and re-authorization flows are only available in New Expensify. After you connect, you can keep using Expensify Classic to manage your NetSuite settings and export reports.

---

## Do I need to do anything about my existing NetSuite connection?

No. Workspaces that already connect to NetSuite using token-based authentication keep working exactly as they do today. When it's time to re-authorize using OAuth 2.0, we'll let you know, and you'll complete it in New Expensify.

---

## When is token-based authentication going away?

We'll remove token-based authentication once every customer with an existing connection has migrated to OAuth 2.0. We'll give you notice and migration steps before that happens, so you don't need to do anything yet.

---

