---
title: NS0722 Export Error in NetSuite Integration
description: Learn how to fix the NS0722 export error in NetSuite when the default payable account is invalid or inactive.
keywords: NS0722, NetSuite invalid payable account, default payable account expense reports NetSuite, default corporate card account NetSuite, subsidiary preferences NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0722 export error caused by invalid or inactive default payable accounts. Does not cover other NetSuite error codes.
---

# NS0722 Export Error in NetSuite Integration

If you see the error:

NS0722: The report was exported to an invalid payable account (ID [XXX]). Please set a valid 'Default Payable Account' for Expense Reports in NetSuite.

This means the default payable account configured in NetSuite is invalid or inactive.

---

## Why the NS0722 Export Error Happens in NetSuite

The NS0722 error occurs when:

- The **Default payable account for expense reports** is inactive.
- The **Default account for corporate card expenses** is inactive.
- No default account is selected at the subsidiary level.
- The account was deleted or restricted after the last sync.

NetSuite requires a valid default payable account to process expense report or corporate card exports.

---

## How to Fix the NS0722 Export Error

### Step One: Update Default Payable Accounts in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Company**.
4. Click **Subsidiaries**.
5. Open the relevant subsidiary.
6. Click **Edit**.
7. Expand the **Preferences** section.

If exporting as an **Expense Report**:

- Confirm the account listed under **Default payable account for expense reports**:
  - Exists.
  - Is active.

If exporting as **Credit Card transactions**:

- Confirm the account listed under **Default account for corporate card expenses**:
  - Exists.
  - Is active.

If no account is selected in either section:

- Select a valid, active account.
- Click **Save**.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once a valid default payable account is selected and synced, the export should complete successfully.

---

# FAQ

## Does NS0722 Mean the Account Was Deleted?

Not necessarily. The account may exist but be inactive or not assigned as the default payable account.

## Do I Need to Reconnect NetSuite?

No. Updating the default account and running **Sync** is typically sufficient.
