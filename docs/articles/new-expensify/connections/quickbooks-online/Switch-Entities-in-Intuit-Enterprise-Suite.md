---
title: Switch entities in Intuit Enterprise Suite
description: Choose which Intuit Enterprise Suite entity syncs with your Expensify workspace, and authorize additional entities.
keywords: [New Expensify, Intuit Enterprise Suite, IES, QuickBooks Online, entity, multi-entity, switch entity, connect new entity, accounting sync]
internalScope: Audience is Workspace Admins whose workspace is connected to QuickBooks Online with an Intuit Enterprise Suite subscription. Covers viewing the active entity, switching between authorized entities, and authorizing a new entity. Does not cover the initial QuickBooks Online connection or general accounting configuration.
order: 5
---

When your workspace is connected to **Intuit Enterprise Suite**, Expensify syncs with one entity (company) at a time. If you're authorized for more than one entity, you can switch which one syncs with the workspace, or authorize a new entity to connect. This lets a single workspace point at the correct Intuit Enterprise Suite entity without setting up a new connection.

Switching the entity changes which company Expensify imports from and exports to, so the workspace stays aligned with the entity you're actively working in.

---

# Who can switch entities in Intuit Enterprise Suite

To switch entities, you must:

- Be a **Workspace Admin**.
- Have the workspace connected to **QuickBooks Online** with an **Intuit Enterprise Suite** subscription.
- Be authorized for the Intuit Enterprise Suite entities you want to switch between.

If the workspace isn't connected yet, [learn how to connect to QuickBooks Online](/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).

---

# How to switch entities in Intuit Enterprise Suite

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select your **Workspace**.
3. Click **More features**.
4. Scroll to **Integrate** and enable the **Accounting** toggle.
5. Click **Accounting** in the left-hand menu.
6. On the **Entity** row, which shows the currently active company name, click the row.
7. On the entity selector screen, select the entity you want to sync with this workspace.

The selected entity becomes the active entity and you return to the **Accounting** page.

<!-- SCREENSHOT:
Suggestion: The entity selector screen showing the list of authorized entities with one selected, the "Select the entity to sync with this workspace." description, and the "Connect a new entity" option at the bottom.
Location: Immediately after step 7.
Purpose: Confirms members are on the correct screen and can distinguish switching an existing entity from connecting a new one.
-->

---

# How to connect a new entity in Intuit Enterprise Suite

If the entity you need isn't listed, you can authorize a new one from the same screen:

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select your **Workspace**.
3. Click **Accounting** in the left-hand menu.
4. On the **Entity** row, click the row to open the entity selector screen.
5. Click **Connect a new entity**.
6. Complete the Intuit authorization flow and select the company you want to add.

The newly authorized company becomes the active entity and appears in the entity list for future switching.

---

# What happens after you switch entities in Intuit Enterprise Suite

- Expensify imports coding configurations (such as accounts, classes, and locations) from the newly selected entity.
- Exports from the workspace go to the newly selected entity.
- The **Entity** row on the **Accounting** page updates to show the active company name.

---

# FAQ

## Why don't I see the Entity row on the Accounting page?

The **Entity** row only appears when your workspace is connected to **QuickBooks Online** with an **Intuit Enterprise Suite** subscription. A standard QuickBooks Online connection shows **Connected to** instead, which isn't clickable.

## Why can't I switch entities?

Only **Workspace Admins** can switch entities. You also need to be authorized for the entities you're trying to switch between. If an entity needs to be reconnected, selecting it starts the Intuit authorization flow instead of switching directly.

## Does switching entities affect existing expenses?

Switching changes which entity Expensify imports from and exports to going forward. Review your coding and export settings after switching to confirm they match the newly selected entity.
