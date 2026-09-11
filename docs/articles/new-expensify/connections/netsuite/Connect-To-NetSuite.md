---
title: Connect to NetSuite
description: Connect NetSuite to New Expensify using OAuth 2.0 and REST web services for streamlined expense reporting and accounting sync.
keywords: [New Expensify, NetSuite integration, connect NetSuite, NetSuite OAuth 2.0, NetSuite REST web services, NetSuite bundle, accounting sync]
internalScope: Audience is Workspace admins on the Control plan who are also NetSuite administrators, covers setting up a new NetSuite connection using OAuth 2.0 and REST web services, does not cover configuring import/export settings after connecting or troubleshooting a broken connection
order: 1
---

# Connect to NetSuite

Connect your Expensify Workspace to NetSuite to streamline expense syncing, reporting, and accounting. New connections use OAuth 2.0 and NetSuite's REST web services, so you approve access on a NetSuite consent screen instead of creating and copying access tokens.

This guide walks you through preparing NetSuite, connecting Expensify, and confirming the connection.

---

## What you need before you connect to NetSuite

- A NetSuite account you can log into as an administrator
- The **Control** plan in Expensify
- Two-factor authentication enabled on your Expensify account, which NetSuite requires to connect the integration
- One Expensify **Workspace** per NetSuite **subsidiary**
- A Workspace currency that matches the NetSuite subsidiary's default currency

Employees submitting reports don't need NetSuite access or licenses.

---

## How to install the Expensify bundle in NetSuite

1. In NetSuite, go to **Customization > SuiteBundler > Search & Install Bundles**
2. Search for **Expensify** and select the **Expensify Connect** bundle (Bundle ID `283395`)
3. Click **Install**
4. If the bundle is already installed, go to **SuiteBundler > List** and update to the latest version
5. Select **Show on Existing Custom Forms** for all available fields

The latest bundle version grants the permissions Expensify needs to log in using OAuth 2.0 access tokens and to use REST web services, so update it before you connect.

---

## How to enable OAuth 2.0 in NetSuite

1. In NetSuite, go to **Setup > Company > Enable Features > SuiteCloud**
2. Under **Manage Authentication**, enable **OAuth 2.0**
3. Click **Save**

---

## How to enable REST web services in NetSuite

1. In NetSuite, go to **Setup > Company > Enable Features > SuiteCloud**
2. Under **SuiteTalk (Web Services)**, enable **REST Web Services**
3. Click **Save**

---

## How to enable expense reports in NetSuite

1. Go to **Setup > Company > Enable Features > Employees**
2. Make sure **Expense Reports** is enabled
3. If it isn't, check the box and click **Save**

---

## How to set up expense categories in NetSuite

1. Go to **Setup > Accounting > Expense Categories**
2. If none are listed, click **New** to create them

Expense categories map to Expensify categories and are linked to GL accounts so employees can select them easily.

---

## How to check your journal entry transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit the **Standard Journal Entry** form:
   - Under the **Main** tab, make sure **Created From** is shown and its display type is **Normal**
   - Under **Lines**, make sure **Receipt URL** is shown
3. Repeat for all journal-type forms

---

## How to check your expense report transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit the **Standard Expense Report** form:
   - Under the **Main** tab, make sure **Created From** is shown
   - Under the **Expenses** subtab, make sure **Receipt URL** is shown
3. Repeat for all expense report-type forms

---

## How to check your vendor bill transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit your Vendor Bill form:
   - Under the **Main** tab, show **Created From** and hide **Department**, **Class**, and **Location**
   - Under the **Expenses** subtab, show **Receipt URL**, **Department**, **Location**, and **Class**
3. Repeat for all vendor bill-type forms

---

## How to check your vendor credit transaction forms

1. Go to **Customization > Forms > Transaction Forms**
2. Edit your Vendor Credit form:
   - Under the **Main** tab, show **Created From** and hide **Department**, **Class**, and **Location**
   - Under the **Expenses** subtab, show **Receipt URL**, **Department**, **Location**, and **Class**
3. Repeat for all vendor credit-type forms

---

## How to set up tax groups in NetSuite

Expensify supports tax groups, not individual tax codes, except when you use SuiteTax. Under **Setup > Accounting > Set Up Taxes**, set **Tax Code Lists Include** to **Tax Groups And Tax Codes** or **Tax Groups Only**. In the UK and Ireland, make sure each tax group contains only one tax code.

To create a tax group:

1. Go to **Setup > Accounting > Tax Groups**
2. Click **New**
3. Set the country, name, and subsidiary
4. Choose a tax code and click **Add**
5. Click **Save**
6. Repeat for each tax rate you want to show in Expensify

---

## How to connect Expensify to NetSuite

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Connect** next to **NetSuite**
3. Click **Next** through the NetSuite setup steps
4. Enter your **NetSuite Account ID**
5. Click **Connect**
6. On the NetSuite consent screen, sign in if prompted and approve access for Expensify

If you're connecting to a Sandbox environment, capitalize the "s" and "b" in the Account ID and replace the hyphen with an underscore. For example, `123456-sb1` becomes `123456_SB1`.

You can find your Account ID in NetSuite under **Setup > Integration > Web Services Preferences**.

<!-- SCREENSHOT:
Suggestion: The NetSuite-hosted OAuth 2.0 consent screen showing the Expensify application requesting access, with the approve button visible.
Location: Immediately after the connect steps above.
Purpose: Members expect to stay in Expensify and may abandon the flow when NetSuite takes over the screen; showing the consent page confirms they're in the right place and that approving it is the final step.
-->

![The New Expensify workspace setting is open and the More Features tab is selected and visible. The toggle to enable Accounting is highlighted with an orange call out and is currently in the grey disabled position.]({{site.url}}/assets/images/ExpensifyHelp-Xero-1.png)

![The New Expensify workspace settings > More features tab is open with the toggle to enable Accounting enabled and green. The Accounting tab is now visible in the left-hand menu and is highlighted with an orange call out.]({{site.url}}/assets/images/ExpensifyHelp-Xero-2.png){:width="100%"}

---

## What happens after you connect to NetSuite

- The NetSuite connection syncs within 1–2 minutes
- Newly approved and paid reports export to NetSuite
- Next, choose your import, export, and advanced settings. [Learn how to configure NetSuite in Expensify](/articles/new-expensify/connections/netsuite/Configure-Netsuite).

---

## How existing NetSuite connections are affected

Workspaces that already connect to NetSuite using token-based authentication keep working exactly as they do today. You don't need to reinstall the bundle, create new tokens, or reconnect. Expensify will let you know before anything changes for existing connections.

---

# FAQ

## Why do I need two-factor authentication to connect NetSuite?

NetSuite requires two-factor authentication to authorize the integration. If two-factor authentication isn't enabled on your Expensify account, Expensify prompts you to enable it before you can continue.

## Do I still need to create access tokens in NetSuite?

No. New connections approve access on a NetSuite consent screen, so there are no token IDs or token secrets to create, copy, or store.

## How do I ensure smooth import of customer and vendor data from NetSuite?

Set the **Page Size** to 1000 in NetSuite:

1. Go to **Setup > Integration > Web Services Preferences**
2. Search for and update the **Page Size** setting
