---
title: NS0116 Export Error in NetSuite Integration
description: Learn what the NS0116 export error means and how to use Internal IDs in NetSuite to correct invalid account mappings by subsidiary.
keywords: NS0116, NetSuite account not valid for subsidiary, Show Internal IDs NetSuite, invalid account subsidiary error, update export account Workspace, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0116 export error caused by invalid account mappings by subsidiary. Does not cover role permission or token configuration issues.
---

# NS0116 Export Error in NetSuite Integration

If you see the error:

NS0116 Export Error: The account [XXX] isn’t valid for subsidiary/entity [YYY]. In NetSuite, go to Home > Preferences, enable 'Show Internal IDs', and update the account in Expensify.

This means the selected category or export account is not available for the specified subsidiary in NetSuite.

NetSuite accounts must be associated with the correct subsidiary in order for exports to succeed.

---

## Why the NS0116 Export Error Happens in NetSuite

The NS0116 error typically occurs when:

- The category or export account selected in the Workspace is not enabled for the subsidiary in NetSuite.
- The account exists but is restricted to a different subsidiary.
- The internal ID associated with the account does not match a valid subsidiary mapping.
- The account is inactive.

If the account is not enabled for the selected subsidiary, NetSuite blocks the export.

This is an account-to-subsidiary mapping issue, not a role permission or token configuration issue.

---

## How to Fix the NS0116 Export Error

Follow the steps below to confirm the correct account mapping.

---

## Enable Show Internal IDs in NetSuite

1. Log in to NetSuite as an administrator.
2. Hover over the **Home** icon.
3. Select **Set Preferences**.
4. Enable **Show Internal IDs**.
5. Click **Save**.

This allows you to view internal IDs for accounts and categories.

---

## Verify the Account in NetSuite

1. Locate the account or category referenced in the error using the internal ID.
2. Confirm the account:
   - Exists.
   - Is active.
   - Is enabled for the correct subsidiary.
3. Update the subsidiary association if needed.
4. Click **Save**.

If the account is not valid for the subsidiary, either:

- Update the account to include the subsidiary, or  
- Select a different valid account in the Workspace.

---

## Sync the Workspace and Retry the Export

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

---

# FAQ

## Does the NS0116 Export Error Affect Only One Subsidiary?

Yes. The error applies to the specific subsidiary where the account is not valid.

## Do I Need NetSuite Admin Access to Fix the NS0116 Export Error?

Yes. Updating account and subsidiary associations in NetSuite requires administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the account mapping and selecting **Sync Now** is typically sufficient.
