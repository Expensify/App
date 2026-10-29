---
title: INT068 Sync Error in Sage Intacct Integration
description: Learn what the INT068 sync error means and how to configure entity-level exports for Expensify Card Auto Reconciliation with Sage Intacct.
keywords: INT068, liability credit card account error, entity level export Sage Intacct, Expensify Card Auto Reconciliation, Sage Intacct chart of accounts permissions, sync liability account error, Workspace Admin, Domain Admin
internalScope: Audience is Workspace Admins and Domain Admins managing Expensify Card with the Sage Intacct integration. Covers resolving the INT068 sync error related to liability credit card creation and entity-level configuration. Does not cover expense report validation or category errors.
---

# INT068 Sync Error in Sage Intacct Integration

If you see the error:

INT068 Sync Error: Sage Intacct couldn’t create a liability credit card account. When the Expensify Card is used, exports must be configured at the entity level for reconciliation.

This means Sage Intacct cannot create the required liability credit card account because the export configuration does not align with entity-level requirements.

When using Auto Reconciliation for Expensify Card transactions, syncing must occur at the entity level.

---

## Why the INT068 Sync Error Happens in Sage Intacct

The INT068 error typically occurs when:

- Expensify Card transactions are enabled with Auto Reconciliation.
- The Workspace is configured to sync at the top level instead of the entity level.
- Sage Intacct attempts to create a liability credit card account during sync.

Auto Reconciliation requires liability credit card accounts to be created at the entity level in Sage Intacct.

Even if the report does not contain Expensify Card transactions, this error can appear because the liability account is created during the first sync after enabling the feature.

This is an export configuration and permissions issue, not a report validation issue.

---

# How to Fix the INT068 Sync Error

Follow the steps below to confirm entity-level configuration and permissions.

---

## Configure Entity-Level Exports in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Review the export configuration.
5. Confirm whether the Workspace is set to sync at the top level or entity level.
6. If using Expensify Card Auto Reconciliation, configure the Workspace to sync at the **entity level**.
7. Click **Save**.

Exports must be aligned with the entity where the liability account will be created.

---

## Confirm Liability Account Permissions in Sage Intacct

If the liability credit card account already exists in the **Chart of Accounts**:

1. Log in to Sage Intacct as an administrator.
2. Locate the liability account in the **Chart of Accounts**.
3. Confirm the following permissions are enabled:
   - List
   - View
   - Add
   - Edit
   - Delete
4. Update permissions if necessary.
5. Click **Save**.

If the account does not exist, ensure the integration user has permission to create accounts at the entity level.

---

## Run Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If the Workspace is configured at the entity level and permissions are correct, the sync should complete successfully.

---

# FAQ

## Does the INT068 Error Only Occur With Expensify Card Transactions?

Yes. This error is specifically related to liability credit card creation required for Expensify Card Auto Reconciliation.

## Why Does the Error Appear Even If the Report Does Not Include Card Transactions?

The liability account is created during the first sync after Auto Reconciliation is enabled, even if the specific report does not contain card expenses.

## Who Can Update Export Configuration Settings?

Workspace Admins can update Workspace export settings. Domain-level export settings may require Domain Admin permissions.
