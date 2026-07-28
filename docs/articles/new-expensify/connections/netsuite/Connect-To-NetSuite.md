---
title: Connect to NetSuite
description: Connect NetSuite to New Expensify for streamlined expense reporting and accounting integration.
keywords: [New Expensify, NetSuite integration, connect NetSuite, NetSuite bundle, accounting sync]
order: 1
---


Connect your Expensify Workspace to NetSuite to streamline expense syncing, reporting, and accounting. This guide walks you through installing the bundle, enabling features, and finalizing the connection.

**Note:** You must have a NetSuite account and be on the **Control** plan in Expensify.

**Before you begin, make sure:**

- You can log into NetSuite as an administrator
- Each NetSuite **subsidiary** maps to a separate Expensify **Workspace**
- Your Workspace currency matches the NetSuite subsidiary's default currency
- Employees submitting reports don’t need NetSuite access or licenses

---

# Step 1: Install the Expensify bundle in NetSuite

1. In NetSuite, go to **Customization > SuiteBundler > Search & Install Bundles**
2. Search for **Expensify** and select the **Expensify Connect** bundle (Bundle ID `283395`)
3. Click **Install**
4. If already installed, go to **SuiteBundler > List** and update to the latest version
5. Select **Show on Existing Custom Forms** for all available fields

---

# Step 2: Enable Token-Based Authentication

1. Go to **Setup > Company > Enable Features > SuiteCloud > Manage Authentication**
2. Enable **Token Based Authentication**
3. Click **Save**

---

# Step 3: Assign the Expensify Integration Role

1. Go to **Lists > Employees**
2. Find and edit the employee who will connect the integration
3. Under the **Access** tab, add the **Expensify Integration** role
4. Click **Save**

**Reminder:** Tokens link to a **user-role combination**, not just a user. You must use the same user and role for all syncs after setup.

---

# Step 4: Create access tokens

1. In NetSuite, use the Global Search to search for `page: tokens`
2. Click **New Access Token**
3. Select **Expensify** as the application and the **Expensify Integration** role
4. Click **Save**
5. Copy and securely save the **Token ID** and **Token Secret** (you’ll only see them once)

---

# Step 5: Enable Expense Reports in NetSuite

1. Go to **Setup > Company > Enable Features > Employees**
2. Ensure **Expense Reports** is enabled
3. If not, check the box and click **Save**

---

# Step 6: Set up Expense Categories in NetSuite

1. Go to **Setup > Accounting > Expense Categories**
2. If none are listed, click **New** to create them

**Note:** Expense Categories map to Expensify Categories and are linked to GL accounts for easy employee selection.

---

# Step 7: Check Journal Entry transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit the **Standard Journal Entry** form:
   - Under **Main** tab, make sure:
     - **Created From** is shown
     - Display type is **Normal**
   - Under **Lines**, ensure **Receipt URL** is shown
3. Repeat for all journal-type forms

---

# Step 8: Check Expense Report transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit the **Standard Expense Report** form:
   - Under **Main** tab:
     - **Created From** should be shown
   - Under **Expenses** subtab:
     - **Receipt URL** should be shown
3. Repeat for all expense report-type forms

---

# Step 9: Check Vendor Bill transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit your Vendor Bill form:
   - Under **Main** tab:
     - Show “Created From”
     - Hide **Department**, **Class**, and **Location**
   - Under **Expenses** subtab:
     - Show **Receipt URL**, **Department**, **Location**, **Class**
3. Repeat for all vendor bill-type forms

---

# Step 10: Check Vendor Credit transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit your Vendor Credit form:
   - Under **Main** tab:
     - Show “Created From”
     - Hide **Department**, **Class**, and **Location**
   - Under **Expenses** subtab:
     - Show **Receipt URL**, **Department**, **Location**, **Class**
3. Repeat for all vendor credit-type forms

---

# Step 11: Set up Tax Groups (if applicable)

**Things to note about tax:**

- Expensify supports Tax Groups, not individual Tax Codes (except when using SuiteTax)
- Set **Tax Code Lists Include** to “Tax Groups And Tax Codes” or “Tax Groups Only” under **Setup > Accounting > Set Up Taxes**
- UK and Ireland: ensure each Tax Group contains only one Tax Code

To create a Tax Group:

1. Go to **Setup > Accounting > Tax Groups**
2. Click **New**
3. Set the country, name, and subsidiary
4. Choose a Tax Code and click **Add**
5. Click **Save**
6. Repeat for each tax rate you want to show in Expensify
---

# Step 12: Connect Expensify to NetSuite

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Connect** next to **NetSuite**
3. Click **Next** through setup steps 1–4
4. On **Step 5**, enter:
   - **NetSuite Account ID**
   - Note: If connecting to a Sandbox environment, in the Account ID, ensure the "s" and "b" are always capitalized and the hyphen "-" is replaced by an underscore "_". So "123456-sb1" would be "123456_SB1".
   - **Token ID**
   - **Token Secret**
5. Click **Confirm**

You can find your **Account ID** in NetSuite under **Setup > Integration > Web Services Preferences.**

![The New Expensify workspace setting is open and the More Features tab is selected and visible. The toggle to enable Accounting is highlighted with an orange call out and is currently in the grey disabled position.]({{site.url}}/assets/images/ExpensifyHelp-Xero-1.png)

![The New Expensify workspace settings > More features tab is open with the toggle to enable Accounting enabled and green. The Accounting tab is now visible in the left-hand menu and is highlighted with an orange call out.]({{site.url}}/assets/images/ExpensifyHelp-Xero-2.png){:width="100%"}

---

# After Setup

- The NetSuite connection syncs within 1–2 minutes
- Newly approved and paid reports will export to NetSuite via SOAP Web Services
- Continue with configuring settings by visiting:
  [Configure NetSuite in Expensify](https://help.expensify.com/articles/new-expensify/connections/netsuite/Configure-Netsuite)

---

# FAQ

## How do I ensure smooth import of customer and vendor data from NetSuite?

Set the **Page Size** to 1000 in NetSuite. To do this:
1. Go to **Setup > Integration > Web Services Preferences**
2. Search for and update the **Page Size** setting

