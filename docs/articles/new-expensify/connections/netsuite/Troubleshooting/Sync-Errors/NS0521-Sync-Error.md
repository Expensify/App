---
title: NS0521 Sync Error in NetSuite Integration
description: Learn what the NS0521 sync error means and how to fix subsidiary permission issues in OneWorld and Non-OneWorld NetSuite accounts.
keywords: NS0521, NetSuite subsidiary permission error, OneWorld NetSuite subsidiary access, Non-OneWorld Expensify Connect bundle issue, Expensify Integration role subsidiary permissions, NetSuite sync error Subsidiary, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0521 sync error caused by subsidiary permission configuration issues in OneWorld and Non-OneWorld NetSuite accounts. Does not cover token formatting or general login errors.
---

# NS0521 Sync Error in NetSuite Integration

If you see the error:

NS0521 Sync Error: Permission error querying NetSuite for 'Subsidiary'.

This means the NetSuite integration does not have proper access to **Subsidiary** records.

NetSuite blocks the sync when the connected role cannot query subsidiary data.

---

## Why the NS0521 Sync Error Happens in NetSuite

The NS0521 error typically occurs due to subsidiary permission restrictions in NetSuite.

The resolution depends on whether your NetSuite account is:

- A **OneWorld** account, or  
- A **Non-OneWorld** account  

If the integration role or bundle is misconfigured, NetSuite prevents the Workspace from accessing subsidiary data.

This is a subsidiary permission configuration issue, not a token formatting or login issue.

---

# How to Fix the NS0521 Sync Error in OneWorld Accounts

In **OneWorld** accounts, the **Expensify Integration** role must have access to all required subsidiaries.

## Update Subsidiary Access on the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. In the **Subsidiary Restrictions** section:
   - Select **All**, or  
   - Select **Selected** and highlight all required subsidiaries.
6. Click **Save**.

---

## Sync the Workspace

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

Retry the sync after the update.

---

# How to Fix the NS0521 Sync Error in Non-OneWorld Accounts

In **Non-OneWorld** accounts, this issue is typically caused by the **Expensify Connect bundle** configuration.

## Reinstall the Expensify Connect Bundle

1. Log in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Locate the **Expensify Connect bundle**.
4. Uninstall the bundle.
5. Delete the **Expensify Integration** role.
6. Reinstall the Expensify Connect bundle.
7. During installation, do not modify the default role permissions.

---

## Sync the Workspace

After reinstalling:

On web:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap **Workspaces**.
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
