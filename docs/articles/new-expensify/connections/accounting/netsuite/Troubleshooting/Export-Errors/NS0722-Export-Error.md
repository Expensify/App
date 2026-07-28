---
title: NS0722 Export Error in NetSuite Integration
description: Learn what the NS0722 export error means and how to set a valid Default Payable Account for expense reports or corporate card expenses in NetSuite.
keywords: NS0722, NetSuite invalid payable account, Default Payable Account for Expense Reports NetSuite, Default Account for Corporate Card Expenses NetSuite, subsidiary payable account NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0722 export error caused by invalid or inactive default payable account settings at the subsidiary level. Does not cover vendor mapping or expense category configuration issues.
---

# NS0722 Export Error in NetSuite Integration

If you see the error:

NS0722 Export Error: The report was exported to an invalid payable account (ID [XXX]). Please set a valid 'Default Payable Account' for Expense Reports in NetSuite.

This means the default payable account configured in NetSuite is invalid or inactive.

NetSuite requires an active default payable account at the subsidiary level for certain export types.

---

## Why the NS0722 Export Error Happens in NetSuite

The NS0722 error typically occurs when:

- The **Default Payable Account for Expense Reports** is inactive or invalid.
- The **Default Account for Corporate Card Expenses** is inactive or not selected.
- The account associated with the subsidiary has been deleted or restricted.
- The export is attempting to post to an account not enabled for the subsidiary.

If the selected account is inactive or no account is set, NetSuite blocks the export.

This is a subsidiary-level configuration issue, not a vendor mapping or expense category configuration issue.

---

## How to Fix the NS0722 Export Error

Follow the steps below to update the default payable account settings in NetSuite.

---

## Review Subsidiary Preferences in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Company > Subsidiaries**.
3. Select the relevant subsidiary.
4. Click **Edit**.
5. Expand the **Preferences** section.

Then confirm:

- If exporting as an **Expense Report**, the account listed under **Default Payable Account for Expense Reports** is active.
- If exporting **Corporate Card transactions**, the account listed under **Default Account for Corporate Card Expenses** is active.

If the account is inactive:

- Select a new, active account.

If no account is selected:

- Choose an appropriate active account.
- Click **Save**.

---

## Sync the Workspace and Retry the Export

After updating the subsidiary settings:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Then retry exporting the report.

If the subsidiary has a valid, active default payable account, the export should complete successfully.

---

# FAQ

## Does the NS0722 Export Error Affect All Export Types?

It affects expense report and corporate card exports that rely on subsidiary-level default payable account settings.

## Do I Need NetSuite Admin Access to Fix the NS0722 Export Error?

Yes. Updating subsidiary preferences in NetSuite requires administrator-level permissions.

## Do I Need to Reconnect the Integration?

No. Updating the default payable account and selecting **Sync Now** is typically sufficient.
