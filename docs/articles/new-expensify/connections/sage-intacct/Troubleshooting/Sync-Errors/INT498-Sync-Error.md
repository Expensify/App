---
title: INT498 Sync Error in Sage Intacct Integration
description: Learn what the INT498 sync error means and how to configure the required Intacct Cash Journal and Intacct Accrual Journal for liability credit cards.
keywords: INT498, liability credit card error Sage Intacct, Intacct Cash Journal not configured, Intacct Accrual Journal missing, Expensify Card Sage Intacct sync error, Company Cards journal configuration, Domain Admin
internalScope: Audience is Domain Admins and Workspace Admins managing Expensify Card with the Sage Intacct integration. Covers resolving the INT498 sync error related to missing journal configuration for liability credit cards. Does not cover expense report export validation errors.
---

# INT498 Sync Error in Sage Intacct Integration

If you see the error:

INT498 Sync Error: Sage Intacct couldn’t create the liability credit card because journal accounts aren’t configured.

This means the required Sage Intacct journals have not been selected for Expensify Card transactions.

Sage Intacct requires both a Cash Journal and an Accrual Journal to create the liability credit card.

---

## Why the INT498 Sync Error Happens in Sage Intacct

The INT498 error typically occurs when:

- Expensify Card transactions are enabled.
- A valid **Intacct Cash Journal** has not been selected.
- A valid **Intacct Accrual Journal** has not been selected.
- The domain-level Company Cards settings are incomplete.

Without these journals configured, Sage Intacct cannot create or manage the required liability credit card account.

This is a journal configuration issue, not a report validation issue.

---

# How to Fix the INT498 Sync Error

Follow the steps below to configure the required journals and retry the sync.

---

## Configure Intacct Cash Journal and Intacct Accrual Journal

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Open the **Settings** tab.
5. Select a valid **Intacct Cash Journal** from the dropdown.
6. Select a valid **Intacct Accrual Journal** from the dropdown.
7. Click **Save**.

Both journals must be selected before the liability credit card can be created.

---

## Run Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If the journals are configured correctly, the sync should complete successfully.

---

# FAQ

## Do I Need Both a Cash Journal and an Accrual Journal?

Yes. Both journals are required for Sage Intacct to create and manage liability credit card transactions.

## Who Can Update Company Card Journal Settings?

Only Domain Admins, or members with appropriate domain-level permissions, can update Company Card settings.

## Does the INT498 Error Affect Expense Report Exports?

No. This error is specific to Expensify Card transactions and liability credit card creation.
