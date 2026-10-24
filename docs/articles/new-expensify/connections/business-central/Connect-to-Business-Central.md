---
title: Connect to Dynamics 365 Business Central
description: Learn how to connect Dynamics 365 Business Central to Expensify, choose which company to sync, and disconnect the integration.
keywords: [New Expensify, Dynamics 365 Business Central, Business Central, D365, Microsoft Dynamics, connect Business Central, Business Central setup, Tenant ID, Client secret, AppSource extension]
internalScope: Audience is workspace admins connecting Dynamics 365 Business Central as an accounting integration. Covers the extension prerequisite, entering credentials, company selection, and disconnecting. Does not cover import, export, or advanced settings, vendor matching, or Dynamics 365 Finance and Operations.
order: 1
noindex: true
sitemap: false
---

# Connect to Dynamics 365 Business Central

Connect Dynamics 365 Business Central to your Expensify workspace to sync your accounting data. Expensify imports your accounts, dimensions, vendors, and tax rates from Business Central, and exports approved reports back to it.

This integration works with Dynamics 365 Business Central only. It doesn't connect to Dynamics 365 Finance and Operations or other Microsoft Dynamics products. For those, use a flat-file export. Learn more about [indirect accounting integrations](/articles/new-expensify/connections/Indirect-Accounting-Integrations).

---

## Who can connect to Dynamics 365 Business Central

To connect Dynamics 365 Business Central, you must:

- Be a workspace admin.
- Have a workspace on the Control plan.
- Have access to a Business Central environment where you can install extensions.
- Have a Microsoft Entra app registration for Expensify, with its Tenant ID, Client ID, and Client secret.

Dynamics 365 Business Central is rolling out gradually. If you don't see it under **Accounting**, it isn't available for your workspace yet.

---

## What to set up in Business Central before you connect

Expensify connects through an extension that runs inside Business Central. Complete these steps in Business Central first:

1. Install the Expensify extension from Microsoft AppSource in your Business Central environment.
2. Complete the extension's setup. This includes choosing the journal batch, templates, and number series that Expensify uses when it creates records.
3. Note your Business Central environment name, such as **Production**.
4. Copy the Tenant ID, Client ID, and Client secret from the Microsoft Entra app registration used for Expensify.

Keep these four values ready. You'll enter them in Expensify in the next section.

---

## How to connect Dynamics 365 Business Central to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Next to **Dynamics 365 Business Central**, select **Connect**.
3. On the **Before you connect...** page, confirm you've finished the Business Central setup, then select **Next**.
4. Enter your details in the **Tenant ID**, **Environment name**, **Client ID**, and **Client secret** fields.
5. Select **Confirm**.

Expensify checks your credentials, connects to Business Central, and starts the first sync.

Your Client secret is encrypted and stored on Expensify's servers. It's never shown in the app or stored on your device.

<!-- SCREENSHOT:
Suggestion: The "Enter your Dynamics 365 Business Central details" page with the Tenant ID, Environment name, Client ID, and Client secret fields visible and empty.
Location: Immediately after the steps in "How to connect Dynamics 365 Business Central to Expensify".
Purpose: Admins need to match four similar-looking Microsoft values to the right fields, and seeing the field order prevents them from pasting the Client ID into the Tenant ID field.
-->

---

## What happens after you connect to Dynamics 365 Business Central

After you connect, Expensify:

- Selects a Business Central company. If you have one company, Expensify selects it. If you have more than one, Expensify selects the first company in the list, and you can change it.
- Runs the first sync and imports your accounts as categories. Learn how to [configure Dynamics 365 Business Central import, export, and advanced settings](/articles/new-expensify/connections/business-central/Configure-Business-Central).
- Shows the connection on the **Accounting** page with the last sync time, the selected company under **Subsidiary**, and the **Import**, **Export**, and **Advanced** settings.

Every sync pulls the full set of data from Business Central. If you delete or block an account, dimension value, or vendor in Business Central, it's removed from Expensify on the next sync.

---

## How to change the Dynamics 365 Business Central company

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **Subsidiary**.
3. Select the Business Central company you want to sync with this workspace.

Expensify syncs data from the new company, including its accounts, dimensions, vendors, and tax rates.

You can only change the company if your Business Central environment has more than one company.

---

## How to disconnect Dynamics 365 Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**.
3. Select **Disconnect**.
4. Select **Disconnect** again to confirm.

Disconnecting stops all syncing with Business Central and removes the connection from the workspace.

---

# FAQ

## Why don't I see Dynamics 365 Business Central under Accounting?

Check that:

- Your workspace is on the Control plan. On other plans, selecting the integration prompts you to upgrade.
- You're a workspace admin.
- The integration is available for your workspace. It's rolling out gradually.

## Why don't I see tax settings after connecting?

Expensify only shows **Taxes** when your Business Central company has VAT posting setups. US companies usually don't, so tax settings don't appear for them.

## What should I do if the connection shows an authentication error?

Your Client secret may have expired or changed. To fix it:

1. Create a new Client secret on the Microsoft Entra app registration used for Expensify.
2. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**.
4. Select **Enter your credentials**.
5. Enter your details, then select **Confirm**.

## Why does the company picker say "No companies found"?

Expensify couldn't find a company in your Business Central environment. Add a company in Business Central. Then, on the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central** and select **Sync now**.
