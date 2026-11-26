---
title: BC91 Sync Error in Dynamics 365 Business Central
description: Learn what the BC91 sync error means and how to choose a valid bank account for Expensify Card expenses so Expensify can record settlements in Dynamics 365 Business Central.
keywords: [BC91, BC91 sync error, bank account that Expensify Card expenses export to was not found, Business Central company card account, Business Central card program account, Expensify Card settlements, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers resolving the BC91 sync error when the bank account that Expensify Card expenses export to is missing from Business Central. Does not cover the settlement account itself (BC89), accounts in another currency (BC90), or export errors on reports.
contentType: task
order: 91
---

# BC91 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC91 Sync Error: The Business Central bank account that Expensify Card expenses export to was not found. Sync the connection, check the export settings, and try again.")

Each Expensify Card settlement moves money from your settlement account to the bank account that Expensify Card expenses export to. Expensify can't find that second bank account in Business Central, so it doesn't record Expensify Card settlements until you fix it. The rest of the sync still runs.

## Why the BC91 sync error happens

The BC91 error happens when **Export company card expenses as** is **General journal**, and the account that Expensify Card expenses export to was deleted in Business Central. Expensify uses:

- The **Card program account** for the Expensify Card, if **Configure exporting to multiple accounts** is enabled and the Expensify Card has its own account.
- The **Company card account** otherwise.

## How to fix the BC91 sync error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now** to import the latest bank accounts.
3. Under **Dynamics 365 Business Central**, select **Export**.
4. Choose an existing bank account for the **Card program account** of the Expensify Card, or for the **Company card account**.
5. Go back to the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

The next sync records the settlements that weren't recorded while the error was showing.

## When to contact Concierge

Contact Concierge if the error still appears after you choose an existing bank account and sync.
