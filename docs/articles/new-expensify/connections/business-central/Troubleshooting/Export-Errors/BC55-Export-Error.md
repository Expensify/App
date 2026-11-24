---
title: Resolve the BC55 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC55 export error when an expense categorized with a Dynamics 365 Business Central item exports as a general journal.
keywords: [BC55, BC55 export error, journal entries cannot post to items, Business Central item category, G/L account, purchase invoices, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC55 by selecting a G/L account category or exporting the affected expense type as purchase invoices. Does not cover missing categories (BC93) or other journal errors.
contentType: task
platform: [web, mobile]
order: 55
---

# Resolve the BC55 Export Error in Dynamics 365 Business Central

## What the BC55 export error means

If a report shows this error:

> BC55 Export Error: Journal entries can't post to Business Central items. Change the category of expense [merchant] from [category] to a G/L account, or export these expenses as purchase invoices, then try again.

The expense uses a Business Central item as its category, but its export setting is **General journal**. Items are supported on purchase invoices, not journal lines.

## Why the BC55 export error happens

Business Central G/L accounts and items both import as categories. An item category can't supply the G/L account required for a general journal export.

## How to fix the BC55 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** and open the report.
2. Open the expense named in the error and select **Category**.
3. Choose a category imported from a Business Central G/L account rather than an item.
4. Check the other expenses for item categories, then export the report again.

If the expenses must keep their item categories:

1. Select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Export**.
3. Set **Export reimbursable expenses as** or **Export company card expenses as** to **Purchase invoices**, depending on the affected expenses.
4. Export the report again.

Changing the export setting affects future exports of that expense type, not just this report.

## When to contact Concierge

Contact Concierge if BC55 still appears after you select G/L account categories or change the affected export setting to **Purchase invoices**.
