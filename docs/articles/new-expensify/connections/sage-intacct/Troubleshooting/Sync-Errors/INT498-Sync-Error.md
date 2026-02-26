---
title: INT498 Sync Error: Journal Accounts Aren’t Configured for Liability Credit Card
description: Learn why the INT498 sync error occurs and how to configure the required Intacct Cash Journal and Accrual Journal before syncing.
keywords: INT498, liability credit card error, Intacct Cash Journal not configured, Intacct Accrual Journal missing, Expensify Card Sage Intacct sync error, Company Cards journal configuration
internalScope: Audience is Domain Admins and Workspace Admins managing Expensify Card with the Sage Intacct integration. Covers the INT498 sync error related to missing journal configuration for liability credit cards. Does not cover expense report export errors.
---

# INT498 Sync Error: Journal Accounts Aren’t Configured for Liability Credit Card

If you see the error message:

**“INT498 Sync Error: Sage Intacct couldn’t create the liability credit card because journal accounts aren’t configured.”**

It means the required Sage Intacct journals have not been selected for Expensify Card transactions.

Sage Intacct requires both a Cash Journal and an Accrual Journal to create the liability credit card.

---

## Why the INT498 Sync Error Happens

The INT498 sync error occurs when:

- Expensify Card transactions are being exported, and  
- A valid **Intacct Cash Journal** and **Intacct Accrual Journal** have not been selected in the domain settings  

Without these journals configured, Sage Intacct cannot create the required liability credit card account.

---

# How to Fix the INT498 Sync Error

Follow the steps below to configure the required journals and retry the sync.

---

## Step 1: Configure Intacct Journals

1. Go to **Settings > Domain > Company Cards**.  
2. Open the **Settings** tab.  
3. Select a valid **Intacct Cash Journal** from the dropdown.  
4. Select a valid **Intacct Accrual Journal** from the dropdown.  
5. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

If the journals are configured correctly, the sync should complete successfully.

---

# FAQ

## Do I need both a Cash Journal and an Accrual Journal?

Yes. Both journals are required for Sage Intacct to create and manage liability credit card transactions.

## Who can update Company Card journal settings?

Only Domain Admins (or users with appropriate domain-level permissions) can update Company Card settings.

## Does this error affect expense report exports?

No. This error is specific to Expensify Card transactions and liability credit card creation.
