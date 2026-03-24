---
title: NS0116 Export Error in NetSuite Integration
description: Learn how to fix the NS0116 export error in NetSuite when an account is not valid for the selected subsidiary.
keywords: NS0116, NetSuite account not valid for subsidiary, show internal IDs NetSuite, update export account Expensify, category not available subsidiary NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0116 export error caused by account and subsidiary mismatches. Does not cover other NetSuite error codes.
---

# NS0116 Export Error in NetSuite Integration

If you see the error:

NS0116: The account [XXX] isn’t valid for subsidiary/entity [YYY]. In NetSuite, go to Home > Preferences, enable 'Show Internal IDs', and update the account in Expensify.

This means the category or export account selected in Expensify is not available for the selected subsidiary in NetSuite.

---

## Why the NS0116 Export Error Happens in NetSuite

The NS0116 error occurs when:

- The selected account is not assigned to the subsidiary used in Expensify.
- The account exists in NetSuite but is restricted to a different subsidiary.
- The export account was changed in NetSuite but the Workspace was not synced.
- The account’s internal ID no longer matches the imported configuration.

NetSuite requires that accounts used in exports be available to the specific subsidiary.

---

## How to Fix the NS0116 Export Error

### Step One: Enable Internal IDs in NetSuite

1. Log in to **NetSuite**.
2. Hover over the **Home** (house icon).
3. Click **Set Preferences**.
4. Enable **Show Internal IDs**.
5. Save your changes.

This allows you to identify the exact account referenced in the error message.

---

### Step Two: Verify the Account in NetSuite

1. Locate the internal ID referenced in the error.
2. Open the corresponding account in NetSuite.
3. Confirm the account is:
   - Active.
   - Assigned to the correct subsidiary.
4. If needed, update the account to include the subsidiary used in Expensify.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct category or export account is selected.
3. Retry exporting to NetSuite.

Once the account is valid for the selected subsidiary, the export should complete successfully.

---

# FAQ

## Does NS0116 Mean the Account Was Deleted?

Not necessarily. The account may exist but is not assigned to the correct subsidiary.

## Do I Need to Reconnect NetSuite?

No. Updating the account assignment and running **Sync** is usually sufficient.
