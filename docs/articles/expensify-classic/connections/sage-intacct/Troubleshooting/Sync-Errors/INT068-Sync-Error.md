---
title: INT068 Sync Error in Sage Intacct Integration
description: Learn what the INT068 sync error means and how to configure entity-level exports and permissions for Expensify Card with Sage Intacct.
keywords: INT068, Sage Intacct liability credit card error, Expensify Card entity level export, Sage Intacct Auto Reconciliation error, Intacct liability account permissions, Expensify Sage Intacct integration, Workspace Admin, Domain Admin
internalScope: Audience is Workspace Admins and Domain Admins using the Sage Intacct integration with Expensify Card. Covers resolving the INT068 sync error caused by entity-level configuration or liability account permissions. Does not cover Sage Intacct authentication errors.
---

# INT068 Sync Error in Sage Intacct Integration

If you see the error:

INT068 Sync Error: Sage Intacct couldn’t create a liability credit card account. When the Expensify Card is used, exports must be configured at the entity level for reconciliation.

This means Sage Intacct was unable to create the required liability credit card account.

This typically occurs when **Auto Reconciliation** for the **Expensify Card** is enabled, but the integration is not configured correctly at the entity level.

---

## Why the INT068 Sync Error Happens in Sage Intacct

The INT068 error typically indicates:

- Expensify Card transactions are being exported.
- The Workspace is syncing at the **top level** instead of the **entity level**.
- The required liability account cannot be created due to missing permissions in Sage Intacct.

When using **Auto Reconciliation** for the Expensify Card, exports must be configured at the **entity level** in Sage Intacct.

Note: Even if the report does not contain Expensify Card transactions, this error can still appear if Auto Reconciliation is enabled. The liability account is created during the first sync after enabling the feature.

This is an entity-level configuration or permission issue, not an authentication error.

---

## How to Fix the INT068 Sync Error

Follow the steps below to correct the configuration and retry the sync.

### Confirm Entity-Level Export Configuration in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Confirm whether the Workspace is syncing at the **top level** or **entity level**.

If using Auto Reconciliation for the Expensify Card:

- The Workspace must sync at the **entity level**.
- Update the configuration if needed.
- Click **Save**.

### Confirm Liability Account Permissions in Sage Intacct

If the liability account already exists in the **Chart of Accounts** in Sage Intacct:

1. Log in to Sage Intacct.
2. Confirm the Web Services user has the following **Accounts** permissions:
   - List
   - View
   - Add
   - Edit
   - Delete
3. Click **Save** if changes were made.

Without these permissions, Sage Intacct may not allow the liability account to be created or updated.

### Sync the Workspace in Expensify

After confirming configuration and permissions:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry the export or sync after it completes.

---

# FAQ

## Does This Error Only Affect Expensify Card Transactions?

It primarily relates to the Expensify Card and Auto Reconciliation. However, it may appear even if the specific report does not contain card transactions.

## Do I Need Sage Intacct Admin Access to Fix This?

You need sufficient permissions in Sage Intacct to update account permissions and confirm entity-level configuration.

## Does This Mean the Integration Is Disconnected?

No. The integration is functioning, but the liability account cannot be created due to configuration or permission settings.
