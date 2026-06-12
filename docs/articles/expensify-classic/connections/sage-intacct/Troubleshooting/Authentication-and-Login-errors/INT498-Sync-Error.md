---
title: INT498 Sync Error in Sage Intacct Integration
description: Learn what the INT498 sync error means in Sage Intacct and how to configure required Cash and Accrual Journals for Expensify Card exports.
keywords: INT498, Sage Intacct sync error, liability credit card not created, Intacct Cash Journal not configured, Intacct Accrual Journal not configured, Expensify Card Sage Intacct integration, Workspace Admin
internalScope: Audience is Domain Admins and Workspace Admins using the Sage Intacct integration with Expensify Card. Covers resolving the INT498 sync error caused by missing Intacct Cash and Accrual Journal configuration. Does not cover other Sage Intacct error codes.
---

# INT498 Sync Error in Sage Intacct Integration

If you see the error:

INT498: Liability credit card could not be created.

This means the required Sage Intacct journal accounts for Expensify Card exports are not configured, preventing the sync from completing.

Sage Intacct requires both a Cash Journal and an Accrual Journal to create the liability credit card entry.

---

## Why the INT498 Sync Error Happens in Sage Intacct

The INT498 error typically indicates:

- Expensify Card transactions are being exported.
- A valid **Intacct Cash Journal** has not been selected.
- A valid **Intacct Accrual Journal** has not been selected.
- Sage Intacct cannot create the required liability credit card account.

Without both journals configured, the integration cannot complete the sync.

This is a journal configuration issue, not a user permission issue.

---

## How to Fix the INT498 Sync Error

This issue can be resolved by configuring the required journals.

### Configure the Required Intacct Journals

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Open the **Settings** tab.
5. Select a valid:
   - **Intacct Cash Journal**
   - **Intacct Accrual Journal**
6. Click **Save**.

Both journals must be configured for Expensify Card exports to function correctly.

---

### Sync the Workspace

After configuring the journals:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the Expensify Card transactions.

---

# FAQ

## Can I Retry the Sync?

Yes. After selecting the required journals and clicking **Sync Now**, retry the sync or export.

## Does INT498 Affect Non-Card Exports?

No. This error specifically affects Expensify Card exports that require liability credit card creation in Sage Intacct.

## Do I Need Domain Admin Access?

Yes. Updating Company Card journal configuration requires Domain Admin permissions.
