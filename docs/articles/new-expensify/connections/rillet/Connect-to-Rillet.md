---
title: Connect to Rillet
description: Learn how to connect Rillet to Expensify with an API key to sync your accounting data.
keywords: [New Expensify, Rillet integration, connect Rillet, Rillet API key, accounting sync, Rillet setup]
internalScope: Audience is Workspace Admins connecting Rillet as an accounting integration. Covers adding the Rillet connection, entering the API key, and selecting a subsidiary. Does not cover configuring import, export, or advanced sync settings.
order: 1
---

# Connect to Rillet

Connect Rillet to your Expensify workspace to sync your accounting data. This article walks you through connecting Rillet, selecting a subsidiary, and completing the initial setup.

Once connected, the integration imports:

- Your chart of accounts as categories.
- Departments, Projects, and Classes as tags.
- Tax rates (when available).

The Rillet integration is currently in beta and is available to select customers.

---

## Who can connect to Rillet

To connect Rillet, you must:

- Be a Workspace Admin.
- Be using a workspace on the **Control** plan.
- Be able to generate an API key in Rillet.

---

## How to connect Rillet to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **Rillet**, select **Connect**.
4. In the **Rillet setup** page that opens, follow the on-screen instructions to generate an API key in Rillet, paste it into the **API key** field, and click **Confirm**.

Expensify validates the API key, connects to your Rillet organization, and retrieves your available subsidiaries.

**Note:** Your API key is encrypted and stored securely on Expensify's servers. It is never exposed in the app or stored on your device.

![Connections page showing Rillet option]({{site.url}}/assets/images/Accounting_Rillet.png){:width="100%"}

---

## What happens after you connect to Rillet

After the connection is established, the **Connections** section updates to show your connected Rillet integration, including:

- The connection status and last sync timestamp.
- The selected subsidiary.
- The **Import**, **Export**, and **Advanced** configuration settings.
- Additional integration options under **Other**.

If your Rillet organization has multiple subsidiaries, you can choose which one to connect. If only one eligible subsidiary is available, Expensify selects it automatically. The selected subsidiary determines which accounting data is available in Expensify.

After the initial sync completes, you can configure your import, export, and advanced accounting settings. Learn how to [configure your Rillet import, export, and advanced settings](/articles/new-expensify/connections/rillet/Configure-Rillet).

---

## How to disconnect Rillet 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**
2. Select **Accounting**.
3. In the **Connections** section next to **Rillet**, select the three dots **(⋮)**.
4. Choose **Disconnect**.
5. Confirm the disconnect.

Disconnecting Rillet stops future synchronization and removes the connection from the workspace.

---

# FAQ

## Where do I generate my API key?

Generate the API key in Rillet, then paste it into the **API key** field during setup. The connection window includes instructions for locating your API key.

## Is my API key secure?

Yes. Expensify encrypts your API key and stores it securely on its servers. The key is never exposed in the app or stored on your device.

## Why don't I see tax rates after connecting?

Tax rates are only imported if your Rillet organization returns them. If no tax rates are available, tax rate options won't appear in Expensify.

## Can I change which subsidiary is used?

Yes. If your Rillet organization has multiple subsidiaries, you can select a different subsidiary at any time from the **Connections** section. Expensify will sync data from the newly selected subsidiary, including its accounts, dimensions, and tax rates.
