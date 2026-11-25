---
title: BC04 Sync Error in Dynamics 365 Business Central
description: Learn what the BC04 sync error means and how to fix the Microsoft Entra app registration and credentials so Expensify can connect to Dynamics 365 Business Central.
keywords: [BC04, BC04 sync error, Business Central authentication error, can't connect to Dynamics 365 Business Central, Business Central credentials rejected, Business Central client secret expired, Microsoft Entra app registration, workspace admin]
internalScope: Audience is workspace admins connecting or syncing Dynamics 365 Business Central. Covers resolving the BC04 sync error and other errors where Microsoft Entra or Business Central rejects the connection's credentials. Does not cover missing credential values (BC09, BC17, BC22), invalid environment names (BC13), or errors after the credentials are accepted.
contentType: task
order: 4
---

<!-- cspell:ignore FULLACCESS -->

# BC04 Sync Error in Dynamics 365 Business Central

When Business Central rejects the connection's credentials, the **Accounting** page shows this message:

> Can’t connect to Dynamics 365 Business Central due to an authentication error.

Behind that message, Expensify records this error:

> BC04 Sync Error: Business Central rejected these credentials. Check the tenantID, clientID and client secret on the app registration.

This means Microsoft Entra or Business Central didn't accept the **Tenant ID**, **Client ID**, or **Client secret** saved for the connection, and didn't say why. Expensify can't sync or export reports until you fix the credentials.

## Why the BC04 sync error happens

The BC04 error usually happens when:

- The client secret expired. Client secrets expire after six months by default.
- The **Client secret** field has the secret's **Secret ID** instead of its **Value**.
- The **Tenant ID** or **Client ID** belongs to a different app registration or tenant.
- No admin granted consent for the Business Central `API.ReadWrite.All` permission.
- The app isn't enabled on the **Microsoft Entra Applications** page in Business Central, or doesn't have the `EXY FULLACCESS` permission set.

## How to check the app registration in Microsoft Entra

1. In the Microsoft Entra admin center, go to **App registrations** and open the app registration you use for Expensify.
2. On the **Overview** page, copy the **Application (client) ID** and **Directory (tenant) ID**.
3. Go to **Certificates & secrets** and check the expiration date of the client secret.
4. If the secret expired, or you didn't save its **Value**, select **New client secret**, enter a **Description**, choose an expiration date, and select **Add**.
5. Copy the new secret's **Value** right away. Entra hides it after you leave the page.
6. Go to **API permissions** and confirm that `API.ReadWrite.All` for **Dynamics 365 Business Central** shows **Granted**. If it doesn't, select **Grant admin consent**.

## How to check the Expensify app in Business Central

1. In Business Central, search for **Microsoft Entra Applications**.
2. Open the app whose **Client ID** matches your app registration.
3. Confirm **State** is **Enabled**.
4. Confirm **User Permission Sets** includes `EXY FULLACCESS`.

## How to fix the BC04 sync error in Business Central

After you check the app registration, enter the credentials again in Expensify:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Enter your credentials**.
3. If the **Before you connect...** page appears, select **Next**.
4. Enter the **Tenant ID**, **Environment name**, **Client ID**, and **Client secret**.
5. Select **Confirm**.

Expensify connects to Business Central and starts a sync.

## When to contact Concierge

Contact Concierge if the error still appears after you check the app registration and enter the credentials again.

# FAQ

## Why does the error have a longer code, such as BC7000215?

When Microsoft explains why it rejected the credentials, Expensify records Microsoft's error instead of BC04. The code is the Microsoft Entra error number with **BC** in front of it, and the error links to Microsoft's description of it. These are the most common:

| Code | What it means | How to fix it |
|---|---|---|
| BC7000215 | The client secret is wrong. | Enter the secret's **Value**, not its **Secret ID**. |
| BC7000222 | The client secret expired. | Create a new client secret and enter its **Value**. |
| BC700016 | Microsoft Entra can't find the app in the tenant. | Check the **Client ID** and **Tenant ID**. |
| BC90002 | Microsoft Entra can't find the tenant. | Check the **Tenant ID**. |

## Do I need to sync after I enter new credentials?

No. Expensify starts a sync as soon as you select **Confirm**.
