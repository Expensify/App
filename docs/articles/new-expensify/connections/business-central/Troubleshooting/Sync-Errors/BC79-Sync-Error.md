---
title: BC79 Sync Error in Dynamics 365 Business Central
description: Learn what the BC79 sync error means and how to choose a valid payment bank account so Expensify can record reimbursed reports in Dynamics 365 Business Central.
keywords: [BC79, BC79 sync error, Business Central payment bank account, Sync reimbursed reports, Business Central reimbursement bank account, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving the BC79 sync error caused by a missing or invalid payment bank account for reimbursed reports. Does not cover Expensify Card settlement accounts (BC89), export errors, or connecting Business Central.
contentType: task
order: 79
---

# BC79 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC79 Sync Error: Select a valid Business Central payment bank account for reimbursed reports in the connection's advanced settings, then sync again.")

**Sync reimbursed reports** is enabled, but Expensify can't find the **Payment bank account** in Business Central. Expensify doesn't record reimbursements in Business Central until you fix it. The rest of the sync still runs.

## Why the BC79 sync error happens

The BC79 error happens when:

- No **Payment bank account** is selected.
- The selected bank account was deleted in Business Central, or doesn't have a number.

## How to fix the BC79 sync error in Business Central

1. If you deleted the bank account, add the bank account you pay reimbursements from in Business Central.
2. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now** to import the latest bank accounts.
4. Under **Dynamics 365 Business Central**, select **Advanced**.
5. Select **Payment bank account**, then choose the bank account you pay reimbursements from.
6. Go back to the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

The next sync records the reimbursements that weren't recorded while the error was showing.

## When to contact Concierge

Contact Concierge if the error still appears after you select a **Payment bank account** and sync.

# FAQ

## Does the BC79 error stop reports from exporting?

No. Reports still export to Business Central. Only the reimbursements of reports paid through Expensify aren't recorded until you fix the error.

## How do I stop syncing reimbursed reports instead?

Select **Workspaces > [workspace name] > Accounting**, then select **Advanced** under **Dynamics 365 Business Central**. Disable **Sync reimbursed reports**, then sync again.
