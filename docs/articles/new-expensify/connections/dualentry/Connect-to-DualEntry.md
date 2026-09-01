---
title: Connect to DualEntry
description: Learn how to connect DualEntry to Expensify with an API key to sync your accounting data.
keywords: [New Expensify, DualEntry integration, connect DualEntry, DualEntry API key, accounting sync, DualEntry setup]
internalScope: Audience is Workspace Admins connecting DualEntry as an accounting integration. Covers adding the DualEntry connection, entering the API key, and selecting a subsidiary. Does not cover configuring import, export, or advanced sync settings.
order: 1
---

# Connect to DualEntry

Connect DualEntry to your Expensify workspace to sync your accounting data. This article walks you through connecting DualEntry, selecting a subsidiary, and completing the initial setup.

Once connected, the integration imports:

- Your chart of accounts as categories.
- Your DualEntry dimensions as tags.
- Tax rates (when available).

---

## Who can connect to DualEntry

To connect DualEntry, you must:

- Be a Workspace Admin.
- Be using a workspace on the **Control** plan.
- Be able to generate an API key in DualEntry.

---

## How to connect DualEntry to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **DualEntry**, select **Connect**.
4. In the **DualEntry setup** page that opens, follow the on-screen instructions to generate an API key in DualEntry, paste it into the **API key** field, and click **Confirm**.

Expensify validates the API key, connects to your DualEntry organization, and retrieves your available subsidiaries.

**Note:** Your API key is encrypted and stored securely on Expensify's servers. It is never exposed in the app or stored on your device.

![The Accounting page Connections section with DualEntry shown and the Connect button visible]({{site.url}}/assets/images/DualEntry_connect.png){:width="100%"}

---

## What happens after you connect to DualEntry

After the connection is established, the **Connections** section updates to show your connected DualEntry integration, including:

- The connection status and last sync timestamp.
- The selected subsidiary.
- The **Import**, **Export**, and **Advanced** configuration settings.

If your DualEntry organization has multiple subsidiaries, you can choose which one to connect. If only one eligible subsidiary is available, Expensify selects it automatically. The selected subsidiary determines which accounting data is available in Expensify.

After the initial sync completes, you can configure your import, export, and advanced accounting settings. Learn how to [configure your DualEntry import, export, and advanced settings](/articles/new-expensify/connections/dualentry/Configure-DualEntry).

---

## How to disconnect DualEntry

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **DualEntry**, select the three dots **(⋮)**.
4. Choose **Disconnect**.
5. Confirm the disconnect.

Disconnecting DualEntry stops future synchronization and removes the connection from the workspace.

---

# FAQ

## Where do I generate my API key?

Generate the API key in DualEntry, then paste it into the **API key** field during setup. The connection window includes instructions for locating your API key.

## Is my API key secure?

Yes. Expensify encrypts your API key and stores it securely on its servers. The key is never exposed in the app or stored on your device.

## Why do I see an invalid credentials error after connecting?

If your DualEntry API key is rejected or later becomes invalid, the connection shows an invalid credentials state and stops syncing. Generate a new API key in DualEntry and reconnect to restore the connection.

## Why don't I see tax rates after connecting?

Tax rates are only imported if your DualEntry subsidiary returns them. If no tax rates are available, tax rate options won't appear in Expensify.

## Can I change which subsidiary is used?

Yes. If your DualEntry organization has multiple subsidiaries, you can select a different subsidiary at any time from the **Connections** section. Expensify will sync data from the newly selected subsidiary, including its accounts, dimensions, and tax rates.
