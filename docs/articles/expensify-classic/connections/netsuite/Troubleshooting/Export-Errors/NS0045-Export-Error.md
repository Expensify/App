---
title: NS0045 Export Error in NetSuite Integration
description: Learn how to fix the NS0045 export error in NetSuite when an expense category is not linked to an active account.
keywords: NS0045, NetSuite expense category not linked, inactive account NetSuite, category not found NetSuite, sync NetSuite connection Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0045 export error caused by inactive or missing expense categories. Does not cover other NetSuite error codes.
---

# NS0045 Export Error in NetSuite Integration

If you see the error:

NS0045: The expense category isn’t linked to an active NetSuite account. Verify the category in NetSuite, sync your connection in Expensify, and try exporting again.

This means the category selected on the report is not linked to an active account in NetSuite.

---

## Why the NS0045 Export Error Happens in NetSuite

The NS0045 error occurs when:

- The expense category used in Expensify does not exist in NetSuite.
- The linked NetSuite account has been made inactive.
- The category was renamed in NetSuite and has not been synced.
- The integration has not been refreshed after account changes.

NetSuite requires all exported categories to be tied to active accounts.

---

## How to Fix the NS0045 Export Error

### Step One: Confirm the Category in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Navigate to the **Chart of Accounts** or expense account list.
3. Locate the account associated with the category used on the report.
4. Confirm:
   - The account exists.
   - The account is active.
   - The account name matches the category in Expensify.

If the account is inactive, reactivate it.  
If it does not exist, create it with the appropriate configuration.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

This refreshes the account list from NetSuite.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct category is selected.
3. Retry exporting the report.

Once the category is linked to an active NetSuite account, the export should complete successfully.

---

# FAQ

## Does NS0045 Mean My Integration Is Broken?

No. This error usually indicates a missing or inactive account in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Running **Sync** after confirming the category is active typically resolves the issue.
