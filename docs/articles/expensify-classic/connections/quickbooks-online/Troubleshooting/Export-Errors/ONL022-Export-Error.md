---
title: ONL022 Export Error in QuickBooks Online Integration
description: Learn what the ONL022 export error means in QuickBooks Online and how to enable billable settings for the selected account to restore successful exports.
keywords: ONL022, QuickBooks Online export error, account must be marked as billable, enable billable QuickBooks Online, billable expense export error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL022 export error caused by billable account configuration settings. Does not cover other QuickBooks Online error codes.
---

# ONL022 Export Error in QuickBooks Online Integration

If you see the error:

ONL022: Account must be marked as billable in QuickBooks Online.

This means the account category applied to an expense is not configured to support billable expenses in QuickBooks Online, preventing the export from completing.

---

## Why the ONL022 Export Error Happens in QuickBooks Online

The ONL022 error typically indicates:

- Billable functionality is not enabled in QuickBooks Online.
- The selected account in the Chart of Accounts does not support billable expenses.
- QuickBooks Online validation failed due to incorrect billable configuration.

When exporting billable expenses, QuickBooks Online requires both company-level billable settings and account-level configuration to be enabled.

This is a QuickBooks Online configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL022 Export Error

This issue must be resolved in QuickBooks Online.

### Enable Billable Expenses

1. Log in to QuickBooks Online.
2. Select the **Gear icon**.
3. Go to **Account and Settings**.
4. Select the **Expenses** tab.
5. Enable **Make expenses and items billable**.
6. Save your changes.

### Update the Account in the Chart of Accounts

1. Go to the **Chart of Accounts**.
2. Locate the account used for the expense category.
3. Select **Edit**.
4. Ensure the account supports billable expenses.
5. Select the appropriate **Income account** if required.
6. Save your changes.

After updating QuickBooks Online:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After enabling billable functionality and selecting **Sync Now**, retry the export. If the error persists, confirm the correct account is configured.

## Does ONL022 Mean My Plan Does Not Support Billable?

Not necessarily. It usually means billable settings are not enabled or the account is not configured correctly.

## Is ONL022 Caused by Workspace Settings?

No. ONL022 is triggered by billable configuration settings in QuickBooks Online. Workspace accounting settings are not the cause.
