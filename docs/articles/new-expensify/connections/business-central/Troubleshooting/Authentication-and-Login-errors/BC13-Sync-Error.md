---
title: BC13 Sync Error in Dynamics 365 Business Central
description: Learn what the BC13 sync error means and how to find the exact environment name to enter for your Dynamics 365 Business Central connection.
keywords: [BC13, BC13 sync error, Business Central environment name invalid, Business Central admin center environments, Production environment name, Business Central authentication error, can't connect to Dynamics 365 Business Central, workspace admin]
internalScope: Audience is workspace admins connecting Dynamics 365 Business Central. Covers resolving the BC13 sync error caused by an environment name that Business Central can't have. Does not cover rejected credentials (BC04), missing credential values (BC09, BC17, BC22), or an environment without the Expensify extension (BC28).
contentType: task
order: 13
---

# BC13 Sync Error in Dynamics 365 Business Central

When the environment name isn't valid, the **Accounting** page shows this message:

> Can’t connect to Dynamics 365 Business Central due to an authentication error.

Behind that message, Expensify records this error:

> BC13 Sync Error: The environment name is invalid. Environment names start with a letter and have up to 30 letters, numbers, underscores (_) or hyphens (-). Copy the name from the Environments list in the Business Central admin center, then try again.

This means the **Environment name** you entered can't be the name of a Business Central environment. Expensify didn't save the credentials you entered.

## Why the BC13 sync error happens

Business Central environment names start with a letter and have up to 30 letters, numbers, underscores, or hyphens. The BC13 error happens when the **Environment name** field:

- Contains spaces or other characters, such as a period or a slash.
- Contains a URL instead of the name.
- Starts with a number, an underscore, or a hyphen.
- Is longer than 30 characters.

## How to find your environment name

Use either of these places:

- In the Business Central admin center, select **Environments**. Copy the name from the **Name** column, such as **Production**.
- In Business Central, the **Expensify Assisted Setup** wizard shows the **Environment name**.

Use the environment where the Expensify extension is installed.

## How to fix the BC13 sync error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Enter your credentials**.
3. If the **Before you connect...** page appears, select **Next**.
4. Enter the **Tenant ID**, **Environment name**, **Client ID**, and **Client secret**.
5. Select **Confirm**.

Expensify connects to Business Central and starts a sync.

## When to contact Concierge

Contact Concierge if the error still appears after you copy the environment name from the Business Central admin center.
