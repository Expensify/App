---
title: ONL562 Export Error in QuickBooks Online
description: Learn how to fix the ONL562 export error in QuickBooks Online when vendor and Accounts Payable currencies do not match.
keywords: ONL562, QuickBooks Online currency error, transaction must use same currency as Accounts Payable, vendor currency mismatch, A/P currency mismatch, Sync now, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL562 export error caused by vendor and Accounts Payable currency mismatches. Does not cover other export error codes.
---

# ONL562 Export Error in QuickBooks Online

If you see the error:

ONL562: The transaction must use the same currency as the Accounts Receivable or Accounts Payable account.

This means the currency assigned to the vendor record does not match the currency assigned to the Accounts Payable (A/P) account in QuickBooks Online.

---

## Why the ONL562 Export Error Happens in QuickBooks Online

The ONL562 error occurs when:

- The vendor record used for the report creator has a different currency than the A/P account.
- There are duplicate vendor records with the same email address but different currencies.
- The export is posting to an A/P account that uses a different currency than the transaction.

QuickBooks Online requires the vendor currency and the A/P account currency to match.

---

## How to Confirm the Vendor Currency in QuickBooks Online

1. Log in to QuickBooks Online.
2. Go to **Expenses**.
3. Select **Vendors**.
4. Open the vendor record associated with the report creator’s email address.
5. Confirm the assigned currency matches the intended A/P account currency.

If the currency does not match, update the vendor record as needed.

If multiple vendors share the same email address but use different currencies:

1. Identify the duplicate records.
2. Remove the email address from the incorrect vendor record.
3. Save your changes.

---

## How to Confirm the Accounts Payable Account Currency

If the issue persists, verify the A/P account settings.

### Step One: Identify the A/P Accounts Used for Export

#### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Take note of the Accounts Payable accounts listed.

#### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Take note of the Accounts Payable accounts listed.

### Step Two: Confirm A/P Account Currency in QuickBooks Online

1. In QuickBooks Online, go to **Accounting**.
2. Select **Chart of Accounts**.
3. Locate each A/P account identified in Expensify.
4. Click **Edit**.
5. Confirm the currency matches the vendor currency and the report currency.

---

## How to Sync QuickBooks Online in Expensify

After updating vendor or A/P account currencies:

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Once the sync completes, retry exporting the report.

---

# FAQ

## Can a Vendor Have a Different Currency Than the A/P Account?

No. When exporting to an Accounts Payable account, the vendor currency must match the A/P account currency.

## Do Duplicate Vendor Records Cause Currency Errors?

Yes. If duplicate vendors share the same email but use different currencies, QuickBooks Online may select the wrong record during export, causing a currency mismatch error.
