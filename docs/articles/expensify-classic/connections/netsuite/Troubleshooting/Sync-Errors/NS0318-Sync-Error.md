---
title: NS0318 Sync Error in NetSuite Integration
description: Learn how to fix the NS0318 sync error in NetSuite when the Expensify Connect bundle is out of date or missing permissions.
keywords: NS0318, NetSuite permissions error, could not import items NetSuite, Expensify Connect bundle update, SuiteBundler update NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0318 sync error caused by an outdated Expensify Connect bundle or permissions issue. Does not cover other NetSuite error codes.
---

# NS0318 Sync Error in NetSuite Integration

If you see the error:

NS0318: Could not import items due to permissions error. Please update your NetSuite bundle version.

This means the Expensify Connect bundle in NetSuite is out of date or missing required permissions.

---

## Why the NS0318 Sync Error Happens in NetSuite

The NS0318 error occurs when:

- The **Expensify Connect** bundle in NetSuite is outdated.
- The NetSuite account does not have the correct permissions configured.
- An invoice is being exported from Expensify and the bundle version does not support the required functionality.

This error most commonly occurs when exporting invoices.

---

## How to Fix the NS0318 Sync Error

### Step One: Confirm the Export Type in Expensify

1. In Expensify, confirm whether you are exporting:
   - An **Invoice**, or
   - An **Expense Report**.

If exporting an **Expense Report**:

- You can ignore the error.
- Manually refresh the page to confirm the Workspace synced successfully.

If exporting an **Invoice**, continue to Step Two.

---

### Step Two: Update the Expensify Connect Bundle in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **SuiteBundler**.
4. Click **Search & Install Bundles**.
5. Go to the **List** tab.
6. Locate the **Expensify Connect** bundle.
7. Update it to the latest available version.

After updating the bundle, return to Expensify and retry the sync or export.

---

### Step Three: Reconfirm the NetSuite Connection (If Needed)

If the bundle is already up to date:

1. Review the NetSuite connection steps in Expensify.
2. Confirm each setup step was completed correctly.
3. Reconnect the integration if necessary.
4. Retry the sync.

---

# FAQ

## Does NS0318 Only Affect Invoice Exports?

Yes. This error most commonly occurs when exporting invoices and the Expensify Connect bundle is outdated.

## Do I Need to Disconnect the Integration?

Not usually. Updating the Expensify Connect bundle typically resolves the issue.
