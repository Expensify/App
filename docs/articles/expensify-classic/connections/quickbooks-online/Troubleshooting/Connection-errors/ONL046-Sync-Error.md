---
title: ONL046 Sync Error in QuickBooks Online Integration
description: Learn what the ONL046 sync error means in QuickBooks Online and how to upgrade your subscription or adjust export settings to restore successful syncing.
keywords: ONL046, QuickBooks Online subscription error, feature not included QuickBooks, upgrade QuickBooks Online plan, QuickBooks Simple Start limitations, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL046 sync error caused by QuickBooks Online subscription limitations. Does not cover QuickBooks Desktop or other QuickBooks error codes.
---

# ONL046 Sync Error in QuickBooks Online Integration

If you see the error:

ONL046: Feature not included in QuickBooks Online subscription.

This means your QuickBooks Online subscription does not support one or more features selected in your export settings, preventing the sync from completing.

---

## Why the ONL046 Sync Error Happens in QuickBooks Online

The ONL046 error typically indicates:

- Your QuickBooks Online plan does not include a required feature.
- Your Workspace is configured to use a feature unsupported by your subscription.
- QuickBooks Online blocked the sync due to subscription limitations.

Each QuickBooks Online plan supports different accounting features. If a selected feature is unavailable in your plan, the sync fails.

Note: QuickBooks Self-Employed is not supported with Expensify.

---

## How to Fix the ONL046 Sync Error

You can resolve this by upgrading your subscription or adjusting your export settings.

1. Log in to QuickBooks Online.
2. Confirm your current subscription plan.
3. Review which features are supported by your plan.
4. Either:
   - Upgrade your QuickBooks Online subscription, or  
   - Adjust your export settings to remove unsupported features.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Confirm the sync completes successfully.

---

## QuickBooks Online Feature Support by Plan

| Feature                  | Simple Start | Essentials | Plus |
|--------------------------|--------------|------------|------|
| GL Accounts as Categories| Yes          | Yes        | Yes  |
| Classes                  | No           | No         | Yes  |
| Locations                | No           | No         | Yes  |
| Customers                | No           | No         | Yes  |
| Projects                 | No           | No         | Yes  |
| Vendor Bills             | No           | Yes        | Yes  |
| Expense Reports          | Yes          | Yes        | Yes  |
| Journal Entries          | Yes          | Yes        | Yes  |
| Credit Card Transactions | Yes          | Yes        | Yes  |
| Debit Card Transactions  | Yes          | Yes        | Yes  |
| Tax                      | Yes          | Yes        | Yes  |
| Billable                 | No           | No         | Yes  |

If you are using features such as Classes, Locations, Projects, or Billable, you must be on the QuickBooks Online Plus plan.

---

# FAQ

## Can I Retry the Sync?

Yes. After upgrading your subscription or adjusting export settings, select **Sync Now** and retry the sync.

## Does ONL046 Mean the Connection Is Broken?

No. The connection is active, but your subscription does not support a selected feature.

## Do I Need to Reconnect QuickBooks Online?

No. You only need to upgrade your QuickBooks Online subscription or adjust your export settings to use supported features.
