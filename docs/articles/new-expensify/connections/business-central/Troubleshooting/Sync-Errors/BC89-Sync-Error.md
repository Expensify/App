---
title: BC89 Sync Error in Dynamics 365 Business Central
description: Learn what the BC89 sync error means and how to choose a valid Expensify Card settlement account so Expensify can record settlements in Dynamics 365 Business Central.
keywords: [BC89, BC89 sync error, Expensify Card settlement account, Sync Expensify Card settlements, Business Central settlement bank account, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers resolving the BC89 sync error caused by a missing or invalid Expensify Card settlement account. Does not cover settlement accounts in another currency (BC90), card export accounts (BC91), or payment bank accounts for reimbursed reports (BC79).
contentType: task
order: 89
---

# BC89 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC89 Sync Error: Select a valid Business Central Expensify Card settlement account in the connection's advanced settings, then sync again.")

**Sync Expensify Card settlements** is enabled, but Expensify can't find the **Expensify Card settlement account** in Business Central. Expensify doesn't record Expensify Card settlements in Business Central until you fix it. The rest of the sync still runs.

## Why the BC89 sync error happens

The BC89 error happens when:

- No **Expensify Card settlement account** is selected.
- The selected bank account was deleted in Business Central, or doesn't have a number.

## How to fix the BC89 sync error in Business Central

1. If you deleted the bank account, add the bank account that pays your Expensify Card settlements in Business Central.
2. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now** to import the latest bank accounts.
4. Under **Dynamics 365 Business Central**, select **Advanced**.
5. Select **Expensify Card settlement account**, then choose the bank account that pays your Expensify Card settlements.
6. Go back to the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

The next sync records the settlements that weren't recorded while the error was showing.

## When to contact Concierge

Contact Concierge if the error still appears after you select an **Expensify Card settlement account** and sync.

# FAQ

## Which bank account should I choose?

Choose the bank account that Expensify debits to pay your Expensify Card balance. Settlements are in USD, so the account must use USD. Learn more about the [BC90 sync error](/articles/new-expensify/connections/business-central/Troubleshooting/Sync-Errors/BC90-Sync-Error) if your account uses another currency.
