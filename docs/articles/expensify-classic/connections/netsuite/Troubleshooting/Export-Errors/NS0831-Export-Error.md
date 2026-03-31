---
title: NS0831 Export Error in NetSuite Integration
description: Learn how to fix the NS0831 export error in NetSuite when a classification is invalid or the employee lacks access.
keywords: NS0831, NetSuite invalid classification, missing class NetSuite, employee access class NetSuite, cross-subsidiary customers projects, show projects only time and expenses, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0831 export error caused by invalid classifications or employee access restrictions. Does not cover other NetSuite error codes.
---

# NS0831 Export Error in NetSuite Integration

If you see the error:

NS0831: Invalid or missing classification. Verify it exists in NetSuite and the employee has access.

This means the classification (such as Class, Department, or Project) selected in Expensify is not valid or accessible in NetSuite.

---

## Why the NS0831 Export Error Happens in NetSuite

The NS0831 error occurs when:

- The **Class** selected in Expensify does not exist in NetSuite.
- The Class is inactive in NetSuite.
- The employee does not have access to the selected classification.
- Cross-subsidiary settings restrict the classification.
- Accounting preferences limit available projects or classifications.
- A recent change in NetSuite has not yet been synced in Expensify.

NetSuite requires that classifications exist, be active, and be accessible to the employee.

---

# How to Fix the NS0831 Export Error

## Option One: Enable Cross-Subsidiary Customers/Projects in Expensify

If using cross-subsidiary classifications:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.
7. Enable **Cross-Subsidiary Customers/Projects**.
8. Click **Save**.

Retry exporting the report.

---

## Option Two: Update NetSuite Accounting Preferences

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Accounting**.
4. Click **Accounting Preferences**.
5. Open the **Time & Expenses** tab.
6. Uncheck **Show Projects Only for Time and Expenses**.
7. Save changes.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

## Option Three: Sync After Recent Classification Changes

If the Class field or any other classification field on the employee record was recently edited:

1. Confirm the date of the last sync in Expensify.
2. In Expensify, go to **Settings**.
3. Select **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync**.

Retry exporting the report.

---

# FAQ

## Does NS0831 Mean the Class Was Deleted?

Not necessarily. The Class may exist but be inactive or inaccessible to the employee.

## Do I Need to Reconnect NetSuite?

No. Updating preferences, enabling cross-subsidiary settings, or running **Sync** typically resolves the issue.
