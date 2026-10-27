---
title: Connect to NetSuite
description: Connect NetSuite to New Expensify for streamlined expense reporting and accounting sync, and upgrade an existing token-based connection to OAuth 2.0.
keywords: [New Expensify, NetSuite integration, connect NetSuite, NetSuite OAuth 2.0, NetSuite REST web services, NetSuite token-based authentication, NetSuite bundle, accounting sync, upgrade NetSuite connection, migrate NetSuite to OAuth 2.0, Upgrade now]
internalScope: Audience is Workspace admins on the Control plan who are also NetSuite administrators, covers setting up a new NetSuite connection using OAuth 2.0 and REST web services, upgrading an existing token-based connection to OAuth 2.0, plus the legacy token-based authentication steps that are still supported, does not cover configuring import/export settings after connecting or troubleshooting a broken connection
order: 1
---

# Connect to NetSuite

Connect your Expensify Workspace to NetSuite to streamline expense syncing, reporting, and accounting. New connections use OAuth 2.0 and NetSuite's REST web services, so you approve access on a NetSuite consent screen instead of creating and copying access tokens.

This guide walks you through preparing NetSuite, connecting Expensify, and confirming the connection. Token-based authentication is still supported and documented below, but OAuth 2.0 is the recommended way to set up a new connection.

If your workspace already connects to NetSuite using token-based authentication, upgrade it to OAuth 2.0 by February 2027. Follow the steps in **How to upgrade an existing NetSuite connection to OAuth 2.0** below.

---

## What you need before you connect to NetSuite

- A NetSuite account you can log into as an administrator
- The **Control** plan in Expensify
- One Expensify **Workspace** per NetSuite **subsidiary**
- A Workspace currency that matches the NetSuite subsidiary's default currency

Employees submitting reports don't need NetSuite access or licenses.

---

## How to connect to NetSuite

Complete these steps in order. Each step has its own section below with detailed instructions.

1. Install the Expensify bundle in NetSuite
2. Enable OAuth 2.0 in NetSuite
3. Enable REST web services in NetSuite
4. Enable expense reports in NetSuite
5. Set up expense categories in NetSuite
6. Check your journal entry transaction forms
7. Check your expense report transaction forms
8. Check your vendor bill transaction forms
9. Check your vendor credit transaction forms
10. Configure taxes in NetSuite
11. Connect Expensify to NetSuite using OAuth 2.0

If you're connecting with token-based authentication instead, follow the steps in **How to connect to NetSuite using token-based authentication** below.

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

Skip this section if you're connecting with token-based authentication instead.

---

## How to enable REST web services in NetSuite

1. In NetSuite, go to **Setup > Company > Enable Features > SuiteCloud**
2. Under **SuiteTalk (Web Services)**, enable **REST Web Services**
3. Click **Save**

Skip this section if you're connecting with token-based authentication instead.

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

## How to configure taxes in NetSuite

SuiteTax accounts import individual Tax Codes. Legacy tax accounts import Tax Groups.

**SuiteTax accounts**

If the account uses SuiteTax, complete these steps:

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Edit the role used for the Expensify connection.
3. Under **Permissions > Lists**, set **Tax Details Tab** to **Full**.
4. Select **Save**.
5. Go to **Setup > SuiteTax Engine > Manage SuiteTax Engine Roles**.
6. Select **Assign SuiteTax Engine Permissions to Role**.
7. In the **Role** field, choose the role used for the Expensify connection.
8. On the **SuiteTax Engine Permissions** subtab, set each permission to **Full**.
9. Select **Save**.

Do not complete the **Legacy tax accounts** steps.

**Legacy tax accounts**

If the account uses legacy taxes, under **Setup > Accounting > Set Up Taxes**, set **Tax Code Lists Include** to **Tax Groups And Tax Codes** or **Tax Groups Only**. In the UK and Ireland, make sure each Tax Group contains only one Tax Code.

To create a Tax Group:

1. Go to **Setup > Accounting > Tax Groups**
2. Click **New**
3. Set the country, name, and subsidiary
4. Choose a Tax Code and click **Add**
5. Click **Save**
6. Repeat for each tax rate you want to show in Expensify

---

## How to connect Expensify to NetSuite using OAuth 2.0

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

## How to upgrade an existing NetSuite connection to OAuth 2.0

NetSuite is retiring token-based authentication, so every workspace that connects to NetSuite with access tokens needs to switch to OAuth 2.0 by February 2027. The upgrade takes about 10 minutes. You'll need a NetSuite administrator for the NetSuite steps.

Until you upgrade, workspace admins see this message under **NetSuite** on the **Accounting** page: "Upgrade your NetSuite connection to OAuth 2.0 by February 2027." You may also see an **Upgrade your NetSuite connection** card on the **Home** tab.

**In NetSuite:**

1. Go to **Customization > SuiteBundler > Search & Install Bundles > List** and update the **Expensify Connect** bundle (Bundle ID `283395`) to the latest version.
2. Go to **Setup > Company > Enable Features > SuiteCloud**.
3. Under **Manage Authentication**, enable **OAuth 2.0**.
4. Under **SuiteTalk (Web Services)**, enable **REST Web Services**.
5. Select **Save**.

**In Expensify:**

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **NetSuite**, select **Upgrade now**.
3. Select **Next** through the NetSuite setup steps.
4. Enter your Account ID in the **NetSuite Account ID** field.
5. Select **Connect**.
6. On the NetSuite consent screen, sign in if prompted and approve access for Expensify.
7. When you see **Connection complete**, close the window and go back to Expensify.

On web, the NetSuite consent screen opens in a new browser tab.

If you use Expensify Classic, select **Take action now** on the NetSuite upgrade banner. This opens the same upgrade steps in New Expensify. When you're done, you can go back to Expensify Classic.

<!-- SCREENSHOT:
Suggestion: The New Expensify Workspaces > [workspace name] > Accounting page for a token-based NetSuite connection, showing the "Upgrade your NetSuite connection to OAuth 2.0 by February 2027." message and the Upgrade now link under the NetSuite row.
Location: Immediately after the In Expensify steps above.
Purpose: Upgrade now is a small text link under the connection row rather than a button, so admins coming from the email or banner may not spot it; showing it confirms where to start.
-->

---

## What happens after you upgrade your NetSuite connection to OAuth 2.0

- Your import, export, and advanced settings stay the same. You don't need to set up your NetSuite configuration again.
- Expensify starts a sync with NetSuite using the new OAuth 2.0 connection.
- The upgrade message on the **Accounting** page and the card on the **Home** tab disappear.
- If the first sync on OAuth 2.0 doesn't succeed, Expensify switches the workspace back to your existing token-based connection so exports keep working. Fix the issue in NetSuite and select **Upgrade now** again.

---

## How to connect to NetSuite using token-based authentication

**Note:** Token-based authentication still works, but we're deprecating it. Existing token-based connections need to upgrade to OAuth 2.0 by February 2027. If you're setting up a new connection, use OAuth 2.0 instead.

Complete these steps in order. Steps 1 and 5–11 are the same as for an OAuth 2.0 connection. Steps 2–4 and 12 have their own sections below.

1. Install the Expensify bundle in NetSuite
2. Enable token-based authentication in NetSuite
3. Assign the Expensify Integration role in NetSuite
4. Create access tokens in NetSuite
5. Enable expense reports in NetSuite
6. Set up expense categories in NetSuite
7. Check your journal entry transaction forms
8. Check your expense report transaction forms
9. Check your vendor bill transaction forms
10. Check your vendor credit transaction forms
11. Configure taxes in NetSuite
12. Connect Expensify to NetSuite using access tokens

---

## How to enable token-based authentication in NetSuite

1. Go to **Setup > Company > Enable Features > SuiteCloud > Manage Authentication**
2. Enable **Token Based Authentication**
3. Click **Save**

---

## How to assign the Expensify Integration role in NetSuite

1. Go to **Lists > Employees**
2. Find and edit the employee who will connect the integration
3. Under the **Access** tab, add the **Expensify Integration** role
4. Click **Save**

Tokens link to a user-role combination, not just a user. Use the same user and role for all syncs after setup.

---

## How to create access tokens in NetSuite

1. In NetSuite, use the Global Search to search for `page: tokens`
2. Click **New Access Token**
3. Select **Expensify** as the application and the **Expensify Integration** role
4. Click **Save**
5. Copy and securely save the **Token ID** and **Token Secret**, which you'll only see once

---

## How to connect Expensify to NetSuite using access tokens

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Connect** next to **NetSuite**
3. Click **Next** through the NetSuite setup steps
4. Enter your **NetSuite Account ID**, **Token ID**, and **Token Secret**
5. Click **Confirm**

If you're connecting to a Sandbox environment, capitalize the "s" and "b" in the Account ID and replace the hyphen with an underscore. For example, `123456-sb1` becomes `123456_SB1`.

---

# FAQ

## Do I still need to create access tokens in NetSuite?

Not if you connect with OAuth 2.0. You approve access on a NetSuite consent screen instead, so there are no token IDs or token secrets to create, copy, or store. You only create access tokens if you connect with token-based authentication, which we're deprecating.

## Do I need to upgrade my existing NetSuite connection?

Yes, if your workspace connects to NetSuite using token-based authentication. Upgrade to OAuth 2.0 by February 2027. Your connection keeps working until you upgrade, so you can choose a time that suits you.

## When is token-based authentication going away?

Upgrade your connection to OAuth 2.0 by February 2027. NetSuite is retiring token-based authentication, and we're moving every connection to OAuth 2.0 ahead of NetSuite's timeline.

## Will I lose my NetSuite settings when I upgrade to OAuth 2.0?

No. Your import, export, and advanced settings stay the same. Only the way Expensify signs in to NetSuite changes.

## What happens if my NetSuite upgrade doesn't work?

Your existing token-based connection keeps working, so expenses keep exporting to NetSuite. Check that the Expensify Connect bundle is up to date and that **OAuth 2.0** and **REST Web Services** are enabled in NetSuite, then select **Upgrade now** again. If you're still stuck, message Concierge.

## Can I upgrade my NetSuite connection from Expensify Classic?

The upgrade happens in New Expensify. Select **Take action now** on the NetSuite upgrade banner in Expensify Classic to open the upgrade steps. When you're done, you can go back to Expensify Classic.

## How do I ensure smooth import of customer and vendor data from NetSuite?

Set the **Page Size** to 1000 in NetSuite:

1. Go to **Setup > Integration > Web Services Preferences**
2. Search for and update the **Page Size** setting
