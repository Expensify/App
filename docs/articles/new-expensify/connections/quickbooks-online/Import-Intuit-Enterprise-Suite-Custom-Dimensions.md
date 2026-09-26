---
title: Import Intuit Enterprise Suite custom dimensions as tags
description: Turn on the Import setting for each Intuit Enterprise Suite custom dimension so its values sync into your workspace as tags in New Expensify.
keywords: [New Expensify, Intuit Enterprise Suite, IES, custom dimensions, import custom dimensions, custom dimensions as tags, Import settings, tags, Control plan, Workspace Admin]
internalScope: Audience is Workspace Admins. Covers turning the Import setting on or off for Intuit Enterprise Suite custom dimensions so their values sync as tags. Does not cover connecting Intuit Enterprise Suite, the other Import settings, export settings, or advanced settings.
---

# Import Intuit Enterprise Suite custom dimensions as tags

If your Intuit Enterprise Suite entity uses custom dimensions, you can import each one into Expensify as tags. Once a custom dimension is imported, its values appear as tags that members can select when coding an expense, so your expense data matches the way you already track it in Intuit Enterprise Suite.

Each custom dimension is controlled separately, so you can import only the ones you want.

---

## Who can import Intuit Enterprise Suite custom dimensions

To import custom dimensions, you must:

- Be a Workspace Admin with a workspace on the Control plan.
- Have **Accounting** enabled on your workspace, under **More features**.
- Have Intuit Enterprise Suite connected to the workspace.

Only custom dimensions that are active in the connected Intuit Enterprise Suite entity appear in Expensify. Custom dimensions are specific to Intuit Enterprise Suite, so they do not appear on a workspace connected to QuickBooks Online.

If Intuit Enterprise Suite is not connected yet, learn how to [connect to Intuit Enterprise Suite](/articles/new-expensify/connections/quickbooks-online/Connect-to-Intuit-Enterprise-Suite).

---

## How to import an Intuit Enterprise Suite custom dimension as tags

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. In the **Connections** section under **Intuit Enterprise Suite**, select **Import**.
4. Select the custom dimension you want to import. Each active custom dimension has its own row, labeled with its name from Intuit Enterprise Suite.
5. Turn on **Import**.

<!-- SCREENSHOT:
Suggestion: The Intuit Enterprise Suite Import page, showing the custom dimension rows listed between Classes and Customers, with one row reading Imported as tags and another reading Not imported.
Location: After step 5 in "How to import an Intuit Enterprise Suite custom dimension as tags".
Purpose: Admins expect custom dimensions to appear under Tags or on a separate page, so this confirms they are looking in the right place on the Import page and shows which dimensions are already imported.
-->

To stop importing a custom dimension, repeat these steps and turn off **Import**.

---

## What happens after you turn on Import for a custom dimension

- The custom dimension's row on the **Import** page changes from **Not imported** to **Imported as tags**.
- The custom dimension is always imported as tags. The **Displayed as** setting on the custom dimension's page shows **Tags** and cannot be changed.
- On the next sync, the custom dimension's values are imported into your workspace's **Tags**, where members can select them when coding an expense.
- Only the custom dimensions you turned on are imported. Turning one on or off does not change your other Import settings.

---

# FAQ

## Why don't I see my custom dimensions on the Import page?

Check the following:

- The workspace is connected to Intuit Enterprise Suite, not QuickBooks Online. Only Intuit Enterprise Suite connections have custom dimensions.
- The custom dimension is active in the connected Intuit Enterprise Suite entity. Inactive custom dimensions are not shown in Expensify.
- The connection has synced since the custom dimension was created in Intuit Enterprise Suite.

## Can I import a custom dimension as report fields instead of tags?

No. Custom dimensions are always imported as tags, and **Displayed as** cannot be changed to report fields.

## Where do imported custom dimension values appear?

They appear in your workspace's **Tags**, alongside the tags imported from your other dimensions.
