---
title: ONL022 Export Error: Account Must Be Marked as Billable in QuickBooks Online
description: Learn why ONL022 appears when exporting billable expenses to QuickBooks Online and how to enable billable settings for the selected account.
keywords: ONL022, QuickBooks Online billable error, export billable expenses QuickBooks, mark account as billable QuickBooks, make expenses billable QuickBooks, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL022 billable account configuration error and re-syncing the Workspace. Does not cover unrelated QuickBooks subscription or permission errors.
---

# ONL022 Export Error: Account Must Be Marked as Billable in QuickBooks Online

If you see the error:

**“ONL022 Export Error: To export billable expenses, ensure the account in QuickBooks Online is marked as billable.”**

this means the account category applied to an expense in Expensify is not marked as billable in QuickBooks Online.

Until the account is configured as billable, QuickBooks Online will block the export.

---

## Why ONL022 Happens

When exporting billable expenses, QuickBooks Online requires:

- Billable functionality to be enabled in Company Settings, and  
- The selected account in the Chart of Accounts to support billable expenses  

If either setting is not configured properly, QuickBooks returns error **ONL022**.

This is a QuickBooks Online configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix ONL022

You must:

- Be a **Workspace Admin** in Expensify, and  
- Have permission to manage Company Settings and the Chart of Accounts in QuickBooks Online  

to resolve this error.

---

## Step 1: Enable Billable Expenses in QuickBooks Online

1. Log in to QuickBooks Online.
2. Click the **gear icon** in the upper-right corner.
3. Select **Expenses** under Company Settings.
4. Enable **Make expenses and items billable**.
5. Click **Save**.

If billable is already enabled:

- Click the pencil icon to confirm the setting is properly configured.
- Check whether multiple accounts are selected if applicable.

---

## Step 2: Mark the Account as Billable in the Chart of Accounts

1. Go to the **Chart of Accounts** in QuickBooks Online.
2. Locate the account used for the expense category.
3. Click **Edit** on the relevant account.
4. Mark the account as **Billable**.
5. Select an appropriate **Income account**.
6. Save your changes.

The account must support billable expenses for exports to succeed.

---

## Step 3: Sync the Integration in Expensify

After updating QuickBooks Online:

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After ONL022

After syncing:

1. Open the affected report.
2. Retry exporting the report.
3. Confirm the export completes successfully.

If the error continues, confirm that:

- Billable functionality is enabled in QuickBooks Online.
- The correct account is marked as billable.
- An income account is selected.
- Changes were saved before syncing.

---

# FAQ

## Does ONL022 mean billable is not supported in my QuickBooks plan?

Not necessarily. It usually means billable settings are not enabled or the account is not configured correctly.

---

## Is ONL022 caused by Expensify settings?

No. ONL022 is triggered by billable configuration settings in QuickBooks Online, not by Workspace settings in Expensify.

---

## Do I need to reconnect QuickBooks Online?

No. Updating the billable settings and selecting **Sync Now** is typically sufficient.
