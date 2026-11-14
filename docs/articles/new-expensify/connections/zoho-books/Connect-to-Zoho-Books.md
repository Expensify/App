---
title: Connect to Zoho Books
description: Learn how to connect your Zoho Books organization to Expensify and manage the connection.
keywords: [New Expensify, connect Zoho Books, Zoho Books integration, Zoho Books organization, reconnect Zoho Books]
internalScope: Audience is workspace admins connecting Zoho Books. Covers prerequisites, authorization, organization selection, reconnecting, and disconnecting. Does not cover import settings, export settings, or report exports.
order: 1
---

# Connect to Zoho Books

Connect Zoho Books to your Expensify workspace to import accounting data and export expenses. Each workspace connects to one Zoho Books organization.

## Who can connect to Zoho Books

To connect Zoho Books, you must:

- Be a workspace admin on a Collect or Control workspace.
- Have access to a Zoho Books organization on the Professional plan or higher.
- Use a single-location organization. Organizations with multiple active locations aren't supported.
- Be able to sign in to Zoho and authorize the connection.

## How to connect Zoho Books to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Find **Zoho Books** and select **Connect**.
3. If an existing connection is offered, select it to reuse it, or select **Create new connection** to authorize another connection.
4. Follow the prompts to sign in to Zoho and authorize Expensify.
5. After connecting, select **Configure** next to Zoho Books to review the connected organization.

Expensify selects an eligible organization automatically. If more than one organization is available, select **Zoho Books organization** in the connection settings to choose the one to use. With only one eligible organization, there's no organization choice to make.

## What happens after you connect to Zoho Books

The connection imports your chart of accounts as categories and retrieves vendors and available reporting tags and tax rates. Reporting tags and tax rates are optional imports that you can enable in the configuration settings.

Select **Configure** next to Zoho Books to review the organization, connection status, and **Import**, **Export**, and **Advanced** settings.

Learn how to [configure Zoho Books import, export, and advanced settings](/articles/new-expensify/connections/zoho-books/Configure-Zoho-Books).

## How to reconnect Zoho Books

If the connection requires authorization again:

1. Select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to Zoho Books.
3. Select **More (⋮)**, then **Enter your credentials**.
4. Follow the prompts to sign in to Zoho and authorize the connection again.

For a connected organization that doesn't require reauthorization, select **More (⋮) > Sync now** to refresh its accounting data.

## How to disconnect Zoho Books

1. Select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to Zoho Books.
3. Select **More (⋮) > Disconnect**.
4. Follow the prompts to confirm.

Disconnecting stops future synchronization with Zoho Books for this workspace.
