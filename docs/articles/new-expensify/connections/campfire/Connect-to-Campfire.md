---
title: Connect to Campfire
description: Learn how to connect Campfire to Expensify with an API key, choose a subsidiary, and reconnect or disconnect the integration.
keywords: [New Expensify, Campfire integration, connect Campfire, Campfire API key, Campfire subsidiary, Campfire accounting sync, Campfire authentication error, disconnect Campfire, Workspace Admin]
internalScope: Audience is Workspace Admins connecting Campfire as an accounting integration. Covers adding the Campfire connection, entering the API key, choosing a subsidiary, fixing an authentication error, and disconnecting. Does not cover configuring import, export, or advanced sync settings, or exporting reports.
order: 1
---

# Connect to Campfire

Connect Campfire to your Expensify workspace to sync your accounting data. This article walks you through connecting Campfire with an API key, choosing a subsidiary, and completing the initial setup.

Once connected, the integration imports:

- Your chart of accounts as categories.
- Departments and custom dimensions as tags, if you enable them.
- Tax rates, if your Campfire organization has them and you enable them.

---

## Who can connect to Campfire

To connect Campfire, you must:

- Be a workspace admin with a workspace on the Control plan.
- Be able to generate an API key in Campfire.
  
---

## How to connect Campfire to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **Campfire**, select **Connect**.
4. On the **Campfire setup** page, follow the on-screen instructions to generate an API key in Campfire.
5. Paste the key into the **API key** field.
6. Select **Confirm**.

Expensify validates the API key and starts the first sync with Campfire. 

**Note:** Your API key is encrypted and stored securely on Expensify's servers. It is never exposed in the app or stored on your device.

---

## What happens after you connect to Campfire

After the connection is established, the **Connections** section updates to show your connected Campfire integration, including:

- The connection status and last sync timestamp.
- The selected subsidiary.
- The **Import**, **Export**, and **Advanced** configuration tabs.

If your Campfire organization has multiple subsidiaries, you can choose which one to connect. If only one eligible subsidiary is available, Expensify selects it automatically. The selected subsidiary determines which accounting data is available in Expensify.

After the first sync, you can configure how data imports and exports. Learn how to [configure Campfire import, export, and advanced settings](/articles/new-expensify/connections/campfire/Configure-Campfire).

---

## How to fix a Campfire authentication error

If the saved API key becomes invalid, Expensify displays an error on the Campfire connection. To reconnect to Campfire:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. Next to **Campfire**, select the three dots **(⋮)**.
4. Select **Enter your credentials**.
5. Create a new API key in Campfire and paste it into the **API key** field.
6. Select **Confirm**.

Expensify syncs again with the new key.

---

## How to disconnect Campfire

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. Next to **Campfire**, select the three dots **(⋮)**.
4. Select **Disconnect**.
5. Select **Disconnect** again to confirm.

Disconnecting Campfire stops future syncs and removes the connection from the workspace.

---

# FAQ

## Where do I generate my API key?

Generate the API key in Campfire, then paste it into the **API key** field during setup. The connection window includes instructions for generating an API key in Campfire.

## Why do I see an invalid credentials error after connecting?

If your Campfire API key is rejected or later becomes invalid, the connection shows an invalid credentials state and stops syncing. Generate a new API key in Campfire and reconnect to restore the connection.

## Is my Campfire API key secure?

Yes. Expensify encrypts your API key and stores it securely on its servers. The key is never exposed in the app or stored on your device.

## Why can’t I select a Campfire subsidiary?

**Subsidiary** is only selectable when your Campfire organization has more than one subsidiary. If Expensify shows **No subsidiaries found**, add an entity in Campfire, then sync the connection again.

## Why don’t I see tax rates after connecting to Campfire?

The **Tax rates** option only appears on the **Import** page when your Campfire subsidiary has tax rates set up.
