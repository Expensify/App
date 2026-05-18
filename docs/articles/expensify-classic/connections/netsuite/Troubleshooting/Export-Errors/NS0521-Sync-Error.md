---
title: NS0521 Sync Error in NetSuite Integration
description: Learn how to fix the NS0521 sync error in NetSuite when there is a permission error querying subsidiaries.
keywords: NS0521, NetSuite subsidiary permission error, OneWorld NetSuite role permissions, Expensify Integration role subsidiaries, uninstall Expensify Connect bundle, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0521 sync error caused by subsidiary permission configuration in OneWorld and Non-OneWorld accounts. Does not cover other NetSuite error codes.
---

# NS0521 Sync Error in NetSuite Integration

If you see the error:

NS0521: Permission error querying NetSuite for 'Subsidiary'.

This means the NetSuite role used for the Expensify integration does not have proper access to subsidiary records.

---

## Why the NS0521 Sync Error Happens in NetSuite

The NS0521 error occurs due to permission restrictions related to:

- **OneWorld accounts** with subsidiary restrictions.
- **Non-OneWorld accounts** with incorrect bundle or role configuration.
- The **Expensify Integration** role not having access to required subsidiaries.

The resolution depends on whether your NetSuite account is OneWorld or Non-OneWorld.

---

# How to Fix NS0521 for OneWorld Accounts

If you are using **NetSuite OneWorld**:

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate and select the **Expensify Integration** role.
6. Click **Edit**.
7. Review the **Subsidiary Restrictions** section.
8. Confirm that either:
   - **All** is selected, or
   - **Selected** is chosen and all required subsidiaries are highlighted.
9. Save the changes.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

# How to Fix NS0521 for Non-OneWorld Accounts

If you are using **NetSuite Non-OneWorld**:

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **SuiteBundler**.
4. Click **Search & Install Bundles**.
5. Open the **List** tab.
6. Locate the **Expensify Connect** bundle.
7. Uninstall the bundle.

Next:

1. Go to **Setup** > **Users/Roles** > **Manage Roles**.
2. Delete the **Expensify Integration** role.

Then reinstall the Expensify Connect bundle.

Important:  
When reinstalling the bundle, do **not** modify the default role permissions.

After reinstalling:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

# FAQ

## Does NS0521 Mean My Data Is Lost?

No. This error is permission-related and does not impact your stored data.

## Do I Need to Reconnect the Integration?

In Non-OneWorld accounts, reinstalling the bundle effectively resets the integration. In OneWorld accounts, adjusting subsidiary permissions is usually sufficient.
