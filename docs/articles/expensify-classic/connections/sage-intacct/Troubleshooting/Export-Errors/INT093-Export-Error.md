---
title: INT093 Export Error in Sage Intacct Integration
description: Learn what the INT093 export error means and how to update an expired credit card in Sage Intacct before exporting from Expensify.
keywords: INT093, Sage Intacct credit card invalid, credit card expired Sage Intacct, expiration date export error, Cash Management credit card, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT093 export error caused by an expired credit card in Sage Intacct. Does not cover other Sage Intacct export, sync, or connection errors.
---

# INT093 Export Error in Sage Intacct Integration

If you see the error:

INT093 Export Error: Credit Card [X] is invalid. Please check the card’s expiration date in Sage Intacct and update it if it has expired.

This means the credit card used on the export has expired in Sage Intacct.

Sage Intacct validates the credit card during export, and an expired expiration date causes the export to fail.

---

## Why the INT093 Export Error Happens in Sage Intacct

The INT093 error indicates that the credit card referenced in the export is no longer valid in Sage Intacct because its expiration date has passed.

Sage Intacct checks the card’s default expiration date during export. If that date is in the past, the card is treated as invalid and the export fails.

This is a credit card expiration issue in Sage Intacct, not a category, tag, or employee record error.

---

## How to Fix the INT093 Export Error

Follow the steps below to update the expired credit card and retry the export.

1. In Sage Intacct, go to **Applications > Cash Management > Credit Card**.
2. Confirm the default expiration date is not in the past. If it is in the past, adjust the fields to a date well into the future and save your changes.
3. In Expensify, go to **Settings > Workspaces**, select your Workspace, click **Accounting**, and click **Sync Now**.
4. Retry exporting the report.

If the credit card’s expiration date is current in Sage Intacct and the Workspace has synced, the export should complete successfully.

---

# FAQ

## Does the INT093 Error Mean the Integration Is Disconnected?

No. The error indicates an expired credit card in Sage Intacct, not a connection issue.

## Why Do I Need to Run Sync Now After Updating the Card?

Selecting **Sync Now** refreshes the card details from Sage Intacct so the updated expiration date is reflected before you retry the export.

## What Should I Enter for the Expiration Date?

Set the default expiration date to a date well into the future so the card remains valid for current and upcoming exports.
