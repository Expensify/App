---
title: Connect to Campfire
description: Learn how to connect Campfire to Expensify with an API key, choose a subsidiary, and reconnect or disconnect the integration.
keywords: [New Expensify, Campfire integration, connect Campfire, Campfire API key, Campfire subsidiary, Campfire accounting sync, Campfire authentication error, disconnect Campfire, Workspace Admin]
internalScope: Audience is Workspace Admins connecting Campfire as an accounting integration. Covers adding the Campfire connection, entering the API key, choosing a subsidiary, fixing an authentication error, and disconnecting. Does not cover configuring import, export, or advanced sync settings, or exporting reports.
order: 1
---

# Connect to Campfire

Connect Campfire to your Expensify workspace to sync your accounting data without CSV exports or manual entry. This article walks you through connecting Campfire with an API key, choosing a subsidiary, and fixing or removing the connection.

Once connected, the integration imports:

- Your chart of accounts as categories.
- Departments and Campfire dimensions as tags, if you turn them on.
- Tax rates, if your Campfire organization has them and you turn them on.

---

## Who can connect to Campfire

To connect Campfire, you must:

- Be a Workspace Admin.
- Be using a workspace on the **Control** plan.
- Be able to create an API key in Campfire.

If your workspace is on the Collect plan, selecting Campfire prompts you to upgrade to the Control plan.

---

## How to connect Campfire to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section next to **Campfire**, select **Connect**.
4. If you've connected another workspace to Campfire before, choose an existing connection to reuse it, or select **Create new connection**.
5. On the **Campfire setup** page, follow the **Finding your API key** steps to create an API key in Campfire.
6. Paste the key into the **API key** field.
7. Click **Confirm**.

Expensify validates the API key and starts the first sync with Campfire. The Campfire connection shows its progress while the sync runs.

**Note:** Your API key is encrypted and stored securely on Expensify's servers. It is never exposed in the app or stored on your device.

<!-- SCREENSHOT:
Suggestion: The Campfire setup page showing the "Enter your Campfire API key" heading, the Finding your API key steps, and the API key field.
Location: After step 7 of "How to connect Campfire to Expensify".
Purpose: Shows admins where the API key goes and confirms which Campfire menu (Settings -> API Keys) to open to create one.
-->

---

## What happens after you connect to Campfire

After the first sync completes, the Campfire connection on the **Accounting** page shows:

- The last sync time.
- The selected **Subsidiary**.
- The **Import**, **Export**, and **Advanced** settings.

Other accounting integrations move under **Other**.

Expensify selects a subsidiary automatically. If your Campfire organization has more than one subsidiary, you can change it at any time.

After the first sync, you can configure how data imports and exports. Learn how to [configure Campfire import, export, and advanced settings](/articles/new-expensify/connections/campfire/Configure-Campfire).

---

## How to change the Campfire subsidiary

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the Campfire connection, select **Subsidiary**.
4. Choose the subsidiary you want to import data from.

Expensify syncs again using the subsidiary you chose.

**Note:** You can only select **Subsidiary** when your Campfire organization has more than one subsidiary.

---

## How to fix a Campfire authentication error

If your API key is revoked or no longer valid, the Campfire connection shows **Can’t connect to Campfire due to an authentication error.** To reconnect:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. Next to **Campfire**, select the three dots **(⋮)**.
4. Select **Enter your credentials**.
5. Create a new API key in Campfire and paste it into the **API key** field.
6. Click **Confirm**.

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

## Where do I create my Campfire API key?

In Campfire, go to **Settings -> API Keys** and create an API key. The **Campfire setup** page in Expensify lists these steps under **Finding your API key**.

## Is my Campfire API key secure?

Yes. Expensify encrypts your API key and stores it securely on its servers. The key is never exposed in the app or stored on your device.

## Why can’t I select a Campfire subsidiary?

**Subsidiary** is only selectable when your Campfire organization has more than one subsidiary. If Expensify shows **No subsidiaries found**, add an entity in Campfire, then sync the connection again.

## Why don’t I see tax rates after connecting to Campfire?

The **Tax rates** option only appears on the **Import** page when your Campfire organization has tax rates set up.

## Why don’t I see Campfire on the Accounting page?

Campfire is available on the **Control** plan only. If you still don't see it, make sure you're a Workspace Admin on the workspace.
