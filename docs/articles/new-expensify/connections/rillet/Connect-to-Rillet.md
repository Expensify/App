---
title: Connect to Rillet
description: Learn how to connect Rillet to Expensify with an API key to sync your accounting data.
keywords: [New Expensify, Rillet integration, connect Rillet, Rillet API key, accounting sync, Rillet setup]
internalScope: Audience is Workspace Admins connecting Rillet as an accounting integration. Covers adding the Rillet connection, entering the API key, and selecting a subsidiary. Does not cover configuring import, export, or advanced sync settings.
order: 1
---

Connect your Workspace to Rillet to sync your accounting data with Expensify. Rillet connects using an API key you generate in Rillet, so there is no separate login step. This article walks you through connecting, selecting a subsidiary, and disconnecting.

The Rillet integration is currently in beta and is rolled out to select customers.

## Who can connect to Rillet

- You must be a Workspace Admin.
- Your Workspace must be on the **Collect** or **Control** plan.
- You must be able to generate an API key in Rillet.

## How to connect Expensify to Rillet

1. In the left-hand menu, select **Settings**.
2. Select **Workspaces**, then choose your Workspace.
3. Select **More features**.
4. In the **Integrate** section, enable **Accounting**.
5. Select **Accounting** in the Workspace menu.
6. Click **Set up** next to **Rillet**.
7. Follow the on-screen instructions to generate an API key in Rillet, paste it into the **API key** field, and click **Confirm**.

Expensify validates the API key and fetches your Rillet organization and subsidiary data. Your API key is encrypted and stored on Expensify's servers only — it is never sent to your device or exposed in the app.

<!-- SCREENSHOT:
Suggestion: Capture the single-screen Rillet connection form showing the setup instructions, the API key field, and the Confirm button.
Location: After step 7.
Purpose: Confirms admins are on the correct API-key entry screen, which differs from the OAuth login flow used by other accounting connections and is a common point of confusion.
-->

## How to select a Rillet subsidiary

After the API key is validated, Expensify loads the subsidiaries available in your Rillet organization:

- If your Rillet organization has one eligible subsidiary, it is selected automatically.
- If your Rillet organization has more than one eligible subsidiary, the first is selected by default and you can choose a different one.

The selected subsidiary determines which accounts, dimensions, and tax rates sync into Expensify.

## What happens after you connect to Rillet

Expensify runs an initial sync and imports the Rillet data needed to configure the integration:

- Subsidiaries
- Chart of accounts
- Fields and dimensions
- Tax rates (when your Rillet organization returns them)

Once the initial sync finishes, you can set up how data imports to and exports from Rillet. Learn how to [configure your Rillet import, export, and advanced settings](/articles/new-expensify/connections/rillet/Configure-Rillet).

# FAQ

## Where do I generate my Rillet API key?

Generate the API key in Rillet, then paste it into the **API key** field on the Rillet connection screen in Expensify. The connection screen includes inline setup instructions for locating it in Rillet.

## Is my Rillet API key secure?

Yes. Your API key is encrypted and stored on Expensify's servers only. It never leaves Expensify's servers and is not sent to your device or exposed in the app.

## Why don't I see a tax rate option after connecting?

The tax rate settings appear only when your Rillet organization returns tax rates during sync. If Rillet returns no tax rates, the toggle is hidden.

## How do I disconnect Rillet from Expensify?

1. In the left-hand menu, select **Settings > Workspaces**, then choose your Workspace.
2. Select **Accounting** in the Workspace menu.
3. Select the three dots **(⋮)** next to **Rillet**.
4. Select **Disconnect**, then confirm.

After disconnecting, data previously imported from Rillet no longer appears in your Workspace.
