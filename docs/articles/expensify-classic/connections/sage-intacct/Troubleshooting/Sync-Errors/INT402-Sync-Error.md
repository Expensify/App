---
title: INT402 Sync Error in Sage Intacct Integration
description: Learn what the INT402 sync error means and how to properly configure User-Defined Dimensions (UDDs) and permissions in Sage Intacct.
keywords: INT402, Sage Intacct dimension error, User-Defined Dimensions Intacct, UDD permissions Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT402 sync error caused by User-Defined Dimension configuration or permission issues. Does not cover authentication or journal configuration errors.
---

# INT402 Sync Error in Sage Intacct Integration

If you see the error:

INT402 Sync Error: Sage Intacct couldn’t return values for dimension [X]. This typically occurs when User-Defined Dimensions aren’t set up correctly or are missing permissions.

This means Expensify cannot retrieve values for a **User-Defined Dimension (UDD)** from Sage Intacct.

This usually indicates a configuration or permission issue.

---

## Why the INT402 Sync Error Happens in Sage Intacct

The INT402 error typically indicates:

- A User-Defined Dimension (UDD) is not fully configured in Sage Intacct.
- The Web Services user lacks permission to access the dimension.
- The dimension is enabled in the Workspace but not properly set up in Sage Intacct.
- Sage Intacct cannot return dimension values during sync.

If Expensify cannot access dimension values, syncing fails.

This is a User-Defined Dimension configuration or permission issue, not an authentication or journal configuration error.

---

## How to Fix the INT402 Sync Error

Follow the steps below to confirm UDD configuration and permissions.

### Confirm User-Defined Dimensions in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Platform Services > Objects > List**.
3. Filter by **User-Defined Dimensions**.
4. Locate the dimension referenced in the error message.
5. Confirm the dimension:
   - Is fully configured.
   - Is active.
   - Has appropriate permissions assigned to the Web Services user.
6. Click **Save** if changes were made.

Ensure the Web Services user has access to view and retrieve values for the dimension.

### Reconfigure the Dimension in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Disable the affected User-Defined Dimension.
7. Click **Save**.

Then re-enable or re-add the User-Defined Dimension in the **Coding** tab and click **Save** again.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Confirm the dimension values import successfully.

---

# FAQ

## Does This Error Mean the Dimension Does Not Exist?

Not necessarily. The dimension may exist but be missing permissions or not fully configured.

## Do I Need Sage Intacct Admin Access to Fix This?

You need sufficient permissions in Sage Intacct to update User-Defined Dimensions and Web Services user access.

## Do I Need to Reconnect the Integration?

No. Correcting the dimension configuration and selecting **Sync Now** is typically sufficient.
