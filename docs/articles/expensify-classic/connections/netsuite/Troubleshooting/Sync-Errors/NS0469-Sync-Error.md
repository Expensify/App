---
title: NS0469 Sync Error in NetSuite Integration
description: Learn how to fix the NS0469 sync error in NetSuite when Multi-Currency is not enabled in a OneWorld account.
keywords: NS0469, NetSuite unable to query currency, enable multi-currency NetSuite OneWorld, Expensify Integration role currency permission, NetSuite currency permission error, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite OneWorld integration. Covers fixing the NS0469 sync error caused by Multi-Currency not being enabled or insufficient currency permissions. Does not cover other NetSuite error codes.
---

# NS0469 Sync Error in NetSuite Integration

If you see the error:

NS0469: Unable to query NetSuite for 'currency'. Please enable 'Multi-Currency' in OneWorld account in NetSuite to resolve.

This means your NetSuite OneWorld account does not have Multi-Currency enabled or the integration role lacks permission to view currencies.

---

## Why the NS0469 Sync Error Happens in NetSuite

The NS0469 error occurs when:

- You are using a **NetSuite OneWorld** account.
- **Multi-Currency** is not enabled.
- The Expensify Integration role does not have permission to view Currency records.
- The Workspace attempts to sync currency data from NetSuite.

Expensify requires Multi-Currency to be enabled in OneWorld environments to properly sync and export transactions.

---

## How to Fix the NS0469 Sync Error

### Step One: Enable Multi-Currency in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Company**.
4. Click **Enable Features**.
5. Open the **Company** tab.
6. Enable **Multi-Currency**.
7. Click **Save**.

---

### Step Two: Confirm Currency Permissions on the Expensify Integration Role

1. In NetSuite, go to **Setup**.
2. Select **Users/Roles**.
3. Click **Manage Roles**.
4. Select **Expensify Integration**.
5. Click **Edit**.
6. Scroll to **Permissions**.
7. Open the **Lists** tab.
8. Confirm the **Currency** permission is set to **View**.
9. Click **Save**.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once Multi-Currency is enabled and the role has proper permissions, the sync should complete successfully.

---

# FAQ

## Does NS0469 Only Apply to OneWorld Accounts?

Yes. This error typically occurs in NetSuite OneWorld environments where Multi-Currency is not enabled.

## Do I Need to Reconnect NetSuite?

No. Enabling Multi-Currency, confirming role permissions, and running **Sync** is usually sufficient.
