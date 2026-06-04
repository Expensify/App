---
title: INT498 Sync Error in Sage Intacct Integration
description: Learn what the INT498 sync error means and how to configure required Sage Intacct Cash and Accrual Journals for Expensify Card exports.
keywords: INT498, Sage Intacct liability credit card error, Intacct Cash Journal not configured, Intacct Accrual Journal not configured, Expensify Card Intacct sync error, Expensify Sage Intacct integration, Domain Admin, Workspace Admin
internalScope: Audience is Domain Admins and Workspace Admins using the Sage Intacct integration with Expensify Card. Covers resolving the INT498 sync error caused by missing Sage Intacct Cash and Accrual Journal configuration. Does not cover Sage Intacct user permission errors.
---

# INT498 Sync Error in Sage Intacct Integration

If you see the error:

INT498 Sync Error: Sage Intacct couldn’t create the liability credit card because journal accounts aren’t configured.

This means the required journal accounts for Expensify Card exports have not been selected in Expensify.

Sage Intacct requires both a **Cash Journal** and an **Accrual Journal** to create the liability credit card entry.

---

## Why the INT498 Sync Error Happens in Sage Intacct

The INT498 error typically indicates:

- Expensify Card transactions are being exported.
- A valid **Intacct Cash Journal** and **Intacct Accrual Journal** have not been selected in Expensify.
- Sage Intacct validation failed because required journal configuration is missing.

Without these journals configured, Sage Intacct cannot create the liability credit card account.

This is a journal configuration issue, not a Sage Intacct user permission error.

---

## How to Fix the INT498 Sync Error

Follow the steps below to configure the required journals and retry the sync.

### Configure the Required Intacct Journals in Domain Settings

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Open the **Settings** tab.
5. Select a valid:
   - **Intacct Cash Journal**
   - **Intacct Accrual Journal**
6. Click **Save**.

Both journals must be configured for Expensify Card exports to function correctly.

### Sync the Workspace in Expensify

After configuring the journals:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

After the sync completes, retry exporting the Expensify Card transactions.

If the journals are properly configured, the sync and export should complete successfully.

---

# FAQ

## Do I Need Domain Admin Access to Fix This?

Yes. Updating Company Card settings and journal configuration requires Domain Admin permissions.

## Does This Error Affect Non-Card Exports?

No. This error specifically affects Expensify Card exports that require liability credit card creation in Sage Intacct.

## Do I Need to Reconnect the Integration?

No. Configuring the required journals and selecting **Sync Now** is typically sufficient.
