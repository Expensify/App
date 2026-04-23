---
title: INT498 Sync Error in Sage Intacct Integration
description: Learn what the INT498 sync error means and how to configure the required Intacct Cash Journal and Accrual Journal for Expensify Card before syncing.
keywords: INT498, Sage Intacct liability credit card error, Intacct Cash Journal not configured, Intacct Accrual Journal missing, Expensify Card Sage Intacct sync error, Domain Company Cards journal configuration, Workspace Admin
internalScope: Audience is Domain Admins and Workspace Admins managing Expensify Card with the Sage Intacct integration. Covers resolving the INT498 sync error caused by missing journal configuration for liability credit cards. Does not cover expense report export errors.
---

# INT498 Sync Error in Sage Intacct Integration

If you see the error:

INT498 Sync Error: Sage Intacct couldn’t create the liability credit card because journal accounts aren’t configured.

This means the required Sage Intacct journals have not been selected for **Expensify Card** transactions.

Sage Intacct requires both a **Cash Journal** and an **Accrual Journal** to create the liability credit card account.

---

## Why the INT498 Sync Error Happens in Sage Intacct

The INT498 error typically occurs when:

- Expensify Card transactions are being exported.
- A valid **Intacct Cash Journal** is not selected.
- A valid **Intacct Accrual Journal** is not selected in Domain settings.

Without these journals configured, Sage Intacct cannot create or manage the required liability credit card account.

This is a Company Cards configuration issue, not an expense report export issue.

---

# How to Fix the INT498 Sync Error

Follow the steps below to configure the required journals and retry the sync.

---

## Configure Intacct Cash and Accrual Journals for Expensify Card

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Open the **Settings** tab.
5. Select a valid **Intacct Cash Journal** from the dropdown.
6. Select a valid **Intacct Accrual Journal** from the dropdown.
7. Click **Save**.

Both journals must be configured.

---

## Sync the Workspace

After updating the journal settings:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Sync Now**.

If the journals are configured correctly, the sync should complete successfully.

---

# FAQ

## Do I Need Both a Cash Journal and an Accrual Journal?

Yes. Sage Intacct requires both journals to create and manage liability credit card transactions.

## Who Can Update Company Card Journal Settings?

Only **Domain Admins** (or users with appropriate domain-level permissions) can update Company Card settings.

## Does the INT498 Sync Error Affect Expense Report Exports?

No. This error is specific to Expensify Card transactions and liability credit card creation.
