---
title: Connect to Campfire
description: Learn how to connect Campfire to Expensify with an API key to sync your accounting data.
keywords: [New Expensify, Campfire integration, connect Campfire, Campfire API key, accounting sync, Campfire setup]
internalScope: Audience is Workspace Admins connecting Campfire as an accounting integration. Covers adding the Campfire connection, entering the API key, selecting a subsidiary, and what the initial sync imports. Does not cover configuring import, export, or advanced sync settings.
order: 1
---

# Connect to Campfire

Connect Campfire to your Expensify workspace to sync your accounting data. This article walks you through connecting Campfire, selecting a subsidiary, and completing the initial setup.

Once connected, the integration imports:

- Your chart of accounts as categories.
- Departments and custom dimensions as tags when enabled.
- Vendors used to match expense exports.
- Tax rates (when your Campfire organization has them configured).

The Campfire integration is currently in beta and is available to select customers.

---

## Who can connect to Campfire

To connect Campfire, you must:

- Be a Workspace Admin with a workspace on the Control plan.
- Be able to generate an API key in Campfire.

---

## How to connect Campfire to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **Campfire**, select **Connect**.
4. In the **Campfire setup** pages, follow the on-screen instructions to generate an API key in Campfire.
5. Paste the key into the **API key** field and select **Confirm**.

Expensify validates the API key, connects to your Campfire organization, and retrieves your available subsidiaries. The first available subsidiary is selected automatically.

**Note:** Your API key is encrypted and stored securely on Expensify's servers. It is never exposed in the app or stored on your device.

<!-- SCREENSHOT:
Suggestion: The Accounting page Connections section with Campfire listed and the Connect button visible.
Location: Immediately after the connection steps.
Purpose: Admins connecting a new integration often can't tell which row on the Accounting page is Campfire versus an already-connected integration, which is the most common point where setup stalls.
-->

---

## What happens after you connect to Campfire

After the connection is established, Expensify runs the initial sync and imports your entities, chart of accounts, dimensions, vendors, and tax rates. The **Connections** section then updates to show your connected Campfire integration, including:

- The connection status and last sync timestamp.
- The selected subsidiary.
- The **Import**, **Export**, and **Advanced** configuration settings.

Connecting and disconnecting Campfire are posted as workspace updates in the workspace's **#admins** room, so admins can see who changed the connection and when.

After the initial sync completes, you can configure your import, export, and advanced accounting settings. Learn how to [configure your Campfire import, export, and advanced settings](/articles/new-expensify/connections/campfire/Configure-Campfire).

---

## What Campfire data imports into Expensify

The initial sync imports the following:

- **Categories** – Active Campfire accounts with the expense, cost of goods sold, other expense, other current asset, deferred expense, prepaid, fixed asset, and long-term liability subtypes import as categories.
- **Departments** – Campfire departments appear as a dimension you can import as tags. This is off by default.
- **Custom dimensions** – Each Campfire custom dimension group appears as its own dimension you can import as tags. These are off by default.
- **Vendors** – Used to match out-of-pocket expense exports to the report submitter.
- **Tax rates** – Payable-type Campfire tax rates can import as taxes. Tax rate import appears only when your Campfire organization has tax rates configured.

---

## How to reconnect Campfire after an authentication error

If the saved API key becomes invalid, Expensify displays an invalid credentials error on the Campfire connection and stops syncing. To reconnect to Campfire:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. Next to the Campfire connection, select the three dots **(⋮)**.
4. Select **Reconnect**.
5. Enter a valid Campfire API key and select **Confirm**.

---

# FAQ

## Where do I generate my API key?

Generate the API key in Campfire, then paste it into the **API key** field during setup. The connection window includes instructions for generating an API key in Campfire.

## Is my API key secure?

Yes. Expensify encrypts your API key and stores it securely on its servers. The key is never exposed in the app or stored on your device.

## Why do I see an invalid credentials error after connecting?

If your Campfire API key is rejected or later becomes invalid, the connection shows an invalid credentials state and stops syncing. Generate a new API key in Campfire and reconnect to restore the connection.

## Why don't I see tax rates after connecting?

Tax rates are only available when your Campfire organization has payable-type tax rates configured. When they're available, tax rate import can be enabled from the Campfire **Import** settings.

## Can I change which subsidiary is used?

Yes. If your Campfire organization has multiple subsidiaries, you can select a different subsidiary at any time from the **Connections** section. Expensify will sync data from the newly selected subsidiary.

## Do my categories change when I switch subsidiaries?

No. Campfire shares one chart of accounts across all of its entities, so your imported categories are the same no matter which subsidiary you select.

## How can I disconnect Campfire from a workspace?

You can disconnect Campfire from the **Accounting** page. Select the three dots **(⋮)** next to Campfire and select **Disconnect**. Disconnecting Campfire stops future synchronization and removes the connection from the workspace.
