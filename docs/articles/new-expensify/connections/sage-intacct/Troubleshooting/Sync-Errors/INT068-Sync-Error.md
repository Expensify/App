---
title: INT068 Sync Error: Liability Credit Card Account Must Be Created at the Entity Level
description: Learn why the INT068 sync error occurs and how to configure entity-level exports for Expensify Card auto-reconciliation with Sage Intacct.
keywords: INT068, liability credit card account error, entity level export Sage Intacct, Expensify Card auto reconciliation, Sage Intacct chart of accounts permissions, sync liability account error
internalScope: Audience is Workspace Admins and Domain Admins managing Expensify Card with the Sage Intacct integration. Covers the INT068 sync error related to liability credit card creation and entity-level configuration. Does not cover expense report validation errors.
---

# INT068 Sync Error: Liability Credit Card Account Must Be Created at the Entity Level

If you see the error message:

**“INT068 Sync Error: Sage Intacct couldn’t create a liability credit card account. When the Expensify Card is used, exports must be configured at the entity level for reconciliation.”**

It means Sage Intacct cannot create the required liability credit card account because the export configuration does not align with entity-level requirements.

When using Auto Reconciliation for Expensify Card transactions, syncing must occur at the entity level.

---

## Why the INT068 Sync Error Happens

The INT068 sync error occurs when:

- Expensify Card transactions are enabled with Auto Reconciliation, and  
- The Workspace is configured to sync at the top level instead of the entity level  

Auto Reconciliation requires liability credit card accounts to be created at the entity level in Sage Intacct.

Even if the report does not contain Expensify Card transactions, this error can appear because the liability account is created during the first sync after enabling the feature.

---

# How to Fix the INT068 Sync Error

Follow the steps below to confirm entity-level configuration and permissions.

---

## Step 1: Confirm Export Level Configuration

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. Confirm whether the Workspace is syncing at the **top level** or **entity level**.  

If using Auto Reconciliation for Expensify Cards, ensure syncing is configured at the **entity level**.

---

## Step 2: Confirm Liability Account Permissions in Sage Intacct

If the liability credit card account has already been created in the **Chart of Accounts**:

1. Log in to Sage Intacct.  
2. Locate the liability account in the Chart of Accounts.  
3. Confirm the following account permissions are enabled:

- List  
- View  
- Add  
- Edit  
- Delete  

Update permissions if needed and save your changes.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

If the Workspace is configured at the entity level and permissions are correct, the sync should complete successfully.

---

# FAQ

## Does this error only occur with Expensify Card transactions?

Yes. This error is specifically related to liability credit card creation required for Expensify Card Auto Reconciliation.

## Why does the error appear even if the report does not include card transactions?

The liability account is created during the first sync after Auto Reconciliation is enabled, even if the specific report does not contain card expenses.

## Who can update export level settings?

Workspace Admins can update export configuration settings. Domain-level settings may require Domain Admin permissions.
