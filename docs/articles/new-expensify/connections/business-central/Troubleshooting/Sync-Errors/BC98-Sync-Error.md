---
title: BC98 Sync Error in Dynamics 365 Business Central
description: Learn what the BC98 sync error means and how to set up Dynamics 365 Business Central G/L accounts so Expensify can import them as categories.
keywords: [BC98, BC98 sync error, no Business Central accounts can be imported as categories, Business Central direct posting, blocked G/L account, Business Central chart of accounts, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving the BC98 sync error when no G/L account can be imported as a category. Does not cover importing items, dimensions, or tax rates.
contentType: task
order: 98
---

# BC98 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC98 Sync Error: No Business Central accounts can be imported as categories. Make sure at least one G/L account allows direct posting and isn't blocked, then sync again.")

Expensify imports your Business Central G/L accounts as categories, but none of them can be used. To protect the categories you already have, Expensify stops the sync instead of removing them.

## Why the BC98 sync error happens

Expensify only imports G/L accounts that:

- Have **Posting** as the **Account Type**.
- Have **Direct Posting** enabled.
- Aren't **Blocked**.

The BC98 error happens when no G/L account in the company selected as the **Subsidiary** meets all three conditions. For example, the accounts were blocked, or **Direct Posting** was disabled.

## How to fix the BC98 sync error in Business Central

1. In Business Central, open the company selected as the **Subsidiary** in Expensify.
2. Search for **Chart of Accounts**.
3. Open each G/L account that you want to use as a category.
4. Confirm **Account Type** is **Posting**, enable **Direct Posting**, and disable **Blocked**.
5. In Expensify, select **Workspaces > [workspace name] > Accounting**.
6. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

## When to contact Concierge

Contact Concierge if the error still appears after at least one G/L account allows direct posting and isn't blocked.

# FAQ

## Are my categories removed while the error shows?

No. Expensify keeps the categories from the last successful sync until a sync finds at least one G/L account to import.
