---
title: NS0521 Sync Error in NetSuite Integration
description: Learn what the NS0521 sync error means and how to fix subsidiary permission issues in OneWorld and Non-OneWorld NetSuite accounts.
keywords: NS0521, NetSuite subsidiary permission error, OneWorld NetSuite permissions, Non-OneWorld NetSuite bundle issue, Expensify Integration role subsidiary access, Expensify Connect bundle, NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0521 sync error caused by subsidiary permission configuration issues in OneWorld and Non-OneWorld NetSuite accounts. Does not cover token formatting or general login errors.
---

# NS0521 Sync Error in NetSuite Integration

If you see the error:

NS0521 Sync Error: Permission error querying NetSuite for 'Subsidiary'.

This means the NetSuite integration does not have proper access to subsidiary records.

This error is typically related to permission restrictions in **OneWorld** or **Non-OneWorld** NetSuite accounts.

---

## Why the NS0521 Sync Error Happens in NetSuite

The NS0521 error typically occurs because of permission restrictions tied to how subsidiaries are configured in NetSuite.

The resolution depends on whether your NetSuite account is:

- A **OneWorld** account, or  
- A **Non-OneWorld** account  

If the integration role or bundle does not properly support subsidiary access, NetSuite blocks the sync.

This is a subsidiary access configuration issue, not a token formatting or general login issue.

---

## Fix the NS0521 Sync Error in OneWorld Accounts

In **OneWorld** accounts, the **Expensify Integration role** must have access to all required subsidiaries.

### Update Subsidiary Access for the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Confirm that either:
   - **All** is selected for subsidiaries, or  
   - **Selected** is chosen and all required subsidiaries are highlighted.
6. Click **Save**.

### Sync the Workspace

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

Retry the sync or export once complete.

---

## Fix the NS0521 Sync Error in Non-OneWorld Accounts

In **Non-OneWorld** accounts, the issue is typically related to the **Expensify Connect bundle** configuration.

### Reinstall the Expensify Connect Bundle

1. Log in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Locate the **Expensify Connect bundle**.
4. Uninstall the bundle.
5. Delete the **Expensify Integration role**.
6. Reinstall the Expensify Connect bundle.
7. During installation, do not edit the default role permissions.

### Sync the Workspace

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

---

# FAQ

## Does the NS0521 Sync Error Affect All Workspaces?

It can. If the NetSuite role or bundle configuration is incorrect, all Workspaces connected to that NetSuite account may experience syncing issues.

## Do I Need NetSuite Admin Access to Fix the NS0521 Sync Error?

Yes. Updating roles, managing subsidiary access, and reinstalling bundles require NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. In most cases, correcting subsidiary access or reinstalling the bundle and selecting **Sync Now** is sufficient.
