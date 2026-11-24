---
title: BC28 Sync Error in Dynamics 365 Business Central
description: Learn what the BC28 sync error means and how to give the Expensify app access to a Dynamics 365 Business Central company so the connection can sync.
keywords: [BC28, BC28 sync error, credentials cannot reach any Business Central company, Business Central no company found, Expensify extension not installed, Microsoft Entra Applications, EXY FULLACCESS, workspace admin]
internalScope: Audience is workspace admins connecting or syncing Dynamics 365 Business Central. Covers resolving the BC28 sync error when the credentials are accepted but can't reach any company. Does not cover rejected credentials (BC04), invalid environment names (BC13), or companies without the Expensify setup (BC67).
contentType: task
order: 28
---

<!-- cspell:ignore FULLACCESS -->

# BC28 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC28 Sync Error: These credentials cannot reach any Business Central company. Check that the Expensify extension is installed and that the app registration has access to a company.")

Microsoft accepted the credentials, but Business Central didn't return a company that Expensify can sync with. Expensify can't import data or export reports until it can reach a company.

## Why the BC28 sync error happens

The BC28 error usually happens when:

- The Expensify extension isn't installed in the environment you entered. For example, it's installed in a sandbox environment, but you entered **Production**.
- The app on the **Microsoft Entra Applications** page in Business Central isn't enabled, or doesn't have the `EXY FULLACCESS` permission set.
- The environment doesn't have a company.

## How to fix the BC28 sync error in Business Central

1. In Business Central, open the environment you entered in the **Environment name** field in Expensify.
2. Search for **Extension Management** and confirm the **Expensify** extension is installed. If it isn't, install it from Microsoft Marketplace.
3. Search for **Microsoft Entra Applications** and open the app whose **Client ID** matches your app registration.
4. Confirm **State** is **Enabled** and **User Permission Sets** includes `EXY FULLACCESS`.
5. Search for **Companies** and confirm the environment has at least one company.

## How to sync Business Central after you fix the BC28 error

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

If the error appeared while you were connecting Business Central for the first time, Expensify didn't keep the details you entered. Select **More (⋮)** next to **Dynamics 365 Business Central**, select **Disconnect**, then connect again. Learn how to [connect to Business Central](/articles/new-expensify/connections/business-central/Connect-to-Business-Central).

## When to contact Concierge

Contact Concierge if the error still appears after you confirm the extension, the app, and the company in Business Central.
