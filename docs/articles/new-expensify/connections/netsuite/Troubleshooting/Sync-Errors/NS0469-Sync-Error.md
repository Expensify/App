---
title: NS0469 Sync Error in NetSuite Integration
description: Learn what the NS0469 sync error means and how to enable Multi-Currency and update role permissions in NetSuite to restore syncing.
keywords: NS0469, NetSuite currency sync error, enable Multi-Currency NetSuite OneWorld, Expensify Integration role Currency permission, NetSuite sync error Currency, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0469 sync error caused by Multi-Currency being disabled or missing Currency permissions in NetSuite OneWorld accounts. Does not cover token formatting or bundle update issues.
---

# NS0469 Sync Error in NetSuite Integration

If you see the error:

NS0469 Sync Error: Unable to query NetSuite for 'Currency'. Please enable 'Multi-Currency' in OneWorld account in NetSuite to resolve.

This means the Workspace cannot access Currency records in NetSuite.

In most cases, **Multi-Currency** is not enabled in your NetSuite OneWorld account, or the integration role does not have permission to view Currency records.

---

## Why the NS0469 Sync Error Happens in NetSuite

The NS0469 error typically occurs when:

- You are using a **NetSuite OneWorld** account.
- The **Multi-Currency** feature is not enabled.
- The **Expensify Integration** role does not have permission to view Currency records.

Currency access is required for the NetSuite integration to sync properly.

Without Multi-Currency enabled or proper role permissions, NetSuite blocks Currency queries during sync.

This is a feature and role permission issue, not a token formatting or bundle issue.

---

## How to Fix the NS0469 Sync Error

Follow the steps below to enable Multi-Currency and confirm role permissions.

---

## Enable Multi-Currency in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Company > Enable Features**.
3. Open the **Company** tab.
4. Enable **Multi-Currency**.
5. Click **Save**.

If Multi-Currency is already enabled, proceed to the next step.

---

## Confirm Currency Permissions on the Expensify Integration Role

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Select **Expensify Integration**.
3. Click **Edit**.
4. Scroll to **Permissions > Lists**.
5. Confirm **Currency** is set to **View**.
6. Click **Save** if updates were made.

---

## Sync the Workspace and Retry

After enabling Multi-Currency and confirming role permissions:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry the sync once the process completes.

---

# FAQ

## Does the NS0469 Sync Error Affect All Exports?

Yes. If the Workspace cannot query Currency records, syncing and exports to NetSuite will fail.

## Do I Need NetSuite Admin Access to Fix the NS0469 Sync Error?

Yes. Enabling Multi-Currency and updating role permissions requires NetSuite administrator access.

## Do I Need to Reconnect the Integration?

No. Enabling Multi-Currency, confirming Currency permissions, and selecting **Sync Now** is typically sufficient.
