---
title: NS0898 Sync Error in NetSuite Integration
description: Learn what the NS0898 sync error means and how to align approval level settings between the Workspace and NetSuite.
keywords: NS0898, NetSuite approval settings error, incorrect approval level NetSuite, adjust approval level Workspace Accounting Advanced, NetSuite approval mismatch export error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0898 sync error caused by mismatched approval level configuration between the Workspace and NetSuite. Does not cover token permissions or bundle update issues.
---

# NS0898 Sync Error in NetSuite Integration

If you see the error:

NS0898 Sync Error: Incorrect approval settings. Please adjust approval level in either NetSuite or Expensify configurations.

This means the approval settings in the Workspace do not match your approval configuration in NetSuite.

When approval levels are misaligned, NetSuite will block the export or sync.

---

## Why the NS0898 Sync Error Happens in NetSuite

The NS0898 error typically occurs when:

- The approval level selected in the Workspace does not match NetSuite’s approval workflow.
- NetSuite requires a transaction to be **Approved for Posting**, but the Workspace is set to a lower approval level.
- The export type (Expense report, Vendor bill, or Journal entry) is configured with an incompatible approval status.

If NetSuite expects a different approval state than what the Workspace sends, the sync fails.

This is an approval configuration mismatch, not a token or bundle issue.

---

## How to Fix the NS0898 Sync Error

You need to align the approval level in the Workspace with your NetSuite approval workflow.

---

## Update Approval Levels in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Locate the approval level settings for:
   - **Expense reports**
   - **Vendor bills**
   - **Journal entries**
6. Adjust the approval level so it matches what NetSuite requires.
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Update the approval level for the relevant export type.
6. Tap **Save**.

---

## Sync the Workspace and Retry

After updating the approval level:

1. Go to **Workspaces > Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.
4. Retry the export.

If the approval levels are aligned, the sync should complete successfully.

---

# FAQ

## Should I Update Approval Settings in NetSuite or the Workspace?

You can update either side, but both systems must match. Most commonly, the adjustment is made in the Workspace under **Accounting > Advanced**.

## Does the NS0898 Sync Error Affect All Export Types?

It can. Any export type with mismatched approval settings may fail until the configuration is aligned.

## Do I Need NetSuite Admin Access to Fix the NS0898 Sync Error?

Not usually. You typically only need Workspace Admin access to update approval level settings.
