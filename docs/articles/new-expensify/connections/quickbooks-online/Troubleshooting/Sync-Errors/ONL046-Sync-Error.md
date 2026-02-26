---
title: ONL046 Sync Error in QuickBooks Online
description: Learn how to fix the ONL046 sync error in QuickBooks Online when your subscription plan does not support certain features.
keywords: ONL046, QuickBooks Online subscription error, feature not included QuickBooks plan, upgrade QuickBooks version, QuickBooks Online plan comparison, Expensify QuickBooks Online sync error, Workspace Admin, accounting sync error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL046 sync error caused by unsupported QuickBooks Online subscription features. Does not cover other sync or export error codes.
---

# ONL046 Sync Error in QuickBooks Online

If you see the error:

ONL046: Feature not included in QuickBooks Online subscription. Please upgrade QuickBooks version.

This means your QuickBooks Online subscription plan does not support a feature currently being used in Expensify.

---

## Why the ONL046 Sync Error Happens in QuickBooks Online

The ONL046 error occurs when:

- A feature enabled in Expensify is not supported by your QuickBooks Online subscription plan.
- Your QuickBooks Online version does not include functionality such as Classes, Locations, Projects, or Vendor Bills.

Note: QuickBooks Self-Employed is not supported.

---

## How to Fix the ONL046 Sync Error

1. Log in to QuickBooks Online.
2. Confirm your current subscription plan.
3. Review which features are supported by your plan.
4. Upgrade your QuickBooks Online subscription if needed to support the feature you are using in Expensify.

Refer to the table below for supported features by plan.

---

## QuickBooks Online Feature Support by Plan

| Feature                     | Simple Start | Essentials | Essentials Plus |
|------------------------------|--------------|------------|------------------|
| GL Accounts as Categories    | Yes          | Yes        | Yes              |
| Classes                      | No           | No         | Yes              |
| Locations                    | No           | No         | Yes              |
| Customers                    | No           | No         | Yes              |
| Projects                     | No           | No         | Yes              |
| Vendor Bills                 | No           | Yes        | Yes              |
| Expense Reports              | Yes          | Yes        | Yes              |
| Journal Entries              | Yes          | Yes        | Yes              |
| Credit Card Transactions     | Yes          | Yes        | Yes              |
| Debit Card Transactions      | Yes          | Yes        | Yes              |
| Tax                          | Yes          | Yes        | Yes              |
| Billable                     | No           | No         | Yes              |

If you are attempting to use a feature marked “No” under your plan, you must upgrade your QuickBooks Online subscription to resolve the sync error.

---

# FAQ

## Is QuickBooks Self-Employed Supported?

No. QuickBooks Self-Employed is not supported with the Expensify QuickBooks Online integration.

## Do I Need to Reconnect After Upgrading My Plan?

After upgrading your QuickBooks Online subscription, run **Sync now** in Expensify to refresh available features and retry your export or sync.
