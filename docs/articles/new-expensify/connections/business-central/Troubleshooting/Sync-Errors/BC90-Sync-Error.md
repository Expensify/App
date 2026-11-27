---
title: BC90 Sync Error in Dynamics 365 Business Central
description: Learn what the BC90 sync error means and how to choose USD bank accounts so Expensify can record Expensify Card settlements in Dynamics 365 Business Central.
keywords: [BC90, BC90 sync error, Expensify Card settlements are in USD, Business Central bank account currency, Expensify Card settlement account, company card account currency, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers resolving the BC90 sync error when a bank account used for Expensify Card settlements isn't in USD. Does not cover missing settlement accounts (BC89) or missing card export accounts (BC91).
contentType: task
order: 90
---

# BC90 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC90 Sync Error: Expensify Card settlements are in USD, but Business Central bank account [account number] uses [currency]. Select a USD bank account and try again.")

Expensify Card settlements are always in USD. Expensify can't record them against a bank account that uses another currency, because Business Central would book them in the wrong currency. Expensify doesn't record Expensify Card settlements until you fix it. The rest of the sync still runs.

## Why the BC90 sync error happens

The BC90 error happens when the bank account named in the error uses a currency other than USD. It can be either of these accounts:

- The **Expensify Card settlement account**, in the **Advanced** settings.
- The bank account Expensify Card expenses export to, when **Export company card expenses as** is **General journal**. This is the **Card program account** for the Expensify Card, or the **Company card account** if the Expensify Card doesn't have its own account.

In Business Central, a bank account without a **Currency Code** uses the company's local currency. If your local currency isn't USD, that bank account isn't a USD account.

## How to fix the BC90 sync error in Business Central

Compare the account number in the error with the accounts selected in Expensify to find which one to change. Then:

1. In Business Central, search for **Bank Accounts** and find a bank account whose **Currency Code** is **USD**. If your company's local currency is USD, a bank account without a **Currency Code** also works.
2. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now** to import the latest bank accounts.
4. If the error names the **Expensify Card settlement account**, select **Advanced** under **Dynamics 365 Business Central**, select **Expensify Card settlement account**, and choose the USD bank account.
5. If the error names the account Expensify Card expenses export to, select **Export** under **Dynamics 365 Business Central**, and choose the USD bank account for the **Card program account** of the Expensify Card, or for the **Company card account**.
6. Go back to the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

Changing the **Card program account** or **Company card account** also changes where Expensify Card expenses export.

The next sync records the settlements that weren't recorded while the error was showing.

## When to contact Concierge

Contact Concierge if your company doesn't have a USD bank account, or if the error still appears after you choose USD bank accounts.
