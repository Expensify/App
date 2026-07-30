---
title: NS0394 Sync Error in NetSuite Integration
description: Learn what the NS0394 sync error means and how to configure an Accounts Payable account in the Workspace to mark NetSuite expense reports as paid.
keywords: NS0394, NetSuite A/P approval account error, Accounts Payable account not set NetSuite, mark expense report as paid NetSuite, Sync Reimbursed Reports Workspace, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0394 sync error caused by missing Accounts Payable configuration in the Workspace. Does not cover token permissions or bundle configuration issues.
---

# NS0394 Sync Error in NetSuite Integration

If you see the error:

NS0394 Sync Error: Expensify couldn’t mark NetSuite Expense Report ID [XXXXX] as paid because the A/P approval account isn’t set.

This means an **Accounts Payable (A/P) account** has not been configured in the Workspace.

Without an A/P account selected, the Workspace cannot mark reimbursed expense reports as paid in NetSuite.

---

## Why the NS0394 Sync Error Happens in NetSuite

The NS0394 error typically occurs when:

- No **Accounts Payable** account is selected under the NetSuite accounting settings in the Workspace.
- The **Sync Reimbursed Reports** setting is enabled but does not have an A/P account assigned.
- The selected A/P account was deleted or made inactive in NetSuite.

The **Sync Reimbursed Reports** feature requires a valid Accounts Payable account to update payment status in NetSuite.

This is a payment configuration issue, not a token or bundle issue.

---

## How to Fix the NS0394 Sync Error

Follow the steps below to configure an Accounts Payable account.

---

## Select an Accounts Payable Account in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Locate **Sync Reimbursed Reports**.
6. Select an **Accounts Payable** account from the dropdown.
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Locate **Sync Reimbursed Reports**.
6. Select an **Accounts Payable** account.
7. Tap **Save**.

---

## Create an Accounts Payable Account in NetSuite if None Are Available

If no Accounts Payable accounts appear in the dropdown:

1. Log in to NetSuite as an administrator.
2. Create a new account with type **Accounts Payable**.
3. Click **Save**.

Then return to the Workspace:

1. Go to **Workspaces > Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.

After the sync completes:

1. Go back to **Accounting > Advanced**.
2. Select the newly available **Accounts Payable** account.
3. Click **Save**.

---

## Retry the Payment Sync

1. Return to **Accounting**.
2. Click **Sync Now**.
3. Confirm the reimbursed report is marked as paid in NetSuite.

If a valid A/P account is selected, the sync should complete successfully.

---

# FAQ

## Does the NS0394 Sync Error Affect All Reimbursed Reports?

Yes. Until an Accounts Payable account is selected, the Workspace cannot mark reimbursed reports as paid in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0394 Sync Error?

You may need administrator permissions in NetSuite to create a new Accounts Payable account if one does not already exist.

## Do I Need to Reconnect the Integration?

No. Selecting a valid Accounts Payable account and running **Sync Now** is typically sufficient.
