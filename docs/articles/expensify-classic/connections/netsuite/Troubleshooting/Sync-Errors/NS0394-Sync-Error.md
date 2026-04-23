---
title: NS0394 Sync Error in NetSuite Integration
description: Learn how to fix the NS0394 sync error in NetSuite when the Accounts Payable approval account is not configured in Expensify.
keywords: NS0394, NetSuite could not mark expense report as paid, AP approval account not set, Sync Reimbursed Reports AP account, create Accounts Payable account NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0394 sync error caused by a missing Accounts Payable approval account configuration. Does not cover other NetSuite error codes.
---

# NS0394 Sync Error in NetSuite Integration

If you see the error:

NS0394: Expensify couldn’t mark NetSuite Expense Report ID [XXXXX] as paid because the A/P approval account isn’t set.

This means an **Accounts Payable (A/P)** account is not configured in the Workspace settings in Expensify.

---

## Why the NS0394 Sync Error Happens in NetSuite

The NS0394 error occurs when:

- The **Sync Reimbursed Reports** setting in Expensify does not have an A/P account selected.
- No valid Accounts Payable account exists in NetSuite.
- The selected A/P account was deleted or made inactive.
- The Workspace has not been synced after account changes.

Expensify requires an A/P account to mark reimbursed reports as paid in NetSuite.

---

## How to Fix the NS0394 Sync Error

### Step One: Select an Accounts Payable Account in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.
7. Locate the **Sync Reimbursed Reports** setting.
8. Select a valid **Accounts Payable** account from the dropdown.
9. Click **Save**.

---

### Step Two: Create an A/P Account in NetSuite (If Needed)

If no A/P account appears in the dropdown:

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists** > **Accounting** > **Accounts**.
3. Click **New**.
4. Create a new account with the type **Accounts Payable**.
5. Save the account.

Then return to Expensify:

1. Go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Sync Now**.
3. Click **Configure** > **Advanced**.
4. Select the newly created A/P account.
5. Click **Save**.

---

### Step Three: Retry the Sync

1. After saving the A/P account selection, retry the sync.
2. Confirm the expense report is marked as paid in NetSuite.

---

# FAQ

## Does NS0394 Mean the Report Failed to Export?

No. The report may have exported successfully but could not be marked as paid.

## Do I Need to Reconnect NetSuite?

No. Selecting a valid A/P account and running **Sync Now** is typically sufficient.
