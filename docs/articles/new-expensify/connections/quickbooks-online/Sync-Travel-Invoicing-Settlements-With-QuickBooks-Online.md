---
title: Sync travel invoicing settlements with QuickBooks Online
description: Turn on Sync travel invoicing settlements to have Expensify continuously reconcile travel invoicing settlements against a bank account in QuickBooks Online.
keywords: [sync travel invoicing settlements, QuickBooks Online, continuous reconciliation, reconciliation account, travel invoicing, advanced settings]
internalScope: Audience is Workspace Admins on workspaces connected to QuickBooks Online with Travel Invoicing enabled. Covers enabling the Sync travel invoicing settlements toggle and selecting a reconciliation account. Does not cover connecting QuickBooks Online, enabling Travel Invoicing, or other advanced settings.
---

# Sync travel invoicing settlements with QuickBooks Online

**Sync travel invoicing settlements** lets Expensify continuously reconcile your travel invoicing settlements against a bank account in QuickBooks Online.

When enabled:
- Travel invoicing settlements are reconciled automatically as they post.
- You choose the bank account that settlements are reconciled against.
- You save time on manual reconciliation each accounting period.

---

## Who can sync travel invoicing settlements with QuickBooks Online

- Workspace Admins can enable and manage this setting.
- The workspace must be connected to QuickBooks Online.
- **Auto-sync** must be enabled for the QuickBooks Online connection.
- Travel Invoicing must be enabled on the workspace.

If Travel Invoicing is not enabled, the **Sync travel invoicing settlements** toggle will not appear. [Learn how to enable Travel Invoicing on a Workspace](/articles/travel/travel-invoicing/Enable-Travel-Invoicing-in-a-Workspace).

If **Auto-sync** is off, the **Sync travel invoicing settlements** toggle is disabled until you turn **Auto-sync** on.

---

## How to sync travel invoicing settlements with QuickBooks Online

1. From the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**.
2. Click **Advanced** under the QuickBooks Online connection.
3. Turn on the **Sync travel invoicing settlements** toggle.
4. On the reconciliation account page, choose the bank account that your travel invoicing payments will be reconciled against.

<!-- SCREENSHOT:
Suggestion: QuickBooks Online Advanced settings page with the Sync travel invoicing settlements toggle enabled and the Reconciliation account row visible.
Location: After the steps in this section.
Purpose: Show admins where the toggle and reconciliation account appear.
-->

---

## How to change the reconciliation account

1. From the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**.
2. Click **Advanced** under the QuickBooks Online connection.
3. Click **Reconciliation account**.
4. Select a different bank account.

---

## What happens after you turn on Sync travel invoicing settlements

- Expensify continuously reconciles travel invoicing settlements against the selected bank account in QuickBooks Online.
- The **Reconciliation account** shows the bank account currently used for reconciliation.
- Turning off **Auto-sync** for QuickBooks Online disables the **Sync travel invoicing settlements** toggle.

---

# FAQ

## Why can't I see the Sync travel invoicing settlements toggle?

The toggle only appears when Travel Invoicing is enabled on the workspace and QuickBooks Online is connected. If Travel Invoicing is not enabled, the toggle is hidden.

## Why is the Sync travel invoicing settlements toggle disabled?

The toggle is disabled when **Auto-sync** is off for the QuickBooks Online connection. Turn on **Auto-sync** in the **Advanced** settings to enable it.

## Which bank account should I choose as the reconciliation account?

Choose the bank account that your travel invoicing payments are settled from, so reconciliation matches your settlements correctly.
