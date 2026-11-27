---
title: BC22 Sync Error in Dynamics 365 Business Central
description: Learn what the BC22 sync error means and how to create and enter a client secret for your Dynamics 365 Business Central connection.
keywords: [BC22, BC22 sync error, Business Central client secret missing, client secret value, Business Central authentication error, can't connect to Dynamics 365 Business Central, workspace admin]
internalScope: Audience is workspace admins connecting Dynamics 365 Business Central. Covers resolving the BC22 sync error caused by a blank client secret. Does not cover rejected or expired client secrets (BC04), invalid environment names (BC13), or other missing credential values (BC09, BC17).
contentType: task
order: 22
---

# BC22 Sync Error in Dynamics 365 Business Central

When the connection's credentials are incomplete, the **Accounting** page shows this message:

> Can’t connect to Dynamics 365 Business Central due to an authentication error.

Behind that message, Expensify records this error:

> BC22 Sync Error: The client secret is missing or malformed.

This means the **Client secret** field was blank when the credentials were entered. Expensify needs all four values, so it didn't save the ones you entered.

## Why the BC22 sync error happens

The BC22 error happens when the **Client secret** field only contains spaces. This can happen when a copied value doesn't paste correctly.

## How to get a client secret

Microsoft Entra only shows a client secret's **Value** when you create it. If you didn't save it, create a new one:

1. In the Microsoft Entra admin center, go to **App registrations** and open the app registration you use for Expensify.
2. Go to **Certificates & secrets**, then select **New client secret**.
3. Enter a **Description**, choose an expiration date, and select **Add**.
4. Copy the secret's **Value** right away. Don't use the **Secret ID**.

## How to fix the BC22 sync error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Enter your credentials**.
3. If the **Before you connect...** page appears, select **Next**.
4. Enter the **Tenant ID**, **Environment name**, **Client ID**, and **Client secret**.
5. Select **Confirm**.

Expensify connects to Business Central and starts a sync.

## When to contact Concierge

Contact Concierge if the error still appears after you enter the client secret again.
