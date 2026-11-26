---
title: BC09 Sync Error in Dynamics 365 Business Central
description: Learn what the BC09 sync error means and how to find and enter the Tenant ID for your Dynamics 365 Business Central connection.
keywords: [BC09, BC09 sync error, Business Central Tenant ID missing, Directory (tenant) ID, Business Central authentication error, can't connect to Dynamics 365 Business Central, workspace admin]
internalScope: Audience is workspace admins connecting Dynamics 365 Business Central. Covers resolving the BC09 sync error caused by a blank Tenant ID. Does not cover rejected credentials (BC04), invalid environment names (BC13), or other missing credential values (BC17, BC22).
contentType: task
order: 9
---

# BC09 Sync Error in Dynamics 365 Business Central

When the connection's credentials are incomplete, the **Accounting** page shows this message:

> Can’t connect to Dynamics 365 Business Central due to an authentication error.

Behind that message, Expensify records this error:

> BC09 Sync Error: The tenantID is missing or malformed.

This means the **Tenant ID** field was blank when the credentials were entered. Expensify needs all four values, so it didn't save the ones you entered.

## Why the BC09 sync error happens

The BC09 error happens when the **Tenant ID** field only contains spaces. This can happen when a copied value doesn't paste correctly.

## How to find your Tenant ID

Use either of these places:

- In the Microsoft Entra admin center, open the app registration you use for Expensify. The **Overview** page shows the **Directory (tenant) ID**.
- In Business Central, the **Expensify Assisted Setup** wizard shows the **Tenant ID**.

Use the **Directory (tenant) ID**, not the **Object ID**.

## How to fix the BC09 sync error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Enter your credentials**.
3. If the **Before you connect...** page appears, select **Next**.
4. Enter the **Tenant ID**, **Environment name**, **Client ID**, and **Client secret**.
5. Select **Confirm**.

Expensify connects to Business Central and starts a sync.

## When to contact Concierge

Contact Concierge if the error still appears after you enter the **Tenant ID** again.
